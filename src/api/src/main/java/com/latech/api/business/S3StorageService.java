package com.latech.api.business;


import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.BucketAlreadyExistsException;
import software.amazon.awssdk.services.s3.model.BucketAlreadyOwnedByYouException;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.InputStream;
import java.util.UUID;

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
        try {
            s3Client.createBucket( b -> b.bucket( this.bucket ) );
        } catch ( BucketAlreadyOwnedByYouException | BucketAlreadyExistsException e ) {
            log.info( "Bucket already exists, that's fine." );
        }
    }

    public void upload ( UUID documentId, UUID fileId, InputStream data, long contentLength ) {
        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket( bucket )
                        .key( documentId + "/" + fileId )
                        .build(),
                RequestBody.fromInputStream( data, contentLength )
        );
    }

    public byte[] download ( UUID documentId, UUID fileId ) {
        return s3Client.getObjectAsBytes(
                GetObjectRequest.builder()
                        .bucket( bucket )
                        .key( documentId + "/" + fileId )
                        .build()
        ).asByteArray();
    }
}
