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
import java.awt.image.ConvolveOp;
import java.awt.image.Kernel;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;
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
        try {
            var document = documentRepository.findById( documentId ).orElseThrow();

            boolean secured = !ObjectUtils.isEmpty( document.getPassword() );

            ResponseInputStream<GetObjectResponse> s3Stream = s3Client.getObject(
                    b -> b.bucket( this.bucket ).key( documentId + ".pdf" ) );
            byte[] pdfBytes = s3Stream.readAllBytes();

            try (PDDocument pdf = Loader.loadPDF( pdfBytes )) {
                PDFRenderer pdfRenderer = new PDFRenderer( pdf );

                float dpi = 80;
                BufferedImage bufferedImage = pdfRenderer.renderImageWithDPI( 0, dpi, ImageType.RGB );

                if ( secured ) {
                    for (int x = 0; x < 2; x++) {
                        bufferedImage = blur( bufferedImage, 15 );
                    }
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

    public Optional<byte[]> getThumbnailForDocument ( UUID documentId ) {
        try {
            GetObjectRequest request = GetObjectRequest.builder().bucket( bucket )
                    .key( getThumbnailFileName( documentId ) )
                    .build();
            return Optional.of( s3StorageService.download( request ) );
        } catch ( Exception e ) {
            log.error( "Could not get thumbnail from pdf", e );
            return Optional.empty();
        }
    }

    public String getThumbnailFileName ( UUID documentId ) {
        return documentId + "-thumbnail.png";
    }

    /**
     * Blurs a BufferedImage using a standard box blur kernel.
     *
     * @param sourceImage The original image to be blurred.
     * @param size        The radius weight of the blur (e.g., 3 for 3x3, 5 for 5x5). Must be an odd number.
     * @return A new blurred BufferedImage.
     */
    private BufferedImage blur ( BufferedImage sourceImage, int size ) {
        // 1. Create an array representing the blurring matrix
        int totalElements = size * size;
        float[] matrix = new float[totalElements];

        // 2. Distribute weight evenly so the image maintains its brightness
        float weight = 1.0f / totalElements;

        Arrays.fill( matrix, weight );

        // 3. Build the kernel and the convolution operation
        Kernel kernel = new Kernel( size, size, matrix );
        ConvolveOp op = new ConvolveOp( kernel, ConvolveOp.EDGE_NO_OP, null );

        // 4. Run the filter and return the newly generated image
        return op.filter( sourceImage, null );
    }
}
