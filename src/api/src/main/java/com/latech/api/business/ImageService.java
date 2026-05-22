package com.latech.api.business;

import com.latech.api.model.db.DocumentImage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.nio.file.FileAlreadyExistsException;
import java.util.UUID;

@Service
public class ImageService {

    private final DocumentImageService documentImageService;
    private final S3StorageService s3StorageService;

    @Value( "${seaweedfs.bucket}" )
    private String bucket;

    public ImageService ( DocumentImageService documentImageService, S3StorageService s3StorageService ) {
        this.documentImageService = documentImageService;
        this.s3StorageService = s3StorageService;
    }

    public DocumentImage uploadImage ( UUID documentId, String name, MultipartFile file ) throws IOException {
        if ( this.documentImageService.pictureExistsWithDocumentIdAndImageName( documentId, name ) ) {
            throw new FileAlreadyExistsException( name, "", "A file with the name " + name + " already exists." );
        }
        String mimeType = file.getContentType();
        DocumentImage entry = this.documentImageService.registerPicture( documentId, name, mimeType );
        PutObjectRequest request = PutObjectRequest.builder().bucket( bucket )
                .key( documentId + "/" + entry.getImageId() ).build();
        this.s3StorageService.upload( request, file.getInputStream(), file.getSize() );
        return entry;
    }

    public byte[] downloadImage ( UUID documentId, UUID imageId ) {
        GetObjectRequest request = GetObjectRequest.builder().bucket( bucket ).key( documentId + "/" + imageId )
                .build();
        return this.s3StorageService.download( request );
    }

    public Boolean deleteImage ( UUID documentId, UUID imageId ) {
        String key = documentId + "/" + imageId;
        DeleteObjectRequest request = DeleteObjectRequest.builder().bucket( bucket ).key( key ).build();
        Boolean deleted = this.s3StorageService.delete( request );
        if ( deleted ) {
            this.documentImageService.deletePicture( documentId, imageId );
        }
        return deleted;
    }
}
