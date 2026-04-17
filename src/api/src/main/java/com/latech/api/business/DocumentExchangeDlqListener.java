package com.latech.api.business;

import com.google.protobuf.InvalidProtocolBufferException;
import com.latech.api.config.RabbitMQConfig;
import com.latech.api.model.db.Document;
import com.latech.api.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DocumentExchangeDlqListener
{
    private static final Logger log = LoggerFactory.getLogger( DocumentExchangeDlqListener.class );
    private final OngoingCompileTracker ongoingCompileTracker;
    private final PdfRenderedNotifier pdfRenderedNotifier;
    private final DocumentRepository documentRepository;

    @RabbitListener( queues = RabbitMQConfig.DOCUMENT_EXCHANGE_DLQ )
    public void handleDeadLetter( Message message )
    {
        Map<String, Object> headers = message.getMessageProperties().getHeaders();

        String originalQueue = headers.get( "x-death" ) != null
                ? ((java.util.List<Map<String, Object>>) headers.get( "x-death" ))
                .get( 0 ).get( "queue" ).toString()
                : "unknown";

        String exceptionMessage = (String) headers.getOrDefault( "x-exception-message", "no exception captured" );
        DocumentRecord record = null;
        try {
            record = DocumentRecord.parseFrom( message.getBody() );
        } catch (InvalidProtocolBufferException e) {
            log.error("Error while parsing message body of deadletterqueued message with original exceptionMessage: "
                    + exceptionMessage +
                    "\n exception while trying to parse body: " + e);
        }

        log.error( "Dead letter received — renderId={}, documentId={}, originalQueue={}",
                record.getRenderId(), record.getDocumentId(), originalQueue );
        UUID documentId = UUID.fromString(record.getDocumentId());
        this.ongoingCompileTracker.jobFinished(documentId);
        Document document = this.documentRepository.findById(documentId).orElseThrow();
        document.setCompileAbandonedAt(Instant.now());
        this.documentRepository.save(document);
        this.pdfRenderedNotifier.publish(record.getDocumentId(), "", false, "Error while compiling pdf");
    }
}
