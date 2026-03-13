package com.latech.api.api;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.util.ObjectUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.latech.api.model.DocumentCreateRequestDto;
import com.latech.api.model.DocumentCreateResponseDto;
import com.latech.api.model.DocumentDto;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping( "api/document" )
public class DocumentController
{
	@PostMapping
	public ResponseEntity<DocumentCreateResponseDto> createDocument (
			@RequestBody DocumentCreateRequestDto documentCreateRequestDto )
	{
		if ( ObjectUtils.isEmpty( documentCreateRequestDto ) || ObjectUtils.isEmpty(
				documentCreateRequestDto.getName() ) )
		{
			return ResponseEntity.badRequest().build();
		}
		// Todo document creation logic
		var response = DocumentCreateResponseDto.builder()
				.uuid( UUID.randomUUID().toString() )
				.name( documentCreateRequestDto.getName() )
				.build();
		return ResponseEntity.ok( response );
	}

	@GetMapping( "/{docId}" )
	public ResponseEntity<DocumentDto> getDocumentContent ( @PathVariable String docId )
	{
		if ( ObjectUtils.isEmpty( docId ) )
		{
			return ResponseEntity.badRequest().build();
		}
		//todo load document
		var response = DocumentDto.builder()
				.id( docId )
				.name( "documentname" )
				.content( "in future your content will be loaded from backend" )
				.build();
		return ResponseEntity.ok( response );
	}

	@PostMapping( "/{docId}/render" )
	public ResponseEntity<Void> initiateDocumentRender ( @PathVariable String docId )
	{
		if ( ObjectUtils.isEmpty( docId ) )
		{
			return ResponseEntity.badRequest().build();
		}

		//todo initiate render via rabbitmq

		return ResponseEntity.accepted().build();
	}

}
