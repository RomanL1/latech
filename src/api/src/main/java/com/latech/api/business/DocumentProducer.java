package com.latech.api.business;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import static com.latech.api.config.RabbitMQConfig.DOCUMENT_EXCHANGE;
import static com.latech.api.config.RabbitMQConfig.LATECH_TOPIC;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentProducer {

    private final RabbitTemplate rabbitTemplate;

    public void publishDocumentReadyToRender ( DocumentRecord doc ) {
        log.info( "Publishing document ready: " + doc.getDocumentId() );
        // Send to Topic exchange (arg 1) with a specific routing key (arg 2)
        rabbitTemplate.convertAndSend( LATECH_TOPIC, DOCUMENT_EXCHANGE, doc.toByteArray() );
    }
}
