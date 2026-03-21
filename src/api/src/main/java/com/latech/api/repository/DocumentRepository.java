package com.latech.api.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.latech.api.model.db.Document;

public interface DocumentRepository extends JpaRepository<Document, UUID>
{
	Optional<Document> findByIdAndPassword ( UUID id, String password );
}
