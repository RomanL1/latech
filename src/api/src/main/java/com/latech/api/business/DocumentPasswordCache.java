package com.latech.api.business;

import com.latech.api.config.CacheConfig;
import com.latech.api.repository.DocumentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DocumentPasswordCache {

    private final DocumentRepository documentRepository;

    @Cacheable( CacheConfig.DOCUMENT_PASSWORD_STATUS )
    public boolean isUnsecured ( UUID documentId ) {
        return documentRepository.findById( documentId )
                .map( d -> !StringUtils.hasText( d.getPassword() ) )
                .orElseThrow( EntityNotFoundException::new );
    }
}
