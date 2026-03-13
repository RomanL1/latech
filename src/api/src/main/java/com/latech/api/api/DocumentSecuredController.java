package com.latech.api.api;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.util.ObjectUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.latech.api.model.DocumentCreateResponseDto;
import com.latech.api.model.DocumentDto;
import com.latech.api.model.DocumentSecuredCreateRequestDto;
import com.latech.api.model.DocumentSecuredRequestDto;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping( "api/document/secured" )
public class DocumentSecuredController
{
	@PostMapping
	public ResponseEntity<DocumentCreateResponseDto> createDocumentSecured (
			@RequestBody DocumentSecuredCreateRequestDto documentSecuredCreateRequestDto )
	{
		if ( ObjectUtils.isEmpty( documentSecuredCreateRequestDto ) || ObjectUtils.isEmpty(
				documentSecuredCreateRequestDto.getName() ) || ObjectUtils.isEmpty(
				documentSecuredCreateRequestDto.getPassword() ) )
		{
			return ResponseEntity.badRequest().build();
		}
		// Todo secured document creation logic
		var response = DocumentCreateResponseDto.builder()
				.uuid( UUID.randomUUID().toString() )
				.name( documentSecuredCreateRequestDto.getName() )
				.build();
		return ResponseEntity.ok( response );
	}

	@PostMapping( "/{docId}" )
	public ResponseEntity<DocumentDto> getDocumentSecuredContent ( @PathVariable String docId,
			@RequestBody DocumentSecuredRequestDto documentSecuredRequestDto )
	{
		if ( ObjectUtils.isEmpty( docId ) || ObjectUtils.isEmpty( documentSecuredRequestDto ) || ObjectUtils.isEmpty(
				documentSecuredRequestDto.getPassword() ) )
		{
			return ResponseEntity.badRequest().build();
		}
		//todo check password
		//todo load document
		var response = DocumentDto.builder()
				.id( docId )
				.name( "documentname" )
				.content( "in future your content will be loaded from backend" )
				.build();
		return ResponseEntity.ok( response );
	}
}
