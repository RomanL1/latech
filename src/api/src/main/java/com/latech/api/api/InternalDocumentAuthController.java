package com.latech.api.api;

import com.latech.api.business.DocumentAuthService;
import com.latech.api.business.InternalSecretValidatorService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.ObjectUtils;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping( "internal/document" )
public class InternalDocumentAuthController {

    private static final String INTERNAL_SECRET_HEADER = "X-Internal-Secret";

    private final DocumentAuthService documentAuthService;
    private final InternalSecretValidatorService internalSecretValidatorService;

    @PostMapping( "/{docId}/authorize-ws" )
    public ResponseEntity<Void> authorizeWebSocket (
            @PathVariable String docId,
            @RequestHeader( value = INTERNAL_SECRET_HEADER, required = false ) String providedSecret,
            HttpServletRequest request
    ) {
        UUID documentId = parseDocumentId( docId );

        if ( documentId == null ) {
            return ResponseEntity.badRequest().build();
        }

        if ( !internalSecretValidatorService.isValidInternalSecret( providedSecret ) ) {
            return ResponseEntity.status( HttpStatus.FORBIDDEN ).build();
        }

        try {
            boolean authorized = documentAuthService.hasAccess( documentId, request );

            if ( !authorized ) {
                return ResponseEntity.status( HttpStatus.UNAUTHORIZED ).build();
            }

            return ResponseEntity.ok().build();

        } catch ( EntityNotFoundException e ) {
            return ResponseEntity.notFound().build();
        }
    }

    private UUID parseDocumentId ( String docId ) {
        if ( ObjectUtils.isEmpty( docId ) ) {
            return null;
        }

        try {
            return UUID.fromString( docId );
        } catch ( IllegalArgumentException e ) {
            return null;
        }
    }
}
