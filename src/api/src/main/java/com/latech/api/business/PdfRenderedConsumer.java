package com.latech.api.business;

import com.latech.api.model.db.Document;
import com.latech.api.model.db.RenderHistory;
import com.latech.api.repository.DocumentRepository;
import com.latech.api.repository.RenderHistoryRepository;
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
    private final RenderHistoryRepository renderHistoryRepository;
    private final OngoingCompileTracker ongoingCompileTracker;

    @RabbitListener( queues = PDF_RENDERED )
    public void handlePdfRendered ( byte[] payloadBytes, Channel channel, @Header( AmqpHeaders.DELIVERY_TAG ) long tag ) throws Exception {
        try {
            PdfMetadata payload = PdfMetadata.parseFrom( payloadBytes );
            log.info( "Pdf rendered renderId: " + payload.getRenderId() );
            log.info( "Pdf rendered documentId: " + payload.getDocumentId() );
            log.info( "Pdf rendered timestamp: " + payload.getRenderedTimestamp() );
            log.info( "Pdf rendered status: " + payload.getStatus() );
            log.info( "Pdf rendered log message: " + payload.getLogMessage() );

            Document document = documentRepository.findById( UUID.fromString( payload.getDocumentId() ) ).orElseThrow();
            Instant compiledAtTimestamp = Instant.ofEpochSecond( payload.getRenderedTimestamp().getSeconds(),
                                                                 payload.getRenderedTimestamp().getNanos() );

            RenderHistory history = RenderHistory.builder()
                    .document( document )
                    .renderId( UUID.fromString( payload.getRenderId() ) )
                    .status( payload.getStatus().name() )
                    .logMessage( payload.getLogMessage() )
                    .renderedAt( compiledAtTimestamp )
                    .build();
            renderHistoryRepository.save( history );

            if ( payload.getStatus() == PdfMetadata.Status.ERROR_WHILE_RENDERING ) {
                log.warn(
                        "Compilation failed for renderId: " + payload.getRenderId() + " documentId: " + payload.getDocumentId() );
                this.ongoingCompileTracker.jobFinished( document.getId() );
                this.pdfRenderedNotifier.publish( payload.getDocumentId(), "", false, payload.getLogMessage() );
                return;
            }

            document.setPdfPath( payload.getFilePath() );
            document.setLastCompile( compiledAtTimestamp );
            document.setCompileAbandonedAt( null );
            this.documentRepository.save( document );
            this.ongoingCompileTracker.jobFinished( document.getId() );
            this.pdfRenderedNotifier.publish( payload.getDocumentId(), payload.getFilePath(), true,
                                              payload.getLogMessage() );
            log.info( "Notified topic: {}", payload.getDocumentId() );
        } catch ( Exception e ) {
            log.error( e.getMessage() );
            throw e;
        }
    }
}
