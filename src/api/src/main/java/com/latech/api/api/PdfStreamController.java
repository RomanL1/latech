package com.latech.api.api;

import com.latech.api.business.PDFStreamTopicService;
import com.latech.api.model.api.DocumentTimestampsDto;
import com.latech.api.model.db.Document;
import com.latech.api.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;
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

    @Nullable
    @GetMapping( "/{docId}/stream-updates" )
    public SseEmitter streamUpdates ( @PathVariable String docId ) {
        if ( ObjectUtils.isEmpty( docId ) ) {
            return null;
        }

        UUID id = UUID.fromString( docId );
        Optional<Document> _document = documentRepository.findById( id );
        if ( ObjectUtils.isEmpty( _document ) ) {
            return null;
        }

        var document = _document.get();

        final SseEmitter emitter = new SseEmitter( Long.MAX_VALUE );

        pdfStreamTopicService.subscribeTo( id.toString(), emitter );
        pdfStreamTopicService.notifyTimestamps( id.toString(), new DocumentTimestampsDto( document.getLastChange(),
                                                                                          document.getLastCompile() ) );
        pdfStreamTopicService.notifyAutoRenderSetting( id.toString(), document.isAutoRenderEnabled() );
        return emitter;
    }
}
