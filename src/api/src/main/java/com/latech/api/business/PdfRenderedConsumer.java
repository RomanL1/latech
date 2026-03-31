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

import com.rabbitmq.client.Channel;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class PdfRenderedConsumer
{

	@Value( "${latech.renderer.url}" )
	private String rendererUrl;

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
			log.info( "Pdf rendered status: " + payload.getStatus() );
			log.info( "Pdf rendered error message: " + payload.getErrorMessage() );

			// Download the PDF from the renderer
			try
			{
				RestTemplate restTemplate = new RestTemplate();
				String downloadUrl = UriComponentsBuilder.fromUriString( rendererUrl )
						.path( "/renderer/pdf" )
						.queryParam( "filePath", payload.getFilePath() )
						.toUriString();

				log.info( "Downloading PDF from renderer at: {}", downloadUrl );
				byte[] pdfBytes = restTemplate.getForObject( downloadUrl, byte[].class );

				if ( pdfBytes != null )
				{
					log.info( "Successfully downloaded PDF, size: {} bytes", pdfBytes.length );
					// TODO: process the downloaded pdfBytes (e.g. save to DB, MinIO, etc.)
					Path dataDir = Path.of( "data" );
					Files.createDirectories( dataDir );
					Path destination = Paths.get( "data", payload.getDocumentId() + ".pdf" );
					if ( Files.exists( destination ) )
					{
						Files.delete( destination );
					}
					Files.write( destination, pdfBytes );
					log.info("PDF location: {}", destination.toAbsolutePath() );
				}
				else
				{
					log.error( "Failed to download PDF: received null bytes" );
				}
			}
			catch ( Exception e )
			{
				log.error( "Error downloading PDF from renderer: {}", e.getMessage(), e );
			}

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
