package com.latech.api.business;

import com.latech.api.api.DocumentController;
import com.latech.api.model.api.PDFReadyMessageDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class PdfRenderedNotifier {

    private final PDFStreamTopicService pdfStreamTopicService;

    public void publish ( String docId, String docPath, boolean success, String logMessage, Instant lastChange ) {
        String downloadUri = DocumentController.getDownloadPath( docPath );

        PDFReadyMessageDto pdfReadyMessage = PDFReadyMessageDto.builder()
                .docId( docId )
                .success( success )
                .logMessage( logMessage )
                .downloadPath( downloadUri )
                .timestampUTC( System.currentTimeMillis() )
                .lastChange( lastChange )
                .build();

        pdfStreamTopicService.notifyAll( docId, pdfReadyMessage );
    }
}
