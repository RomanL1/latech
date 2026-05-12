package com.latech.renderer.business;

import com.latech.renderer.api.DocumentRecord;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.FileSystemUtils;
import software.amazon.awssdk.core.sync.ResponseTransformer;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Component
@Slf4j
public class FileWorker {

    private static final Path WORK_DIR = Path.of("/workdir");
    private final S3Client s3Client;

    @Value( "${seaweedfs.bucket}" )
    private String bucket;

    public FileWorker( S3Client s3Client){
        this.s3Client = s3Client;
    }

    public Path setupFiles(DocumentRecord documentRecord) throws IOException, InterruptedException {
        //TODO(marc): figure out if we reject absurdly large .tex files here, or already in the API
        Path renderIdDirectory = WORK_DIR.resolve( documentRecord.getRenderId() + "/");
        Path texFile = renderIdDirectory.resolve(documentRecord.getDocumentId() + ".tex");
        Files.createDirectories( renderIdDirectory );
        new ProcessBuilder("chown", "1001:1001", renderIdDirectory.toString())
                .start().waitFor();
        Files.writeString(texFile, documentRecord.getLatexContent());

        if (documentRecord.getImagesCount() <= 0){
            return texFile;
        }

        try {
            for (String imageUUID : documentRecord.getImagesMap().keySet()) {
                String s3ImageKey = documentRecord.getDocumentId() + "/" + imageUUID;
                GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                        .bucket( this.bucket )
                        .key( s3ImageKey )
                        .build();

                String userSuppliedName = documentRecord.getImagesMap().get( imageUUID );
                Path imagePath = renderIdDirectory.resolve( userSuppliedName );
                s3Client.getObject( getObjectRequest, ResponseTransformer.toFile( imagePath ) );
            }
        }catch ( S3Exception e ){
            log.error( "S3Exception: {}", e.getMessage() );
            throw new RuntimeException("Error while trying to fetch images from Server", e);
        }
        return texFile;
    }

    public static void cleanup(String renderId) throws IOException {
        try {
            Path directoryToDelete = WORK_DIR.resolve( renderId + "/" );
            FileSystemUtils.deleteRecursively( directoryToDelete );
        } catch ( IOException e ) {
            log.error( "Error while trying to cleanup: {}", e.getMessage() );
            throw new IOException( e );
        }
    }
}
