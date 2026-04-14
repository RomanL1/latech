package com.latech.api.business;

import com.latech.api.model.db.DocumentImage;
import com.latech.api.repository.DocumentImagesRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DocumentImageMappingService {

    private final DocumentImagesRepository repository;

    public DocumentImageMappingService(DocumentImagesRepository repository) {
        this.repository = repository;
    }

    public List<DocumentImage> getPicturesForDocument(UUID documentId) {
        return this.repository.findAllByDocumentId(documentId);
    }

    public Optional<DocumentImage> getPictureFromDocumentIdAndImageName(UUID documentId, String name){
        return this.repository.findByDocumentIdAndUserSuppliedName(documentId, name);
    }

    public DocumentImage registerPicture(UUID documentId, String userSuppliedName) {
        DocumentImage picture = new DocumentImage();
        picture.setDocumentId(documentId);
        picture.setUserSuppliedName(userSuppliedName);
        return repository.save(picture);
    }
}