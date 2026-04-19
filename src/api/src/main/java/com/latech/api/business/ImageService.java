package com.latech.api.business;

import com.latech.api.model.db.DocumentImage;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class ImageService {

    private final DocumentImageService documentImageService;
    private final S3StorageService s3StorageService;

    public ImageService ( DocumentImageService documentImageService, S3StorageService s3StorageService ) {
        this.documentImageService = documentImageService;
        this.s3StorageService = s3StorageService;
    }

    public DocumentImage uploadImage ( UUID documentId, String name, MultipartFile file ) throws IOException {
        String mimeType = file.getContentType();
        DocumentImage entry = this.documentImageService.registerPicture( documentId, name, mimeType );
        this.s3StorageService.upload( documentId, entry.getImageId(), file.getInputStream(), file.getSize() );
        return entry;
    }

    public byte[] downloadImage ( UUID documentId, UUID imageId ) {
        return this.s3StorageService.download( documentId, imageId );
    }

    public Boolean deleteImage ( UUID documentId, UUID imageId ) {
        Boolean deleted = this.s3StorageService.delete( documentId, imageId );
        if (deleted) {
            this.documentImageService.deletePicture( documentId, imageId );
        }
        return deleted;
    }
}
