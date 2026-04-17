package com.latech.api.repository;

import com.latech.api.model.db.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {
    Optional<Document> findByIdAndPassword ( UUID id, String password );
}
