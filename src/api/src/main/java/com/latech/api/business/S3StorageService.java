package com.latech.api.business;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.InputStream;

@Slf4j
@Service
public class S3StorageService {

    private final S3Client s3Client;

    @Value( "${seaweedfs.bucket}" )
    private String bucket;

    public S3StorageService ( S3Client s3Client ) {
        this.s3Client = s3Client;
    }

    @PostConstruct
    void init () {
        int maxRetries = 10;
        int retryDelayMs = 5000;
        for (int i = 0; i < maxRetries; i++) {
            try {
                s3Client.createBucket( b -> b.bucket( this.bucket ) );
                log.info( "Successfully initialized bucket: {}", this.bucket );
                return;
            } catch ( BucketAlreadyOwnedByYouException | BucketAlreadyExistsException e ) {
                log.info( "Bucket already exists, that's fine." );
                return;
            } catch ( Exception e ) {
                log.warn( "Failed to create bucket (attempt {}/{}). Retrying in {}ms: {}", i + 1, maxRetries,
                          retryDelayMs, e.getMessage() );
                try {
                    Thread.sleep( retryDelayMs );
                } catch ( InterruptedException ie ) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException( "Interrupted while waiting to initialize bucket", ie );
                }
            }
        }
        log.error( "Failed to initialize bucket after {} attempts", maxRetries );
    }

    public void upload ( PutObjectRequest putObjectRequest, InputStream inputStream, long contentLength ) {
        s3Client.putObject(
                putObjectRequest,
                RequestBody.fromInputStream( inputStream, contentLength ) );
    }

    public byte[] download ( GetObjectRequest getObjectRequest ) {
        return s3Client.getObjectAsBytes(
                        getObjectRequest ).asByteArray();
    }

    public boolean delete ( DeleteObjectRequest deleteObjectRequest ) {
        try {
            s3Client.deleteObject( deleteObjectRequest );

            return true;

        } catch ( S3Exception e ) {
            log.error( "Failed to delete object from S3: {}", deleteObjectRequest.key(), e );
            return false;
        }
    }
}
