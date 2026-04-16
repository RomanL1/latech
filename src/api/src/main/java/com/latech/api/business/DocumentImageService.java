package com.latech.api.business;

import com.latech.api.model.db.DocumentImage;
import com.latech.api.repository.DocumentImageRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DocumentImageService {

    private final DocumentImageRepository repository;

    public DocumentImageService(DocumentImageRepository repository) {
        this.repository = repository;
    }

    public List<DocumentImage> getPicturesForDocument(UUID documentId) {
        return this.repository.findAllByDocumentId(documentId);
    }

    public Optional<DocumentImage> getPictureFromDocumentIdAndImageName(UUID documentId, String name){
        return this.repository.findByDocumentIdAndUserSuppliedName(documentId, name);
    }

    public DocumentImage registerPicture(UUID documentId, String userSuppliedName, String mimeType) {
        DocumentImage picture = new DocumentImage();
        picture.setDocumentId(documentId);
        picture.setUserSuppliedName(userSuppliedName);
        picture.setMimeType( mimeType );
        return repository.save(picture);
    }
}