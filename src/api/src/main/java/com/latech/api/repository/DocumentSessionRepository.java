package com.latech.api.repository;

import com.latech.api.model.db.DocumentSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface DocumentSessionRepository extends JpaRepository<DocumentSession, UUID> {

    Optional<DocumentSession> findByTokenHash(String tokenHash);

    Optional<DocumentSession> findByTokenHashAndDocument_Id(String tokenHash, UUID documentId);

    @Transactional
    long deleteByTokenHash(String tokenHash);

    @Transactional
    long deleteByTokenHashAndDocument_Id(String tokenHash, UUID documentId);

    @Transactional
    long deleteByExpiresAtBefore(Instant now);

    @Transactional
    long deleteByDocument_Id(UUID documentId);
}
