package com.latech.renderer.business;

import com.latech.renderer.api.DocumentRecord;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

import static com.latech.renderer.config.RabbitMQConfig.LATECH_TOPIC;
import static com.latech.renderer.config.RabbitMQConfig.ROUTING_KEY_DOCUMENT_EXCHANGE;

public class RendererIT {

    @Test
    @Disabled
    void fromMessageToSavedPDFIT () {
        DocumentRecord payload = DocumentRecord.newBuilder()
                .setRenderId( "render-" + java.util.UUID.randomUUID() )
                .setDocumentId( "doc-" + java.util.UUID.randomUUID() )
                .setLatexContent( """
                        \\documentclass{article}
                        \\usepackage{amsmath}
                        \\usepackage{geometry}
                        \\geometry{a4paper, margin=2.5cm}

                        \\title{Quarterly Financial Report}
                        \\author{La Tech Systems}
                        \\date{\\today}

                        \\begin{document}

                        \\maketitle

                        \\section{Introduction}
                        This report summarises the financial performance for Q1 2026.
                        Revenue exceeded projections by a statistically significant margin.

                        \\section{Revenue Model}
                        Let $R(t)$ denote total revenue at time $t$, modelled as:

                        \\begin{equation}
                            R(t) = R_0 \\cdot e^{\\lambda t} + \\sum_{i=1}^{n} \\delta_i
                        \\end{equation}

                        where $\\lambda$ is the growth rate and $\\delta_i$ represents one-off contributions.

                        \\section{Conclusion}
                        The compound growth rate of $\\lambda = 0.12$ confirms strong momentum heading into Q2.

                        \\end{document}
                        """ )
                .build();

        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost( "localhost" );
        factory.setUsername( "admin" );
        factory.setPassword( "your_secure_password_here" );

        try (Connection connection = factory.newConnection();
             Channel channel = connection.createChannel()) {

            channel.basicPublish(
                    LATECH_TOPIC,
                    ROUTING_KEY_DOCUMENT_EXCHANGE,
                    null,
                    payload.toByteArray()
            );

            System.out.println( "Published payload for: " + payload.getDocumentId() );
        } catch ( IOException | TimeoutException e ) {
            throw new RuntimeException( e );
        }
    }
}
