package com.latech.renderer.business;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.sync.ResponseTransformer;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;

import java.nio.file.Path;

@Slf4j
@Component
public class S3Service {

    private final S3Client s3Client;

    @Value( "${seaweedfs.bucket}" )
    private String bucket;

    public S3Service(S3Client s3Client){
        this.s3Client = s3Client;
    }

    public void getFileAndSaveToPath (String s3FileKey, Path newFilePathWithFileName){
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket( this.bucket )
                .key( s3FileKey )
                .build();

        s3Client.getObject( getObjectRequest, ResponseTransformer.toFile( newFilePathWithFileName ) );
    }

    public void saveFileToS3 (String payloadS3Key, Path filePath){
        s3Client.putObject(
                b -> b.bucket( this.bucket ).key( payloadS3Key ),
                filePath );
    }
}
