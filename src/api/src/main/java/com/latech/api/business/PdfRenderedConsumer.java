package com.latech.api.business;

import com.latech.api.model.db.Document;
import com.latech.api.repository.DocumentRepository;
import com.rabbitmq.client.Channel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

import static com.latech.api.config.RabbitMQConfig.PDF_RENDERED;

@Component
@Slf4j
@RequiredArgsConstructor
public class PdfRenderedConsumer {

    private final PdfRenderedNotifier pdfRenderedNotifier;
    private final DocumentRepository documentRepository;
    private final OngoingCompileTracker ongoingCompileTracker;

    @RabbitListener( queues = PDF_RENDERED )
    public void handlePdfRendered ( byte[] payloadBytes, Channel channel, @Header( AmqpHeaders.DELIVERY_TAG ) long tag ) throws Exception {
        try {
            PdfMetadata payload = PdfMetadata.parseFrom( payloadBytes );
            // Process rendered document...
            log.info( "Pdf rendered renderId: " + payload.getRenderId() );
            log.info( "Pdf rendered documentId: " + payload.getDocumentId() );
            log.info( "Pdf rendered timestamp: " + payload.getRenderedTimestamp() );
            log.info( "Pdf rendered seaweedfs-key: " + payload.getFilePath() );
            log.info( "Pdf rendered status: " + payload.getStatus() );
            log.info( "Pdf rendered error message: " + payload.getErrorMessage() );

            if ( payload.getStatus() == PdfMetadata.Status.ERROR_WHILE_RENDERING ) {
                if ( payload.getFilePath().isEmpty() ) {
                    log.error( "Received empty pdf-path for render-id: " + payload.getRenderId() + "." + "Can't distribute pdf of document: " + payload.getDocumentId() );
                    //don't notify user, don't delete job from ongoingCompileTracker: We get here while Spring handles reboots
                    //DocumentExchangeDlqListener should be doing that, since that's after spring has given up on retries.
                }
                return;
            }

            Document document = documentRepository.findById( UUID.fromString( payload.getDocumentId() ) ).orElseThrow();
            document.setPdfPath( payload.getFilePath() );
            Instant compiledAtTimestamp = Instant.ofEpochSecond( payload.getRenderedTimestamp()
                    .getSeconds(), payload.getRenderedTimestamp().getNanos() );
            document.setLastCompile( compiledAtTimestamp );
            document.setCompileAbandonedAt( null );
            this.documentRepository.save( document );
            this.ongoingCompileTracker.jobFinished( document.getId() );
            this.pdfRenderedNotifier.publish( payload.getDocumentId(), payload.getFilePath(), true, "" );
            log.info( "Notified topic: {}", payload.getDocumentId() );
        } catch ( Exception e ) {
            //don't manually reject here, spring handles this for us since we throw.
            log.error( e.getMessage() );
            throw e;
        }
    }
}
