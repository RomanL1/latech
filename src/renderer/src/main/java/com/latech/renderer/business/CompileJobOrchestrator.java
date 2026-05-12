package com.latech.renderer.business;

import com.google.protobuf.Timestamp;
import com.latech.renderer.api.DocumentRecord;
import com.latech.renderer.api.PdfMetadata;
import com.latech.renderer.model.CompileJob;
import com.latech.renderer.model.JobStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.*;


@Service
@Slf4j
public class CompileJobOrchestrator {

    private final Map<UUID, CompileJob> ongoingCompileJobs;
    private final ExecutorService workerPool;
    private final S3Service s3Service;
    private final ContainerService containerService;
    private final FileWorker fileWorker;
    private final PdfCompiledMessageProducer pdfCompiledMessageProducer;
    private final Semaphore s3Semaphore;
    private final Semaphore compileContainerSemaphore;

    public CompileJobOrchestrator(S3Service s3Service, ContainerService containerService,
            PdfCompiledMessageProducer pdfCompiledMessageProducer,
            FileWorker fileWorker){
        this.ongoingCompileJobs = new ConcurrentHashMap<>();
        this.workerPool = Executors.newVirtualThreadPerTaskExecutor();
        this.s3Service = s3Service;
        this.containerService = containerService;
        this.fileWorker = fileWorker;
        this.pdfCompiledMessageProducer = pdfCompiledMessageProducer;
        this.s3Semaphore = new Semaphore( 10 );
        this.compileContainerSemaphore = new Semaphore( 2 );
    }

    public void submit( DocumentRecord documentRecord){
        CompileJob compileJob = new CompileJob( documentRecord.getDocumentId(), documentRecord.getRenderId(),
                                                documentRecord.getLatexContent(), documentRecord.getImagesMap());
        this.ongoingCompileJobs.put( UUID.fromString(compileJob.getRenderId()), compileJob );
        transition(compileJob);
    }

    public void transition( CompileJob compileJob ){
        log.info("transitioning compileJob with renderId {} and JobStatus {}", compileJob.getRenderId(), compileJob.getJobStatus());
        switch(compileJob.getJobStatus()){
            case STARTING -> startFileSetup( compileJob );
            case FILE_SETUP_DONE -> doCompile( compileJob );
            case COMPILING_DONE -> uploadPdf( compileJob );
            case UPLOADING_DONE -> onSuccess( compileJob );
            case RETRYING -> reset( compileJob );
            case FAILED -> onFailure( compileJob );
        }
    }

    private void startFileSetup( CompileJob compileJob ){
        CompletableFuture.runAsync(() -> {
            try {
                this.fileWorker.setupWorkDir( compileJob );
                this.fileWorker.setupTexFileAndLogFile( compileJob );
                if ( compileJob.getImages().isPresent() ){
                    this.s3Semaphore.acquire();
                    try {
                        this.fileWorker.setupImages( compileJob );
                    }finally{
                        this.s3Semaphore.release();
                    }
                }
                compileJob.setJobStatus( JobStatus.FILE_SETUP_DONE );
                transition( compileJob );
            } catch ( InterruptedException | IOException e ) {
                Thread.currentThread().interrupt();
                throw new RuntimeException( e );
            }
        }, this.workerPool)
            .exceptionally(ex -> {
                log.error("Exception while setting up files for RenderId {}", compileJob.getRenderId(), ex);
                compileJob.setJobStatus( JobStatus.RETRYING );
                compileJob.setException( ex );
                transition( compileJob );
            return null;
            });
    }

    private void doCompile( CompileJob compileJob ){
        CompletableFuture.runAsync(() -> {
            try{
                this.compileContainerSemaphore.acquire();
            } catch ( InterruptedException e ) {
                Thread.currentThread().interrupt();
                throw new RuntimeException( e );
            }
            boolean containerStarted = false;
            try {
                this.containerService.startContainer( compileJob );
                containerStarted = true;
            } catch ( IOException e ) {
                throw new RuntimeException( e );
            }finally {
                if (!containerStarted) {
                    this.compileContainerSemaphore.release(); //only release if we threw during startContainer. With no container we'd have no other release.
                }
            }
        }, this.workerPool)
            .exceptionally(ex -> {
                log.error("Exception while trying to start Container for renderId {}", compileJob.getRenderId(), ex);
                compileJob.setJobStatus( JobStatus.RETRYING );
                compileJob.setException( ex );
                transition( compileJob );
                return null;
           });
    }

