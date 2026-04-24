package com.latech.api.business;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.BucketAlreadyExistsException;
import software.amazon.awssdk.services.s3.model.BucketAlreadyOwnedByYouException;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;

import java.io.InputStream;
import java.util.UUID;

@Slf4j
@Service
public class S3StorageService {

    private final S3Client s3Client;

    @Value("${seaweedfs.bucket}")
    private String bucket;

    public S3StorageService(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    @PostConstruct
    void init() {
        int maxRetries = 10;
        int retryDelayMs = 5000;
        for (int i = 0; i < maxRetries; i++) {
            try {
                s3Client.createBucket(b -> b.bucket(this.bucket));
                log.info("Successfully initialized bucket: {}", this.bucket);
                return;
            } catch (BucketAlreadyOwnedByYouException | BucketAlreadyExistsException e) {
                log.info("Bucket already exists, that's fine.");
                return;
            } catch (Exception e) {
                log.warn("Failed to create bucket (attempt {}/{}). Retrying in {}ms: {}", i + 1, maxRetries, retryDelayMs, e.getMessage());
                try {
                    Thread.sleep(retryDelayMs);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Interrupted while waiting to initialize bucket", ie);
                }
            }
        }
        log.error("Failed to initialize bucket after {} attempts", maxRetries);
    }

    public void upload(UUID documentId, UUID fileId, InputStream data, long contentLength) {
        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(documentId + "/" + fileId)
                        .build(),
                RequestBody.fromInputStream(data, contentLength));
    }

    public byte[] download(UUID documentId, UUID fileId) {
        return s3Client.getObjectAsBytes(
                GetObjectRequest.builder()
                        .bucket(bucket)
                        .key(documentId + "/" + fileId)
                        .build())
                .asByteArray();
    }

    public boolean delete(UUID documentId, UUID fileId) {
        String key = documentId + "/" + fileId;

        try {
            s3Client.deleteObject(
                    DeleteObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .build());

            return true;

        } catch (S3Exception e) {
            log.error("Failed to delete object from S3: {}", key, e);
            return false;
        }
    }
}
