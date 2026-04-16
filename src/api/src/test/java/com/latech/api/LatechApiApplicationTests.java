package com.latech.api;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import software.amazon.awssdk.services.s3.S3Client;

@SpringBootTest
@ActiveProfiles("test")
class LatechApiApplicationTests
{

	@MockitoBean
	private ConnectionFactory connectionFactory;
	@MockitoBean
	S3Client s3Client;

	@Test
	void contextLoads ()
	{
	}
}
