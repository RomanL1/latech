package com.latech.renderer.api;

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

import static com.latech.renderer.config.RabbitMQConfig.DOCUMENT_EXCHANGE;


@Service
@Slf4j
public class PdfRequestListener {
    private final S3Client s3Client;
    private final CompileJobOrchestrator compileJobOrchestrator;

    @Value( "${seaweedfs.bucket}" )
    private String bucket;

    public PdfRequestListener ( S3Client s3Client, CompileJobOrchestrator compileJobOrchestrator ) {
        this.s3Client = s3Client;
        this.compileJobOrchestrator = compileJobOrchestrator;
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

            //TODO: we throw payload at our orchestrator and ack the msg here.
            // don't forget to create something that signals to api in the @PostConstruct that the OngoingCompileTracker has to be reset.
            this.compileJobOrchestrator.submit( payload );
        } catch ( Exception e ) {
            log.error( e.getMessage() );
            throw e;
        }
    }
}
