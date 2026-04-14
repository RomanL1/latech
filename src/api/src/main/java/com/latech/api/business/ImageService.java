package com.latech.api.business;

import com.latech.api.model.db.DocumentImage;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Service
public class ImageService {

    private final DocumentImageMappingService documentImageMappingService;
    private final S3StorageService s3StorageService;

    public ImageService(DocumentImageMappingService documentImageMappingService, S3StorageService s3StorageService) {
        this.documentImageMappingService = documentImageMappingService;
        this.s3StorageService = s3StorageService;
    }

    public void uploadImage(UUID documentId, String name, MultipartFile file) throws IOException {
        DocumentImage entry = this.documentImageMappingService.registerPicture(documentId, name);
        this.s3StorageService.upload(documentId, entry.getImageId(), file.getInputStream(), file.getSize());
    }

    public byte[] downloadImage(UUID documentId, String name){
        Optional<DocumentImage> entry = this.documentImageMappingService
                                            .getPictureFromDocumentIdAndImageName(documentId, name);
        if (entry.isPresent()){
            return this.s3StorageService.download(documentId, entry.get().getImageId());
        }else{
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
    }
}