    public void onContainerExit(String renderId, int exitCode) {
        CompletableFuture.runAsync(() -> {
            this.compileContainerSemaphore.release();
            CompileJob compileJob = ongoingCompileJobs.get( UUID.fromString( renderId ) );
            long containerEndTime = System.currentTimeMillis();

            Instant instantNow = Instant.now();
            Timestamp protobufTimestamp = Timestamp.newBuilder()
                    .setSeconds( instantNow.getEpochSecond() )
                    .setNanos( instantNow.getNano() )
                    .build();

            if ( compileJob == null ) {
                log.error( "RenderId from DockerEventsListener not found in CompileJobMap: {}", renderId );
                return;
            }
            String compileLog = "";
            try {
                compileLog = Files.readString( compileJob.getCompileLogPath() );
            } catch ( IOException e ) {
                log.error( "Exception while trying to read log of renderId {}, logPath {}", renderId, compileJob.getCompileLogPath(), e );
            }

            if ( exitCode == 0 ) {
                log.info( "Compilation for renderId {} finished after {} ms", compileJob.getRenderId(),
                          containerEndTime - compileJob.getContainerStartTime() );
                Path pdfPath = compileJob.getCompileDir().resolve( compileJob.getDocumentId() + ".pdf" );

                compileJob.setPdfPath( pdfPath );
                compileJob.setCompileTimestamp( protobufTimestamp );
                compileJob.setCompileOutput( compileLog );
                compileJob.setJobStatus( JobStatus.COMPILING_DONE );
                transition( compileJob );
            } else {
                log.error( "Failure for compile-container with renderId {} and ExitCode: {}", compileJob.getRenderId(),
                           exitCode );
                compileJob.setPdfPath( null );
                compileJob.setCompileTimestamp( protobufTimestamp );
                compileJob.setCompileOutput( compileLog );
                compileJob.setJobStatus( JobStatus.RETRYING );
                if (exitCode == 124 || exitCode == 137 || exitCode == 143){
                    // 124 is timeout which is our expected value if our OS timeout triggers, 137 -> SIGKILL and 143 -> SIGTERM are here just to be sure.
                    log.error("Container timed out, setting status FAILED immediately for renderId: {}", compileJob.getRenderId());
                    compileJob.setJobStatus( JobStatus.FAILED );
                }
                transition( compileJob );
            }
        }, this.workerPool)
            .exceptionally(ex -> {
                log.error("Exception during onContainerExit for renderId {}", renderId, ex);
                CompileJob compileJob = ongoingCompileJobs.get( UUID.fromString( renderId ));
                if (compileJob == null){
                    log.error("CompileJob for renderId {} not found in ongoingCompileJobMap. No retry possible - abort.", renderId);
                    return null;
                }
                compileJob.setJobStatus( JobStatus.RETRYING );
                compileJob.setException( ex );
                transition( compileJob );
                return null;
            });
    }

    private void uploadPdf( CompileJob compileJob ){
        CompletableFuture.runAsync(() -> {
            String s3PdfKey = compileJob.getDocumentId() + ".pdf";

            try {
                this.s3Semaphore.acquire();
            } catch ( InterruptedException e ) {
                Thread.currentThread().interrupt();
                throw new RuntimeException( e );
            }
            try {
                this.s3Service.saveFileToS3( s3PdfKey, compileJob.getPdfPath());
            }finally {
                this.s3Semaphore.release();
            }
            compileJob.setS3PdfKey( s3PdfKey );
            compileJob.setJobStatus( JobStatus.UPLOADING_DONE );
            transition( compileJob );
        }, this.workerPool)
            .exceptionally(ex -> {
                log.error("Exception while uploading pdf for documentId {};", compileJob.getDocumentId(), ex);
                compileJob.setJobStatus( JobStatus.RETRYING );
                compileJob.setException( ex );
                transition( compileJob );
                return null;
            });
    }

