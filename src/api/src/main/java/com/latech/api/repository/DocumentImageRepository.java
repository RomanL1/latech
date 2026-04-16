package com.latech.api.repository;

import com.latech.api.model.db.DocumentImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentImageRepository extends JpaRepository<DocumentImage, UUID> {
    Optional<DocumentImage> findByDocumentIdAndUserSuppliedName(UUID documentId, String name);
    List<DocumentImage> findAllByDocumentId(UUID documentId);
}