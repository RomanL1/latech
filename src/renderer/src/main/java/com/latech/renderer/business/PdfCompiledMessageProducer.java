package com.latech.renderer.business;

import com.google.protobuf.Timestamp;
import com.latech.renderer.api.PdfMetadata;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import static com.latech.renderer.config.RabbitMQConfig.LATECH_TOPIC;
import static com.latech.renderer.config.RabbitMQConfig.PDF_RENDERED;

@Component
@Slf4j
public class PdfCompiledMessageProducer {

    private final RabbitTemplate rabbitTemplate;

    public PdfCompiledMessageProducer ( RabbitTemplate rabbitTemplate ) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishPdfCompiled ( PdfMetadata pdfMetadata ) {
        log.info( "publishing pdf compiled: " + pdfMetadata.getDocumentId() );
        rabbitTemplate.convertAndSend( LATECH_TOPIC, PDF_RENDERED, pdfMetadata.toByteArray() );
    }

    public void handlePdfCompiled ( String renderId, String documentId,
            String filePath, Timestamp timestamp,
            PdfMetadata.Status status, String logMessage ) {

        PdfMetadata pdfMetadata = PdfMetadata.newBuilder()
                .setRenderId( renderId )
                .setDocumentId( documentId )
                .setFilePath( filePath )
                .setRenderedTimestamp( timestamp )
                .setStatus( status )
                .setLogMessage( logMessage )
                .build();
        publishPdfCompiled( pdfMetadata );
    }
}
