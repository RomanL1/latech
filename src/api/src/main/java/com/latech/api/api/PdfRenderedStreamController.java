package com.latech.api.api;

import com.latech.api.business.DocumentAuthService;
import com.latech.api.business.RenderedPDFTopicService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.ObjectUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping( "api/document" )
@NullMarked
public class PdfRenderedStreamController {
    private final RenderedPDFTopicService renderedPdfTopicService;
    private final DocumentAuthService documentAuthService;

    @GetMapping("/{docId}/stream-updates")
    public ResponseEntity<SseEmitter> streamUpdates(
            @PathVariable String docId,
            HttpServletRequest request) {

        if (ObjectUtils.isEmpty(docId)) {
            return ResponseEntity.badRequest().build();
        }

        UUID documentId = UUID.fromString( docId);

        if (!documentAuthService.hasAccess(documentId, request)) {
            return ResponseEntity.status( HttpStatus.UNAUTHORIZED).build();
        }

        final SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

        renderedPdfTopicService.subscribeTo(docId, emitter);

        return ResponseEntity.ok(emitter);
    }
}
