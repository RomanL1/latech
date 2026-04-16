package com.latech.api.api;

import java.net.URI;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.latech.api.business.*;
import com.latech.api.model.db.DocumentImage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
import com.latech.api.model.api.DocumentSecuredRequestDto;
import com.latech.api.model.db.Document;
import com.latech.api.repository.DocumentRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping( "api/document" )
public class DocumentController
{
	private final DocumentRepository documentRepository;
	private final DocumentProducer documentProducer;
	private final S3Client s3Client;
	private final DocumentImageService documentImageService;
	private final PdfRenderedNotifier pdfRenderedNotifier;
	private final OngoingCompileTracker ongoingCompileTracker;

	@Value("${seaweedfs.bucket}")
	private String bucket;

	public static String getDownloadPath ( String docId )
	{
		return "api/document/" + docId + "/render";
	}

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

		Optional<Document> document = documentRepository.findByIdAndPassword( UUID.fromString( docId ),
				documentSecuredRequestDto.getPassword() );

		if ( document.isEmpty() )
		{
			return ResponseEntity.notFound().build();
		}

		var response = getDocumentDto( document.get(), true );
		return ResponseEntity.ok( response );
	}

	@PostMapping( "/{docId}/render" )
	public ResponseEntity<Void> initiateDocumentRender ( @PathVariable String docId )
	{
		if ( ObjectUtils.isEmpty( docId ) )
		{
			return ResponseEntity.badRequest().build();
		}

		UUID documentId = UUID.fromString( docId );
		if ( !documentRepository.existsById( documentId ) )
		{
			return ResponseEntity.notFound().build();
		}

		Document document = documentRepository.findById( documentId ).orElseThrow();

		//if there have been no changes since last compile
		if (document.getLastCompile() != null &&
				document.getLastChange() != null &&
                document.getPdfPath() != null &&
		    document.getLastCompile().isAfter(document.getLastChange())){
			this.pdfRenderedNotifier.publish(docId, document.getPdfPath(), true, "");
			return ResponseEntity.accepted().build();
		}

		//if we already queued a document for compilation
		if (!this.ongoingCompileTracker.tryStartJob(documentId)){
			return ResponseEntity.accepted().build();
		}

		//if a previous request was unable to be compiled 3 times, and there have been no changes since.
		if (document.getCompileAbandonedAt() != null &&
			document.getCompileAbandonedAt().isAfter(document.getLastChange())){
			return ResponseEntity.unprocessableContent().build();
		}

		List<DocumentImage> documentImages = this.documentImageService.getPicturesForDocument(documentId);

		DocumentRecord.Builder documentRecordBuilder = DocumentRecord.newBuilder()
				.setRenderId( UUID.randomUUID().toString() )
				.setDocumentId( document.getId().toString() )
				.setLatexContent( document.getContent() != null ? document.getContent() : "" );

		for (DocumentImage image : documentImages){
			documentRecordBuilder.putImages(String.valueOf(image.getImageId()), image.getUserSuppliedName());
		}
		DocumentRecord documentRecord = documentRecordBuilder.build();

		documentProducer.publishDocumentReadyToRender( documentRecord );

		return ResponseEntity.accepted().build();
	}

	@GetMapping( "/{docId}/render" )
	public ResponseEntity<Resource> getRenderedDocument ( @PathVariable String docId ) {
		if ( ObjectUtils.isEmpty( docId ) )
		{
			return ResponseEntity.badRequest().build();
		}

		String pdfKey = docId + ".pdf";
		try {
			ResponseInputStream<GetObjectResponse> s3Stream = s3Client.getObject(
					b -> b.bucket(this.bucket).key(pdfKey)
			);

			GetObjectResponse metadata = s3Stream.response();

			return ResponseEntity.ok()
					.contentType(MediaType.APPLICATION_PDF)
					.contentLength(metadata.contentLength())
					.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + pdfKey + "\"")
					.body(new InputStreamResource(s3Stream));

		}catch (NoSuchKeyException e){
			return ResponseEntity.notFound().build();
		}
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
