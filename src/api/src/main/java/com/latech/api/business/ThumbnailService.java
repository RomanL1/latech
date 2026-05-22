package com.latech.api.business;

import com.latech.api.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ThumbnailService {

    private final DocumentRepository documentRepository;
    private final S3Client s3Client;
    private final S3StorageService s3StorageService;

    @Value( "${seaweedfs.bucket}" )
    private String bucket;

    public void extractAndSaveThumbnailForDocument ( UUID documentId ) {
        var document = documentRepository.findById( documentId ).orElseThrow();

        boolean secured = !ObjectUtils.isEmpty( document.getPassword() );

        ResponseInputStream<GetObjectResponse> s3Stream = s3Client.getObject(
                b -> b.bucket( this.bucket ).key( documentId + ".pdf" ) );

        try {
            byte[] pdfBytes = s3Stream.readAllBytes();

            try (PDDocument pdf = Loader.loadPDF( pdfBytes )) {
                PDFRenderer pdfRenderer = new PDFRenderer( pdf );

                float dpi = 300;
                BufferedImage bufferedImage = pdfRenderer.renderImageWithDPI( 0, dpi, ImageType.RGB );
                if ( secured ) {
                    //todo blur
                }
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write( bufferedImage, "png",
                               baos );                          // Write image data into memory buffer
                byte[] imageBytes = baos.toByteArray();

                String fileName = getThumbnailFileName( documentId );

                //put overwrites if exists
                PutObjectRequest request = PutObjectRequest.builder().bucket( bucket ).key( fileName ).build();
                s3StorageService.upload( request, new ByteArrayInputStream( imageBytes ), imageBytes.length );
            }

        } catch ( IOException e ) {
            log.error( "Could not generate thumbnail from pdf", e );
        }
    }

    public byte[] getThumbnailForDocument ( UUID documentId ) {
        GetObjectRequest request = GetObjectRequest.builder().bucket( bucket ).key( getThumbnailFileName( documentId ) )
                .build();
        return s3StorageService.download( request );
    }

    public String getThumbnailFileName ( UUID documentId ) {
        return documentId + "-thumbnail.png";
    }
}
