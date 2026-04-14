package com.latech.api.api;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import com.latech.api.business.ImageService;
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

    public ImageController(ImageService imageService) {
        this.imageService = imageService;
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

		//TODO: Check filetype in a way the user can't spoof and reject anything but images.
		// and probably implement a file-size-limit.

		try {
			this.imageService.uploadImage(UUID.fromString(docId), name, file);
		} catch (IOException e) {
            log.error("Exception while uploading file: {}", String.valueOf(e));
			return ResponseEntity.internalServerError().body( "Error while uploading file");
		}

		return ResponseEntity.ok("File uploaded: " + file.getOriginalFilename());
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

		byte[] imageBytes = this.imageService.downloadImage(UUID.fromString(docId), imageId);

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
