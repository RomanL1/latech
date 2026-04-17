package com.latech.api.api;

import com.latech.api.model.api.DocumentCallbackDto;
import com.latech.api.model.db.Document;
import com.latech.api.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.util.ObjectUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping( "api/document/callback" )
public class DocumentCallbackController {
    private final DocumentRepository documentRepository;

    @PostMapping
    public ResponseEntity<Void> saveDocumentState ( @RequestBody DocumentCallbackDto documentCallbackDto ) {
        if ( ObjectUtils.isEmpty( documentCallbackDto ) || ObjectUtils.isEmpty( documentCallbackDto.getRoom() ) ) {
            return ResponseEntity.badRequest().build();
        }

        String docId = documentCallbackDto.getRoom();

        Optional<Document> documentOpt = documentRepository.findById( UUID.fromString( docId ) );
        if ( documentOpt.isEmpty() ) {
            return ResponseEntity.notFound().build();
        }

        log.info( "Saving document state ..." );
        log.info( "Room: " + documentCallbackDto.getRoom() );
        log.info( "Data: " + documentCallbackDto.getData() );

        Document document = documentOpt.get();
        document.setContent( documentCallbackDto.getData() );
        document.setLastChange( Instant.now() );
        documentRepository.save( document );

        return ResponseEntity.ok().build();
    }
}
