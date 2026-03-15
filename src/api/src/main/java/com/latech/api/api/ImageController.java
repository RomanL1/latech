package com.latech.api.api;

import java.util.concurrent.TimeUnit;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.ObjectUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping( "api/document/{docId}/image" )
public class ImageController
{

	@PostMapping( value = "upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE )
	public ResponseEntity<String> uploadImage (
			@PathVariable String docId,
			@RequestParam( "file" ) MultipartFile file,
			@RequestParam( "name" ) String name )
	{
		if ( ObjectUtils.isEmpty( docId ) )
		{
			return ResponseEntity.badRequest().body( "Document ID is empty" );
		}

		if ( file.isEmpty() )
		{
			return ResponseEntity.badRequest().body( "Please select a file to upload." );
		}

		// Todo Logic to save file to minio: file.getInputStream() or file.transferTo()
		return ResponseEntity.ok( "File uploaded: " + file.getOriginalFilename() );
	}

	@GetMapping( value = "{imageId}" )
	public ResponseEntity<byte[]> getDynamicImage ( @PathVariable String docId, @PathVariable String imageId )
	{
		if ( ObjectUtils.isEmpty( docId ) )
		{
			return ResponseEntity.badRequest().body( null );
		}

		if ( ObjectUtils.isEmpty( imageId ) )
		{
			return ResponseEntity.badRequest().body( null );
		}
		// Todo Logic to get file bytes from minio
		byte[] imageBytes = new byte[1000];

		if ( imageBytes == null || imageBytes.length == 0 )
		{
			return ResponseEntity.status( HttpStatus.NOT_FOUND ).build();
		}

		return ResponseEntity.ok()
				.contentType( MediaType.IMAGE_JPEG )
				.contentLength( imageBytes.length )
				.cacheControl( CacheControl.maxAge( 1, TimeUnit.HOURS ).cachePublic() )
				.body( imageBytes );
	}
}
