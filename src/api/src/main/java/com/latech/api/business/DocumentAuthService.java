package com.latech.api.business;

import com.latech.api.model.db.Document;
import com.latech.api.repository.DocumentRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentAuthService {

    private final DocumentRepository documentRepository;
    private final DocumentSessionService documentSessionService;
    private final PasswordEncoder passwordEncoder;

    public String hashDocumentPassword(String rawPassword) {
        if (!StringUtils.hasText(rawPassword)) {
            return null;
        }

        return passwordEncoder.encode(rawPassword);
    }

    public boolean unlockDocument(
            UUID documentId,
            String rawPassword,
            HttpServletResponse response
    ) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(EntityNotFoundException::new);

        if (!StringUtils.hasText(document.getPassword())) {
            return true;
        }

        if (!StringUtils.hasText(rawPassword)) {
            return false;
        }

        boolean passwordMatches = passwordEncoder.matches(rawPassword, document.getPassword());

        if (!passwordMatches) {
            return false;
        }

        documentSessionService.createSession(document, response);

        return true;
    }

    public boolean hasAccess(UUID documentId, HttpServletRequest request) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(EntityNotFoundException::new);

        if (!StringUtils.hasText(document.getPassword())) {
            return true;
        }

        return documentSessionService.hasValidSession(documentId, request);
    }

    public void requireAccess(UUID documentId, HttpServletRequest request) {
        if (!hasAccess(documentId, request)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
    }

    public void logout(
            UUID documentId,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        documentSessionService.logout(documentId, request, response);
    }
}
