package com.latech.api.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig
{

	public static final String LATECH_TOPIC = "latech.topic";

	public static final String ROUTING_KEY_DOCUMENT_EXCHANGE = "document_exchange.#";
	public static final String ROUTING_KEY_PDF_RENDERED = "pdf_rendered_queue.#";

	@Bean
	public TopicExchange topic ()
	{
		return new TopicExchange( LATECH_TOPIC );
	}

	@Bean
	public Queue initiateDocumentExchangeQueue ()
	{
		return new Queue( "document_exchange", true );
	}

	@Bean
	public Queue initiatePDFRenderedQueue ()
	{
		return new Queue( "pdf_rendered_queue", true );
	}

	@Bean
	public Binding bindingDocumentExchangeQueue ( Queue initiateDocumentExchangeQueue, TopicExchange topic )
	{
		return BindingBuilder.bind( initiateDocumentExchangeQueue ).to( topic ).with( ROUTING_KEY_DOCUMENT_EXCHANGE );
	}

	@Bean
	public Binding bindingPDFRenderedQueue ( Queue initiatePDFRenderedQueue, TopicExchange topic )
	{
		return BindingBuilder.bind( initiatePDFRenderedQueue ).to( topic ).with( ROUTING_KEY_PDF_RENDERED );
	}
}
