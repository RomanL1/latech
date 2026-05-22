package com.latech.api.api;

import com.latech.api.business.DocumentAuthService;
import com.latech.api.business.PDFStreamTopicService;
import com.latech.api.model.api.DocumentTimestampsDto;
import com.latech.api.model.db.Document;
import com.latech.api.repository.DocumentRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.ObjectUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping( "api/document" )
@NullMarked
public class PdfStreamController {
    private final PDFStreamTopicService pdfStreamTopicService;
    private final DocumentRepository documentRepository;
    private final DocumentAuthService documentAuthService;

    @GetMapping( "/{docId}/stream-updates" )
    public ResponseEntity<SseEmitter> streamUpdates ( @PathVariable String docId, HttpServletRequest request ) {
        if ( ObjectUtils.isEmpty( docId ) ) {
            return ResponseEntity.badRequest().build();
        }

        UUID id = UUID.fromString( docId );
        Optional<Document> _document = documentRepository.findById( id );
        if ( _document.isEmpty() ) {
            return ResponseEntity.status( HttpStatus.NOT_FOUND ).build();
        }

        if ( !documentAuthService.hasAccess( id, request ) ) {
            return ResponseEntity.status( HttpStatus.UNAUTHORIZED ).build();
        }

        var document = _document.get();

        final SseEmitter emitter = new SseEmitter( Long.MAX_VALUE );

        pdfStreamTopicService.subscribeTo( id.toString(), emitter );
        pdfStreamTopicService.notifyTimestamps( id.toString(), new DocumentTimestampsDto( document.getLastChange(),
                                                                                          document.getLastCompile() ) );
        pdfStreamTopicService.notifyAutoRenderSetting( id.toString(), document.isAutoRenderEnabled() );

        return ResponseEntity.ok( emitter );
    }
}
