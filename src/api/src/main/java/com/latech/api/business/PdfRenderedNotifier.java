package com.latech.api.business;

import com.latech.api.api.DocumentController;
import com.latech.api.model.api.PDFReadyMessageDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PdfRenderedNotifier {

    private final RenderedPDFTopicService renderedPDFTopicService;

    public void publish ( String docId, String docPath, boolean success, String errorMessage ) {
        String downloadUri = DocumentController.getDownloadPath( docPath );

        PDFReadyMessageDto pdfReadyMessage = PDFReadyMessageDto.builder()
                .docId( docId )
                .success( success )
                .errorMessage( errorMessage )
                .downloadPath( downloadUri )
                .timestampUTC( System.currentTimeMillis() )
                .build();

        renderedPDFTopicService.notifyAll( docId, pdfReadyMessage );
    }
}
