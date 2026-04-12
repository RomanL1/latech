package com.latech.api.business;

import static com.latech.api.config.RabbitMQConfig.PDF_RENDERED;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.latech.api.api.DocumentController;
import com.latech.api.model.api.PDFReadyMessageDto;
import com.rabbitmq.client.Channel;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class PdfRenderedConsumer
{

	private final RenderedPDFTopicService renderedPdfTopicService;


	public PdfRenderedConsumer ( RenderedPDFTopicService renderedPdfTopicService )
	{
		this.renderedPdfTopicService = renderedPdfTopicService;
	}

	@RabbitListener( queues = PDF_RENDERED )
	public void handlePdfRendered ( byte[] payloadBytes, Channel channel, @Header( AmqpHeaders.DELIVERY_TAG ) long tag )
			throws Exception
	{
		try
		{
			PdfMetadata payload = PdfMetadata.parseFrom( payloadBytes );
			// Process rendered document...
			log.info( "Pdf rendered renderId: " + payload.getRenderId() );
			log.info( "Pdf rendered documentId: " + payload.getDocumentId() );
			log.info( "Pdf rendered timestamp: " + payload.getRenderedTimestamp() );
			log.info( "Pdf rendered seaweedfs-key: " + payload.getFilePath());
			log.info( "Pdf rendered status: " + payload.getStatus() );
			log.info( "Pdf rendered error message: " + payload.getErrorMessage() );

			if (payload.getFilePath().isEmpty()){
				log.error("Pdf not saved: received empty path");
				throw new RuntimeException("Received empty pdf-path for render-id: " + payload.getRenderId() + "." +
											"Can't distribute pdf of document: " + payload.getDocumentId());
			}

			String downloadUri = DocumentController.getDownloadPath( payload.getDocumentId() );

			PDFReadyMessageDto pdfReadyMessage = PDFReadyMessageDto.builder()
					.docId( payload.getDocumentId() )
					.downloadPath( downloadUri )
					.timestampUTC( System.currentTimeMillis() )
					.build();

			renderedPdfTopicService.notifyAll( payload.getDocumentId(), pdfReadyMessage );
			log.info( "Notified topic: {}",  payload.getDocumentId() );

			// MANUALLY ACKNOWLEDGE (Success)
			// 'false' means we only acknowledge this specific message
			channel.basicAck( tag, false );

		}
		catch ( Exception e )
		{
			//don't manually reject here, spring handles this for us since we throw.
			log.error( e.getMessage() );
			throw e;
		}
	}
}
