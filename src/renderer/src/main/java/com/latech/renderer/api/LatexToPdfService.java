package com.latech.renderer.api;

import com.latech.pdf.v1.*;
import com.latech.renderer.application.JobCache;
import com.latech.renderer.application.PdfJobManager;
import com.latech.renderer.model.Entry;
import com.latech.renderer.model.QueueFullException;
import com.latech.renderer.model.State;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;
import org.springframework.grpc.server.service.GrpcService;

@GrpcService
@Slf4j
public class LatexToPdfService extends PdfServiceGrpc.PdfServiceImplBase {
    private final PdfJobManager pdfJobManager;
    private final JobCache jobCache;

    public LatexToPdfService(PdfJobManager pdfJobManager, JobCache jobCache) {
        this.pdfJobManager = pdfJobManager;
        this.jobCache = jobCache;
    }

    @Override
    public void createPdfJob(CreatePdfJobRequest req, StreamObserver<CreatePdfJobResponse> obs) {
        try {
            String id = this.pdfJobManager.enqueue(req.getContent());
            obs.onNext(CreatePdfJobResponse.newBuilder().setJobId(id).build());
            obs.onCompleted();
        } catch (QueueFullException e) {
            obs.onError(Status.RESOURCE_EXHAUSTED
                    .withDescription(e.getMessage())
                    .asRuntimeException());
            log.debug("Jobqueue full: ", e);
        } catch (Exception e) {
            obs.onError(Status.INTERNAL
                    .withDescription("Unexpected error")
                    .withCause(e)
                    .asRuntimeException());
            log.debug("Exception while trying to queue a job: ", e);
        }
    }

    @Override
    public void getJobStatus(GetJobStatusRequest req, StreamObserver<GetJobStatusResponse> obs) {

        jobCache.get(req.getJobId())
                .ifPresentOrElse(
                        job -> {
                            obs.onNext(GetJobStatusResponse.newBuilder()
                                    .setJobId(req.getJobId())
                                    .setState(toProtoState(job.state().name()))
                                    .setMessage(job.message())
                                    .build());
                            obs.onCompleted();
                        },
                        () -> obs.onError(Status.NOT_FOUND
                                .withDescription("Unknown jobId")
                                .asRuntimeException())
                );
    }

    @Override
    public void getPdf(GetPdfRequest req, StreamObserver<GetPdfChunk> obs) {

        var jobOptional = jobCache.get(req.getJobId());
        if (jobOptional.isEmpty()){
            obs.onError(Status.NOT_FOUND
                    .withDescription("unknown JobId")
                    .asRuntimeException());
            return;
        }

        Entry job = jobOptional.get();

        switch(job.state()){
            case State.RUNNING, State.QUEUED -> {
                obs.onError(Status.FAILED_PRECONDITION
                        .withDescription("Not ready")
                        .asRuntimeException());
            }
            case State.FAILED -> {
                obs.onError(Status.INTERNAL
                        .withDescription("Failed: " + job.message())
                        .asRuntimeException());

                //TODO(marc): do we delete the entry here? API needs to handle failed jobs correctly.
                jobCache.deleteEntry(req.getJobId());
            }

            case State.DONE -> {
                //TODO(marc): maybe don't load entire pdf, instead stream it from disc aswell.
                byte[] pdf = job.pdfBytes();
                int chunkSize = 64 * 1024;
                for (int i = 0; i < pdf.length; i += chunkSize) {
                    int len = Math.min(chunkSize, pdf.length - i);
                    obs.onNext(GetPdfChunk.newBuilder()
                            .setData(com.google.protobuf.ByteString.copyFrom(pdf, i, len))
                            .build());
                }
                obs.onCompleted();

                //TODO(marc): delete pdf from disc if we store only the path in store.
                // assuming API handles getting the file once and redirects following requests away from renderer.
                jobCache.deleteEntry(req.getJobId());
            }
        }
    }

    private static JobState toProtoState(String s) {
        return switch (s) {
            case "QUEUED" -> JobState.QUEUED;
            case "RUNNING" -> JobState.RUNNING;
            case "DONE" -> JobState.DONE;
            case "FAILED" -> JobState.FAILED;
            default -> JobState.JOB_STATE_UNSPECIFIED;
        };
    }
}
