package com.latech.api.api;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import com.latech.api.business.DocumentImageService;
import com.latech.api.business.ImageService;
import com.latech.api.model.db.DocumentImage;

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
	private final ImageService imageService;
	private final DocumentImageService documentImageService;

	public ImageController(ImageService imageService, DocumentImageService documentImageService ) {
        this.imageService = imageService;
		this.documentImageService = documentImageService;
	}

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

		if (name.isEmpty())
		{
			return ResponseEntity.badRequest().body( " Filename is empty ");
		}

		String contentType = file.getContentType();
		if ( contentType != null && !(contentType.equals( MediaType.IMAGE_PNG_VALUE ) || contentType.equals(
				MediaType.IMAGE_JPEG_VALUE ) ) )
		{
			return ResponseEntity.badRequest().body( "Only PNG and JPEG images are allowed." );
		}

		try {
			this.imageService.uploadImage(UUID.fromString(docId), name, file);
		} catch (IOException e) {
            log.error("Exception while uploading file: {}", String.valueOf(e));
			return ResponseEntity.internalServerError().body( "Error while uploading file");
		}

		return ResponseEntity.ok("File uploaded: " + file.getOriginalFilename());
	}

	@GetMapping( value = "{imageName}" )
	public ResponseEntity<byte[]> getDynamicImage ( @PathVariable String docId, @PathVariable String imageName )
	{
		if ( ObjectUtils.isEmpty( docId ) )
		{
			return ResponseEntity.badRequest().body( null );
		}

		if ( ObjectUtils.isEmpty( imageName ) )
		{
			return ResponseEntity.badRequest().body( null );
		}

		Optional<DocumentImage> picture = documentImageService.getPictureFromDocumentIdAndImageName(
				UUID.fromString( docId ), imageName );

		if ( picture.isEmpty() )
		{
			return ResponseEntity.notFound().build();
		}

		byte[] imageBytes = this.imageService.downloadImage(UUID.fromString(docId), imageName );

		if ( imageBytes == null || imageBytes.length == 0 )
		{
			return ResponseEntity.notFound().build();
		}

		MediaType mediaType = MediaType.parseMediaType( picture.get().getMimeType() );

		return ResponseEntity.ok()
				.contentType( mediaType )
				.contentLength( imageBytes.length )
				.cacheControl( CacheControl.maxAge( 1, TimeUnit.HOURS ).cachePublic() )
				.body( imageBytes );
	}
}