    private void onSuccess( CompileJob compileJob ){
        CompletableFuture.runAsync(() -> {
            this.pdfCompiledMessageProducer.handlePdfCompiled(
                    compileJob.getRenderId(),
                    compileJob.getDocumentId(),
                    compileJob.getS3PdfKey(),
                    compileJob.getCompileTimestamp().orElseThrow(),
                    PdfMetadata.Status.SUCCESSFULLY_RENDERED,
                    compileJob.getCompileOutput());
            try {
                FileWorker.cleanupWorkDir( compileJob );
                this.ongoingCompileJobs.remove( UUID.fromString(compileJob.getRenderId()) );
            } catch ( IOException e ) {
                throw new RuntimeException( e );
        }}, this.workerPool)
            .exceptionally(ex -> {
                log.error("Exception during onSuccess for renderId {};", compileJob.getRenderId(), ex);
                compileJob.setJobStatus( JobStatus.RETRYING );
                compileJob.setException( ex );
                transition( compileJob );
                return null;
            });
    }

    private void reset( CompileJob compileJob ){
        CompletableFuture.runAsync(() -> {
            compileJob.incRetries();
            if (compileJob.getRetries() > 2){
                compileJob.setJobStatus( JobStatus.FAILED );
            }else{
                compileJob.setJobStatus( JobStatus.STARTING );
            }

            try {
                FileWorker.cleanupWorkDir( compileJob );
            } catch ( IOException e ) {
                log.error( "could not delete WorkDir for renderId {};", compileJob.getRenderId(), e );
                throw new RuntimeException( e );
            }

            transition( compileJob );
        }, this.workerPool)
            .exceptionally(ex -> {
                log.error( "Exception during reset for renderId: {}; ", compileJob.getRenderId(), ex );
                if (compileJob.getJobStatus() != JobStatus.FAILED) {
                    compileJob.setJobStatus( JobStatus.RETRYING );
                }
                compileJob.setException( ex );
                transition( compileJob );
                return null;
            });
    }

    private void onFailure( CompileJob compileJob ){
        CompletableFuture.runAsync(() -> {

            Timestamp timestamp = compileJob.getCompileTimestamp().isPresent() ?
                    compileJob.getCompileTimestamp().orElseThrow() :
                    Timestamp.newBuilder().setSeconds( Instant.now().getEpochSecond() ).setNanos( Instant.now().getNano() ).build();

            String compileLog = !compileJob.getCompileOutput().isEmpty() ?
                    compileJob.getCompileOutput() :
                    compileJob.getException().isPresent() ?
                            compileJob.getException().toString() :
                            "";

            this.pdfCompiledMessageProducer.handlePdfCompiled(
                    compileJob.getRenderId(),
                    compileJob.getDocumentId(),
                    compileJob.getS3PdfKey(),
                    timestamp,
                    PdfMetadata.Status.ERROR_WHILE_RENDERING,
                    compileLog);

            this.ongoingCompileJobs.remove( UUID.fromString(compileJob.getRenderId()));
        }, this.workerPool)
            .exceptionally(ex -> {
                log.error("Exception during onFailure for renderId: {}; ", compileJob.getRenderId(), ex);
                this.ongoingCompileJobs.remove( UUID.fromString(compileJob.getRenderId()));
                try {
                    FileWorker.cleanupWorkDir( compileJob );
                } catch ( IOException e ) {
                    throw new RuntimeException( e );
                }
                return null;
            });
    }

    @Scheduled(fixedDelay = 60000)
    public void watchdog() {
        Instant cutoff = Instant.now().minus( 2, ChronoUnit.MINUTES);
        this.ongoingCompileJobs.values().stream()
                .filter(job -> job.getJobStatus() == JobStatus.FILE_SETUP_DONE)
                .filter(job -> job.getContainerStartTime() != null)
                .filter(job -> Instant.ofEpochMilli( job.getContainerStartTime()).isBefore(cutoff))
                .forEach(job -> {
                    log.warn("job {} timed out in FILE_SETUP_DONE (-> compiling) state, killing container: {}", job.getRenderId(), job.getContainerName());
                    this.compileContainerSemaphore.release();
                    job.setJobStatus(JobStatus.RETRYING);
                    this.containerService.stopContainer( job.getContainerName() );
                    transition(job);
                });
    }
}
