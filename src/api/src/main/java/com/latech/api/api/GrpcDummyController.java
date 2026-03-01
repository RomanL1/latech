package com.latech.api.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.latech.api.business.GreetingClientService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("grpc")
@RequiredArgsConstructor
public class GrpcDummyController
{
	private final GreetingClientService greetingClientService;

	@GetMapping
	public ResponseEntity<String> grpc ()
	{
		String greetingFromServer = greetingClientService.getGreetingFromServer( "test" );
		return ResponseEntity.ok( greetingFromServer );
	}
}

