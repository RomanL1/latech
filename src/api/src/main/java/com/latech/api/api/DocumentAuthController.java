package com.latech.api.api;

import com.latech.api.business.DocumentAuthService;
import com.latech.api.model.api.DocumentAuthStatusDto;
import com.latech.api.model.api.DocumentUnlockRequestDto;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.ObjectUtils;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("api/document")
public class DocumentAuthController {

    private final DocumentAuthService documentAuthService;

    @PostMapping("/{docId}/unlock")
    public ResponseEntity<Void> unlockDocument(
            @PathVariable String docId,
            @RequestBody DocumentUnlockRequestDto requestDto,
            HttpServletResponse response
    ) {
        UUID documentId = parseDocumentId(docId);

        if (documentId == null ||
                ObjectUtils.isEmpty(requestDto) ||
                ObjectUtils.isEmpty(requestDto.password())) {
            return ResponseEntity.badRequest().build();
        }

        try {
            boolean unlocked = documentAuthService.unlockDocument(
                    documentId,
                    requestDto.password(),
                    response
            );

            if (!unlocked) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            return ResponseEntity.ok().build();

        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{docId}/auth-status")
    public ResponseEntity<DocumentAuthStatusDto> getAuthStatus(
            @PathVariable String docId,
            HttpServletRequest request
    ) {
        UUID documentId = parseDocumentId(docId);

        if (documentId == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            boolean authenticated = documentAuthService.hasAccess(documentId, request);

            if (!authenticated) {
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(new DocumentAuthStatusDto(false));
            }

            return ResponseEntity.ok(new DocumentAuthStatusDto(true));

        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{docId}/logout")
    public ResponseEntity<Void> logoutDocument(
            @PathVariable String docId,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        UUID documentId = parseDocumentId(docId);

        if (documentId == null) {
            return ResponseEntity.badRequest().build();
        }

        documentAuthService.logout(documentId, request, response);

        return ResponseEntity.ok().build();
    }

    private UUID parseDocumentId(String docId) {
        if (ObjectUtils.isEmpty(docId)) {
            return null;
        }

        try {
            return UUID.fromString(docId);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
