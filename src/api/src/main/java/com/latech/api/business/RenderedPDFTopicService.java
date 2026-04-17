package com.latech.api.business;

import com.latech.api.model.api.PDFReadyMessageDto;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@NullMarked
@Slf4j
public class RenderedPDFTopicService {
    //key -> docId
    //value -> list of emitters
    private final ConcurrentHashMap<String, CopyOnWriteArrayList<SseEmitter>> docRegistry;

    public RenderedPDFTopicService () {
        docRegistry = new ConcurrentHashMap<>();
    }

    public void subscribeTo ( final String docId, final SseEmitter emitter ) {
        if ( !docRegistry.containsKey( docId ) ) {
            docRegistry.putIfAbsent( docId, new CopyOnWriteArrayList<>() );
        }

        emitter.onCompletion( () -> docRegistry.get( docId ).remove( emitter ) );
        emitter.onTimeout( () -> {
            emitter.complete();
            log.warn( "Emitter timed out" );
            docRegistry.get( docId ).remove( emitter );
        } );

        emitter.onError( ( e ) -> {
            log.error( "Emitter error: " + e.getMessage() );
            docRegistry.get( docId ).remove( emitter );
        } );

        docRegistry.get( docId ).add( emitter );
    }

    public void notifyAll ( final String docId, final PDFReadyMessageDto pdfReadyMessage ) {
        List<SseEmitter> group = docRegistry.get( docId );
        if ( group != null ) {
            group.forEach( emitter -> {
                try {
                    emitter.send( SseEmitter.event()
                            .id( UUID.randomUUID().toString() )
                            .name( "pdf-ready" )
                            .data( pdfReadyMessage, MediaType.APPLICATION_JSON )
                            .build() );
                } catch ( Exception e ) {
                    log.error( "Emitter error: {}", e.getMessage() );
                    docRegistry.get( docId ).remove( emitter );
                }
            } );
        }
    }
}
