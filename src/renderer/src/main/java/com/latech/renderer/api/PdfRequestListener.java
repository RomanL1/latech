package com.latech.renderer.api;

import static com.latech.renderer.api.PdfMetadata.Status.ERROR_WHILE_RENDERING;
import static com.latech.renderer.api.PdfMetadata.Status.SUCCESSFULLY_RENDERED;
import static com.latech.renderer.config.RabbitMQConfig.DOCUMENT_EXCHANGE;

import com.google.protobuf.Timestamp;
import com.latech.renderer.business.NaivePDFJobWorker;
import com.latech.renderer.business.PdfCompiledMessageProducer;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.handler.annotation.Header;

import com.rabbitmq.client.Channel;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.BucketAlreadyExistsException;
import software.amazon.awssdk.services.s3.model.BucketAlreadyOwnedByYouException;

import java.io.IOException;
import java.nio.file.Path;
import java.time.Instant;


@Service
@Slf4j
public class PdfRequestListener
{
    private final PdfCompiledMessageProducer pdfCompiledMessageProducer;
    private final S3Client s3Client;

    @Value("${seaweedfs.bucket}")
    private String bucket;

    public PdfRequestListener(PdfCompiledMessageProducer pdfCompiledMessageProducer, S3Client s3Client){
        this.pdfCompiledMessageProducer = pdfCompiledMessageProducer;
        this.s3Client = s3Client;
    }

    @PostConstruct
    void init(){
        try {
            s3Client.createBucket(b -> b.bucket(this.bucket));
        } catch (BucketAlreadyOwnedByYouException | BucketAlreadyExistsException e) {
            log.info("Bucket already exists, that's fine.");
        }
    }

    @RabbitListener( queues = DOCUMENT_EXCHANGE )
    public void handlePdfRequest ( byte[] payloadBytes, Channel channel, @Header( AmqpHeaders.DELIVERY_TAG ) long tag ) throws Exception {
        DocumentRecord payload = null;
        try{
            payload = DocumentRecord.parseFrom(payloadBytes);
            log.info("Received payload with documentId: " + payload.getDocumentId());
            Path pdfPath = NaivePDFJobWorker.compile(payload);

            Timestamp timestamp = Timestamp.newBuilder()
                    .setSeconds(Instant.now().getEpochSecond())
                    .setNanos(Instant.now().getNano())
                    .build();

            String payloadS3Key = payload.getDocumentId() + ".pdf";

            s3Client.putObject(
                    b -> b.bucket(this.bucket).key(payloadS3Key),
                    pdfPath);
            log.info("Saved document {} to s3 with key: {}.", pdfPath, payloadS3Key);

            this.pdfCompiledMessageProducer.handlePdfCompiled(
                    payload.getRenderId(),
                    payload.getDocumentId(),
                    payloadS3Key,
                    timestamp,
                    SUCCESSFULLY_RENDERED,
                    "");

            Path parent = pdfPath.getParent();
            try {
                FileSystemUtils.deleteRecursively(parent);
            } catch (IOException e) {
                log.error("Could not delete directory: {}.", parent, e);
            }
        }catch (Exception e){
            log.error( e.getMessage() );

            Timestamp timestamp = Timestamp.newBuilder()
                    .setSeconds(Instant.now().getEpochSecond())
                    .setNanos(Instant.now().getNano())
                    .build();

            this.pdfCompiledMessageProducer.handlePdfCompiled(
                    payload != null ? payload.getRenderId() : "",
                    payload != null ? payload.getDocumentId() : "",
                    "",
                    timestamp,
                    ERROR_WHILE_RENDERING,
                    e.getMessage());

            // DON'T MANUALLY REJECT here, spring handles this.
            throw e;
        }
    }
}
