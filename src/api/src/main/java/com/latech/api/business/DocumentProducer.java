package com.latech.api.business;

import static com.latech.api.config.RabbitMQConfig.LATECH_TOPIC;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentProducer
{

	private final RabbitTemplate rabbitTemplate;

	public void publishDocumentReady ( DocumentRecord doc )
	{
		log.info( "Publishing document ready: " + doc.getDocumentId() );
		// Send to Topic exchange (arg 1) with a specific routing key (arg 2)
		rabbitTemplate.convertAndSend( LATECH_TOPIC, "document_exchange", doc );
	}

	@EventListener( ApplicationReadyEvent.class )
	public void handleApplicationReady ( ApplicationReadyEvent event )
	{
		DocumentRecord.Builder documentRecord = DocumentRecord.newBuilder();
		documentRecord.setDocumentId( "testDocId" );
		documentRecord.setLatexContent( "testLatexContent" );
		documentRecord.addImageIds( "testImgId" );
		publishDocumentReady( documentRecord.build() );
	}
}