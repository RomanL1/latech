package com.latech.api.business;

import com.latech.api.model.db.DocumentImage;
import com.latech.api.repository.DocumentImageRepository;

import jakarta.transaction.Transactional;

import org.springframework.data.crossstore.ChangeSetPersister.NotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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

    public Optional<DocumentImage> getPictureFromDocumentIdAndImageName(UUID documentId, String name) {
        return this.repository.findByDocumentIdAndUserSuppliedName(documentId, name);
    }

    public Optional<DocumentImage> getPictureFromDocumentAndImageId(UUID documentId, UUID imageId) {
        return this.repository.findByDocumentIdAndImageId(documentId, imageId);
    }

    public DocumentImage registerPicture(UUID documentId, String userSuppliedName, String mimeType) {
        DocumentImage picture = new DocumentImage();
        picture.setDocumentId(documentId);
        picture.setUserSuppliedName(userSuppliedName);
        picture.setMimeType(mimeType);
        return repository.save(picture);
    }

    public DocumentImage updatePicture(UUID documentId, UUID imageId, String userSuppliedName) {
        DocumentImage picture = this.getPictureFromDocumentAndImageId(documentId, imageId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Picture not found"));

        picture.setUserSuppliedName(userSuppliedName);
        return repository.save(picture);
    }

    @Transactional
    public void deletePicture(UUID documentId, UUID imageId) {
        this.repository.deleteByDocumentIdAndImageId(documentId, imageId);
    }

    public boolean pictureExistsWithDocumentIdAndImageName(UUID documentId, String name){
        return this.repository.existsByDocumentIdAndUserSuppliedName( documentId, name );
    }

    public boolean pictureExistsWithDocumentIdAndImageId(UUID documentId, UUID imageId){
        return this.repository.existsByDocumentIdAndImageId( documentId, imageId );
    }
}
