package com.latech.api.business;

import com.latech.api.config.CacheConfig;
import com.latech.api.model.db.DocumentSession;
import com.latech.api.repository.DocumentSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DocumentSessionCache {

    private final DocumentSessionRepository documentSessionRepository;

    @Cacheable( value = CacheConfig.DOCUMENT_SESSION_STATUS, key = "#tokenHash + ':' + #documentId" )
    public Optional<DocumentSession> findSession ( String tokenHash, UUID documentId ) {
        return documentSessionRepository.findByTokenHashAndDocument_Id( tokenHash, documentId );
    }

    @CacheEvict( value = CacheConfig.DOCUMENT_SESSION_STATUS, key = "#tokenHash + ':' + #documentId" )
    public void evict ( String tokenHash, UUID documentId ) {}
}
