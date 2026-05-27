package com.latech.api.api;

import com.latech.api.business.DocumentService;
import com.latech.api.business.InternalSecretValidatorService;
import com.latech.api.business.PDFStreamTopicService;
import com.latech.api.model.api.DocumentCallbackDto;
import com.latech.api.model.api.DocumentTimestampsDto;
import com.latech.api.model.db.Document;
import com.latech.api.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.ObjectUtils;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping( "api/document/callback" )
public class DocumentCallbackController {
    private static final String INTERNAL_SECRET_HEADER = "X-Internal-Secret";
    private final DocumentRepository documentRepository;
    private final PDFStreamTopicService pdfStreamTopicService;
    private final DocumentService documentService;
    private final InternalSecretValidatorService internalSecretValidatorService;

    @PostMapping
    public ResponseEntity<Void> saveDocumentState ( @RequestHeader( value = INTERNAL_SECRET_HEADER, required = false ) String providedSecret, @RequestBody DocumentCallbackDto documentCallbackDto ) {

        if ( !internalSecretValidatorService.isValidInternalSecret( providedSecret ) ) {
            return ResponseEntity.status( HttpStatus.FORBIDDEN ).build();
        }

        if ( ObjectUtils.isEmpty( documentCallbackDto ) || ObjectUtils.isEmpty( documentCallbackDto.getRoom() ) ) {
            return ResponseEntity.badRequest().build();
        }

        UUID docId = UUID.fromString( documentCallbackDto.getRoom() );

        Optional<Document> documentOpt = documentRepository.findById( docId );
        if ( documentOpt.isEmpty() ) {
            return ResponseEntity.notFound().build();
        }

        String data = documentCallbackDto.getData();
        String stripped = ObjectUtils.isEmpty( data ) ? "" : data.replaceAll( "\\s+", " " ).strip();

        if ( ObjectUtils.isEmpty( stripped ) ) {
            log.warn( "Callback data is empty for Room: {}, ignoring callback sending 400 bad request",
                      documentCallbackDto.getRoom() );
            return ResponseEntity.badRequest().build();
        }

        // possible scenario when connection in frontend is initialized and document gets initially loaded into socket server room
        // sends callback after 2 seconds regardless if something changed or not
        // this if prevents that one unnecessary db write
        if ( documentOpt.get().getContent().equals( documentCallbackDto.getData() ) ) {
            return ResponseEntity.ok().build();
        }

        log.info( "Saving document state ..." );
        log.info( "Room: {}", documentCallbackDto.getRoom() );
        log.debug( "Data: {}", documentCallbackDto.getData() );

        Document document = documentOpt.get();
        document.setContent( documentCallbackDto.getData() );
        document.setLastChange( Instant.now() );

        documentRepository.save( document );

        pdfStreamTopicService.notifyTimestamps( docId.toString(), new DocumentTimestampsDto( document.getLastChange(),
                                                                                             document.getLastCompile() ) );

        if ( document.isAutoRenderEnabled() ) {
            documentService.sendRenderRequest( docId, document.getContent() );
        }

        return ResponseEntity.ok().build();
    }
}
