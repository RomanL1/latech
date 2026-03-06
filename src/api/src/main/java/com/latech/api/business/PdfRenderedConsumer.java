package com.latech.api.business;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class PdfRenderedConsumer
{

	// Wait for messages on the specific queue
	@RabbitListener( queues = "pdf_rendered_queue" )
	public void handlePdfRendered ( PdfMetadata payload )
	{
		log.info( "Pdf rendered: " + payload.getDocumentUuid() );
		log.info( "Pdf rendered timestamp: " + payload.getRenderedTimestamp() );
	}
}
