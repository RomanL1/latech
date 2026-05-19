package com.latech.renderer.api;

import com.google.protobuf.Timestamp;
import com.latech.renderer.business.*;
import com.rabbitmq.client.Channel;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.BucketAlreadyExistsException;
import software.amazon.awssdk.services.s3.model.BucketAlreadyOwnedByYouException;

import java.io.IOException;
import java.nio.file.Path;
import java.time.Instant;

import static com.latech.renderer.api.PdfMetadata.Status.ERROR_WHILE_RENDERING;
import static com.latech.renderer.api.PdfMetadata.Status.SUCCESSFULLY_RENDERED;
import static com.latech.renderer.config.RabbitMQConfig.DOCUMENT_EXCHANGE;


@Service
@Slf4j
public class PdfRequestListener {
    private final PdfCompiledMessageProducer pdfCompiledMessageProducer;
    private final S3Client s3Client;
    private final ContainerCreatingPDFJobWorker containerCreatingPDFJobWorker;

    @Value( "${seaweedfs.bucket}" )
    private String bucket;

    public PdfRequestListener ( PdfCompiledMessageProducer pdfCompiledMessageProducer, S3Client s3Client, ContainerCreatingPDFJobWorker containerCreatingPDFJobWorker ) {
        this.pdfCompiledMessageProducer = pdfCompiledMessageProducer;
        this.s3Client = s3Client;
        this.containerCreatingPDFJobWorker = containerCreatingPDFJobWorker;
    }

    @PostConstruct
    void init () {
        int maxRetries = 10;
        int retryDelayMs = 5000;
        for (int i = 0; i < maxRetries; i++) {
            try {
                s3Client.createBucket( b -> b.bucket( this.bucket ) );
                log.info( "Successfully initialized bucket: {}", this.bucket );
                return;
            } catch ( BucketAlreadyOwnedByYouException | BucketAlreadyExistsException e ) {
                log.info( "Bucket already exists, that's fine." );
                return;
            } catch ( Exception e ) {
                log.warn( "Failed to create bucket (attempt {}/{}). Retrying in {}ms: {}", i + 1, maxRetries,
                          retryDelayMs, e.getMessage() );
                try {
                    Thread.sleep( retryDelayMs );
                } catch ( InterruptedException ie ) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException( "Interrupted while waiting to initialize bucket", ie );
                }
            }
        }
        log.error( "Failed to initialize bucket after {} attempts", maxRetries );
    }

    @RabbitListener( queues = DOCUMENT_EXCHANGE )
    public void handlePdfRequest ( byte[] payloadBytes, Channel channel, @Header( AmqpHeaders.DELIVERY_TAG ) long tag ) throws Exception {
        DocumentRecord payload = null;
        try {
            payload = DocumentRecord.parseFrom( payloadBytes );
            CompileResult result = this.containerCreatingPDFJobWorker.compile( payload );

            Timestamp timestamp = Timestamp.newBuilder()
                    .setSeconds( Instant.now().getEpochSecond() )
                    .setNanos( Instant.now().getNano() )
                    .build();

            if ( !result.success() ) {
                log.warn( "Compilation failed for document {}", payload.getDocumentId() );
                this.pdfCompiledMessageProducer.handlePdfCompiled(
                        payload.getRenderId(),
                        payload.getDocumentId(),
                        "",
                        timestamp,
                        ERROR_WHILE_RENDERING,
                        result.output() );
                try {
                    FileWorker.cleanup( payload.getRenderId() );
                } catch ( IOException e ) {
                    log.error( "Exception while trying to cleanup files after unsuccessful compilation: " + e );
                }
                return;
            }

            Path pdfPath = result.pdfPath();
            String payloadS3Key = payload.getDocumentId() + ".pdf";

            s3Client.putObject(
                    b -> b.bucket( this.bucket ).key( payloadS3Key ),
                    pdfPath );

            this.pdfCompiledMessageProducer.handlePdfCompiled(
                    payload.getRenderId(),
                    payload.getDocumentId(),
                    payloadS3Key,
                    timestamp,
                    SUCCESSFULLY_RENDERED,
                    result.output() );

            try {
                FileWorker.cleanup( payload.getRenderId() );
            } catch ( IOException e ) {
                log.error( "Could not delete files in workdir.", e );
            }
        } catch ( Exception e ) {
            log.error( e.getMessage() );

            Timestamp timestamp = Timestamp.newBuilder()
                    .setSeconds( Instant.now().getEpochSecond() )
                    .setNanos( Instant.now().getNano() )
                    .build();

            this.pdfCompiledMessageProducer.handlePdfCompiled(
                    payload != null ? payload.getRenderId() : "",
                    payload != null ? payload.getDocumentId() : "",
                    "",
                    timestamp,
                    ERROR_WHILE_RENDERING,
                    "Internal renderer error: " + e.getMessage() );

            try {
                assert payload != null;
                FileWorker.cleanup( payload.getRenderId() );
            } catch ( IOException ex ) {
                log.error( "Could not delete files in workdir. ", ex );
            }
            // DO REJECT here, spring handles this if we throw
            throw e;
        }
    }
}
