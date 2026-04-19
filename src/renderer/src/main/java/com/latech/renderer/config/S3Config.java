package com.latech.renderer.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

import java.net.URI;

@Configuration
public class S3Config {
    @Value( "${seaweedfs.access-key}" )
    private String accessKey;

    @Value( "${seaweedfs.secret-key}" )
    private String secretKey;

    @Value( "${seaweedfs.host}" )
    private String host;

    @Value( "${seaweedfs.port}" )
    private int port;

    @Bean
    public S3Client s3Client () {
        return S3Client.builder()
                .endpointOverride( URI.create( "http://" + host + ":" + port ) )
                .region( Region.EU_WEST_1 )
                .credentialsProvider( StaticCredentialsProvider.create(
                        AwsBasicCredentials.create( accessKey, secretKey )
                ) )
                .forcePathStyle( true )                        // required — SeaweedFS doesn't do virtual-hosted style
                .build();
    }
}
