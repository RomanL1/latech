package com.latech.renderer.api;

import static com.latech.renderer.api.PdfMetadata.Status.ERROR_WHILE_RENDERING;
import static com.latech.renderer.api.PdfMetadata.Status.SUCCESSFULLY_RENDERED;
import static com.latech.renderer.config.RabbitMQConfig.DOCUMENT_EXCHANGE;

import com.google.protobuf.Timestamp;
import com.latech.renderer.business.PdfCompiledMessageProducer;
import com.latech.renderer.business.PdfJobWorker;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import com.rabbitmq.client.Channel;

import lombok.extern.slf4j.Slf4j;

import java.nio.file.Path;
import java.time.Instant;


@Component
@Slf4j
public class PdfRequestListener
{
    private PdfJobWorker pdfJobWorker;
    private PdfCompiledMessageProducer pdfCompiledMessageProducer;

    public PdfRequestListener(PdfJobWorker pdfJobWorker, PdfCompiledMessageProducer pdfCompiledMessageProducer){
        this.pdfJobWorker = pdfJobWorker;
        this.pdfCompiledMessageProducer = pdfCompiledMessageProducer;
    }

    @RabbitListener( queues = DOCUMENT_EXCHANGE )
    public void handlePdfRequest ( DocumentRecord payload, Channel channel, @Header( AmqpHeaders.DELIVERY_TAG ) long tag ) throws Exception {
        try{
            log.info("Received payload with documentId: " + payload.getDocumentId());
            Path pdfPath = this.pdfJobWorker.createPdf(payload);
            //do we timestamp here or right after the pdf is compiled?
            Timestamp timestamp = Timestamp.newBuilder()
                    .setSeconds(Instant.now().getEpochSecond())
                    .setNanos(Instant.now().getNano())
                    .build();
            log.info("pdfPath: " + pdfPath);
            //TODO(marc): save pdf with minIO here.


            this.pdfCompiledMessageProducer.handlePdfCompiled(
                    payload.getRenderId(),
                    payload.getDocumentId(),
                    String.valueOf(pdfPath),
                    timestamp,
                    SUCCESSFULLY_RENDERED,
                    "");


            //MANUALLY ACKNOWLEDGE (Success)
            // 'false' means we only acknowledge this specific message
            channel.basicAck( tag, false );


        }catch (Exception e){
            log.error( e.getMessage() );

            Timestamp timestamp = Timestamp.newBuilder()
                    .setSeconds(Instant.now().getEpochSecond())
                    .setNanos(Instant.now().getNano())
                    .build();

            this.pdfCompiledMessageProducer.handlePdfCompiled(
                    payload.getRenderId(),
                    payload.getDocumentId(),
                    "",
                    timestamp,
                    ERROR_WHILE_RENDERING,
                    e.getMessage());

            // MANUALLY REJECT (Failure)
            // 'false' (multiple) -> reject only this message
            // 'false' (requeue) -> don't requeue, send to DLQ (because we configured a DLQ)
            channel.basicReject( tag, false );
            throw e;
        }
    }
}
