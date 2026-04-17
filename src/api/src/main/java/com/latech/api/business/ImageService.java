package com.latech.api.business;

import com.latech.api.model.db.DocumentImage;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Service
public class ImageService {

    private final DocumentImageService documentImageService;
    private final S3StorageService s3StorageService;

    public ImageService ( DocumentImageService documentImageService, S3StorageService s3StorageService ) {
        this.documentImageService = documentImageService;
        this.s3StorageService = s3StorageService;
    }

    public void uploadImage ( UUID documentId, String name, MultipartFile file ) throws IOException {
        String mimeType = file.getContentType();
        DocumentImage entry = this.documentImageService.registerPicture( documentId, name, mimeType );
        this.s3StorageService.upload( documentId, entry.getImageId(), file.getInputStream(), file.getSize() );
    }

    public byte[] downloadImage ( UUID documentId, String name ) {
        Optional<DocumentImage> entry = this.documentImageService
                .getPictureFromDocumentIdAndImageName( documentId, name );
        if ( entry.isPresent() ) {
            return this.s3StorageService.download( documentId, entry.get().getImageId() );
        } else {
            throw new ResponseStatusException( HttpStatus.NOT_FOUND );
        }
    }
}
