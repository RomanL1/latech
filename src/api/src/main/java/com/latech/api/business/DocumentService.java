package com.latech.api.business;

import com.latech.api.model.db.DocumentImage;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NullMarked;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
@NullMarked
public class DocumentService {
    private final DocumentImageService documentImageService;
    private final DocumentProducer documentProducer;

    public void sendRenderRequest ( UUID documentId, String content ) {
        List<DocumentImage> documentImages = documentImageService.getPicturesForDocument( documentId );

        DocumentRecord.Builder documentRecordBuilder = DocumentRecord.newBuilder()
                .setRenderId( UUID.randomUUID().toString() )
                .setDocumentId( documentId.toString() )
                .setLatexContent( content );

        for (DocumentImage image : documentImages) {
            documentRecordBuilder.putImages( String.valueOf( image.getImageId() ), image.getUserSuppliedName() );
        }
        DocumentRecord documentRecord = documentRecordBuilder.build();

        documentProducer.publishDocumentReadyToRender( documentRecord );
    }
}
