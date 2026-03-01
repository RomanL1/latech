package com.latech.renderer.api;

import org.springframework.grpc.server.service.GrpcService;

import greet.Greet;
import greet.GreetingServiceGrpc;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@GrpcService
public class GreetingService extends GreetingServiceGrpc.GreetingServiceImplBase
{

	@Override
	public void sayHello ( Greet.HelloRequest request, StreamObserver<Greet.HelloResponse> responseObserver )
	{
		log.info("GreetingService: sayHello");
		String message = "Hello, " + request.getName();
		Greet.HelloResponse response = Greet.HelloResponse.newBuilder().setMessage( message ).build();

		responseObserver.onNext( response );
		responseObserver.onCompleted();
	}
}
