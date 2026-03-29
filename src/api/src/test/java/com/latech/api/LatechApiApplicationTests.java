package com.latech.api;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;

@SpringBootTest
@ActiveProfiles("test")
class LatechApiApplicationTests
{

	@MockitoBean
	private ConnectionFactory connectionFactory;

	@Test
	void contextLoads ()
	{
	}

}
