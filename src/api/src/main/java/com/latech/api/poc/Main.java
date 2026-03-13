package com.latech.api.poc;

import com.latech.api.poc.model.FileRecord;
import com.latech.api.poc.repository.FileRepository;
import com.latech.api.poc.service.FileService;
import com.latech.api.poc.storage.MinioStorageService;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public class Main {

    public static void main(String[] args) throws Exception {

        MinioStorageService minioStorageService = new MinioStorageService(
                "http://localhost:9000",
                "admin",
                "password123",
                "documents"
        );

        FileRepository fileRepository = new FileRepository(
                "jdbc:postgresql://localhost:5432/latech",
                "myuser",
                "secret"
        );

        FileService fileService = new FileService(
                minioStorageService,
                fileRepository
        );

        String content = "Hello from Postgres + MinIO";
        byte[] bytes = content.getBytes(StandardCharsets.UTF_8);

        FileRecord saved = fileService.uploadAndRegisterFile(
                "test/hello.txt",
                "hello.txt",
                new ByteArrayInputStream(bytes),
                bytes.length,
                "text/plain"
        );

        System.out.println("File saved in database: " + saved);

        FileRecord metadata = fileService.getMetadataById(saved.getId());
        System.out.println("Metadata loaded from database: " + metadata);

        try (InputStream in = fileService.downloadFileById(saved.getId())) {

            String downloaded = new String(
                    in.readAllBytes(),
                    StandardCharsets.UTF_8
            );

            System.out.println("Content downloaded from MinIO: " + downloaded);
        }

        boolean deleted = fileService.deleteFileById(saved.getId());
        System.out.println("File deleted from MinIO and database: " + deleted);
    }
}