package com.latech.api.api;

import java.net.URI;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.util.ObjectUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.latech.api.model.api.DocumentCreateRequestDto;
import com.latech.api.model.api.DocumentCreateResponseDto;
import com.latech.api.model.api.DocumentDto;
import com.latech.api.model.api.DocumentSecuredCreateRequestDto;
import com.latech.api.model.api.DocumentSecuredRequestDto;
import com.latech.api.model.db.Document;
import com.latech.api.repository.DocumentRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping( "api/document" )
public class DocumentController
{
	private final DocumentRepository documentRepository;

	@PostMapping
	public ResponseEntity<DocumentCreateResponseDto> createDocument (
			@RequestBody DocumentCreateRequestDto documentCreateRequestDto, UriComponentsBuilder uriBuilder )
	{
		if ( ObjectUtils.isEmpty( documentCreateRequestDto ) || ObjectUtils.isEmpty(
				documentCreateRequestDto.getName() ) )
		{
			return ResponseEntity.badRequest().build();
		}

		Document document = Document.builder()
				.name( documentCreateRequestDto.getName() )
				.password( documentCreateRequestDto.getPassword() )
				.build();

		Document saved = documentRepository.save( document );

		var response = getDocumentCreateResponseDto( saved );

		URI location = uriBuilder.path( "/api/document/{id}" ).buildAndExpand( saved.getId() ).toUri();
		return ResponseEntity.created( location ).body( response );
	}

	@GetMapping( "/{docId}" )
	public ResponseEntity<DocumentDto> getDocumentContent ( @PathVariable String docId )
	{
		if ( ObjectUtils.isEmpty( docId ) )
		{
			return ResponseEntity.badRequest().build();
		}

		if ( !documentRepository.existsById( UUID.fromString( docId ) ) )
		{
			return ResponseEntity.notFound().build();
		}

		Document document = documentRepository.findById( UUID.fromString( docId ) ).orElseThrow();

		DocumentDto response;
		if ( !ObjectUtils.isEmpty( document.getPassword() ) )
		{
			response = DocumentDto.builder().id( document.getId().toString() ).secured( true ).build();
		}
		else
		{
			response = getDocumentDto( document, false );
		}
		return ResponseEntity.ok( response );
	}

	@PostMapping( "secured/{docId}" )
	public ResponseEntity<DocumentDto> getDocumentSecuredContent ( @PathVariable String docId,
			@RequestBody DocumentSecuredRequestDto documentSecuredRequestDto )
	{
		if ( ObjectUtils.isEmpty( docId ) || ObjectUtils.isEmpty( documentSecuredRequestDto ) || ObjectUtils.isEmpty(
				documentSecuredRequestDto.getPassword() ) )
		{
			return ResponseEntity.badRequest().build();
		}

		if ( !documentRepository.existsById( UUID.fromString( docId ) ) )
		{
			return ResponseEntity.notFound().build();
		}

		Document document = documentRepository.findByIdAndPassword( UUID.fromString( docId ),
				documentSecuredRequestDto.getPassword() ).orElseThrow();

		if ( ObjectUtils.isEmpty( document ) )
		{
			return ResponseEntity.notFound().build();
		}

		var response = getDocumentDto( document, true );
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

	private static DocumentCreateResponseDto getDocumentCreateResponseDto ( Document saved )
	{
		DocumentCreateResponseDto dto = DocumentCreateResponseDto.builder()
				.uuid( saved.getId().toString() )
				.name( saved.getName() )
				.build();
		return dto;
	}

	private static DocumentDto getDocumentDto ( Document document, boolean secured )
	{
		DocumentDto dto = DocumentDto.builder()
				.id( document.getId().toString() )
				.name( document.getName() )
				.content( document.getContent() )
				.secured( secured )
				.build();
		return dto;
	}

}
