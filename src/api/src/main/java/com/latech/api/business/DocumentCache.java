package com.latech.api.business;

import com.latech.api.config.CacheConfig;
import com.latech.api.model.db.Document;
import com.latech.api.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DocumentCache {

    private final DocumentRepository documentRepository;

    @Cacheable(value = CacheConfig.DOCUMENT, key = "#documentId")
    public Optional<Document> findById(UUID documentId) {
        return documentRepository.findById(documentId);
    }

    @CacheEvict(value = CacheConfig.DOCUMENT, key = "#documentId")
    public void evict(UUID documentId) {}
}
