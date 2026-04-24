package com.latech.api.api;

import com.latech.api.business.RenderedPDFTopicService;
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

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping( "api/document" )
@NullMarked
public class PdfRenderedStreamController {
    private final RenderedPDFTopicService renderedPdfTopicService;

    @Nullable
    @GetMapping( "/{docId}/stream-updates" )
    public SseEmitter streamUpdates ( @PathVariable String docId ) {
        if ( ObjectUtils.isEmpty( docId ) ) {
            return null;
        }

        final SseEmitter emitter = new SseEmitter( Long.MAX_VALUE );

        renderedPdfTopicService.subscribeTo( docId, emitter );

        return emitter;
    }
}
