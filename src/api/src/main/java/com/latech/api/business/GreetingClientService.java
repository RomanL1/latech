package com.latech.api.business;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import greet.Greet;
import greet.GreetingServiceGrpc;

@Service
public class GreetingClientService
{

	@Autowired
	private GreetingServiceGrpc.GreetingServiceBlockingStub greetingStub;

	public String getGreetingFromServer ( String clientName )
	{
		// 1. Build the request
		Greet.HelloRequest request = Greet.HelloRequest.newBuilder()
				.setName( clientName )
				.build();

		// 2. Make the call! (This goes over the network)
		Greet.HelloResponse response = greetingStub.sayHello( request );

		// 3. Return the result
		return response.getMessage();
	}
}
