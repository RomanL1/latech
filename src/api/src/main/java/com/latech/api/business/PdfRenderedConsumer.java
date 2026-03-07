package com.latech.api.business;

import static com.latech.api.config.RabbitMQConfig.PDF_RENDERED;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import com.rabbitmq.client.Channel;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class PdfRenderedConsumer
{

	@RabbitListener( queues = PDF_RENDERED )
	public void handlePdfRendered ( PdfMetadata payload, Channel channel, @Header( AmqpHeaders.DELIVERY_TAG ) long tag )
			throws Exception
	{
		try
		{
			// Process rendered document...
			log.info( "Pdf rendered: " + payload.getDocumentUuid() );
			log.info( "Pdf rendered timestamp: " + payload.getRenderedTimestamp() );

			// MANUALLY ACKNOWLEDGE (Success)
			// 'false' means we only acknowledge this specific message
			channel.basicAck( tag, false );

		}
		catch ( Exception e )
		{
			// MANUALLY REJECT (Failure)
			// 'false' (multiple) -> reject only this message
			// 'false' (requeue) -> don't requeue, send to DLQ (because we configured a DLQ)
			log.error( e.getMessage() );
			channel.basicReject( tag, false );
			throw e;
		}
	}
}
