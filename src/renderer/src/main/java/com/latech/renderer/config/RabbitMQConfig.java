package com.latech.renderer.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String LATECH_TOPIC = "latech.topic";

    public static final String DOCUMENT_EXCHANGE = "document_exchange";
    public static final String ROUTING_KEY_DOCUMENT_EXCHANGE = DOCUMENT_EXCHANGE + ".#";
    public static final String DOCUMENT_EXCHANGE_DLQ = DOCUMENT_EXCHANGE + ".dlq";
    public static final String DOCUMENT_EXCHANGE_DLX = DOCUMENT_EXCHANGE + ".dlx";

    public static final String PDF_RENDERED = "pdf_rendered";
    public static final String ROUTING_KEY_PDF_RENDERED = PDF_RENDERED + ".#";
    public static final String PDF_RENDERED_DLQ = PDF_RENDERED + ".dlq";
    public static final String PDF_RENDERED_DLX = PDF_RENDERED + ".dlx";

    @Bean
    public TopicExchange topic () {
        return new TopicExchange( LATECH_TOPIC );
    }

    @Bean
    public TopicExchange documentExchangeDlx () {
        return new TopicExchange( DOCUMENT_EXCHANGE_DLX );
    }

    @Bean
    public Queue documentExchangeDlq () {
        return new Queue( DOCUMENT_EXCHANGE_DLQ, true );
    }

    @Bean
    public Binding bindingDocumentExchangeDlq () {
        return BindingBuilder.bind( documentExchangeDlq() ).to( documentExchangeDlx() )
                .with( ROUTING_KEY_DOCUMENT_EXCHANGE );
    }

    @Bean
    public Queue initiateDocumentExchangeQueue () {
        return org.springframework.amqp.core.QueueBuilder.durable( DOCUMENT_EXCHANGE )
                .withArgument( "x-dead-letter-exchange", DOCUMENT_EXCHANGE_DLX )
                .withArgument( "x-dead-letter-routing-key", ROUTING_KEY_DOCUMENT_EXCHANGE )
                .build();
    }

    @Bean
    public Binding bindingDocumentExchangeQueue () {
        return BindingBuilder.bind( initiateDocumentExchangeQueue() ).to( topic() )
                .with( ROUTING_KEY_DOCUMENT_EXCHANGE );
    }

    @Bean
    public TopicExchange pdfRenderedDlx () {
        return new TopicExchange( PDF_RENDERED_DLX );
    }

    @Bean
    public Queue pdfRenderedDlq () {
        return new Queue( PDF_RENDERED_DLQ, true );
    }

    @Bean
    public Binding bindingPDFRenderedDlq ( Queue pdfRenderedDlq, TopicExchange pdfRenderedDlx ) {
        return BindingBuilder.bind( pdfRenderedDlq ).to( pdfRenderedDlx ).with( ROUTING_KEY_PDF_RENDERED );
    }

    @Bean
    public Queue initiatePDFRenderedQueue () {
        return org.springframework.amqp.core.QueueBuilder.durable( PDF_RENDERED )
                .withArgument( "x-dead-letter-exchange", PDF_RENDERED_DLX )
                .withArgument( "x-dead-letter-routing-key", ROUTING_KEY_PDF_RENDERED )
                .build();
    }

    @Bean
    public Binding bindingPDFRenderedQueue () {
        return BindingBuilder.bind( initiatePDFRenderedQueue() ).to( topic() )
                .with( ROUTING_KEY_PDF_RENDERED );
    }
}
