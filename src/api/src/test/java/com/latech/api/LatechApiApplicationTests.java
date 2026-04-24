package com.latech.api;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import software.amazon.awssdk.services.s3.S3Client;

@SpringBootTest
@ActiveProfiles( "test" )
class LatechApiApplicationTests {

    @MockitoBean
    S3Client s3Client;
    @MockitoBean
    private ConnectionFactory connectionFactory;

    @Test
    void contextLoads () {
    }
}
