package com.latech.api.poc.service;

import com.latech.api.poc.model.FileRecord;
import com.latech.api.poc.repository.FileRepository;
import com.latech.api.poc.storage.MinioStorageService;

import java.io.InputStream;

public class FileService {

    private final MinioStorageService minioStorageService;
    private final FileRepository fileRepository;

    public FileService(MinioStorageService minioStorageService, FileRepository fileRepository) {
        this.minioStorageService = minioStorageService;
        this.fileRepository = fileRepository;
    }

    public FileRecord uploadAndRegisterFile(
            String objectName,
            String originalFilename,
            InputStream inputStream,
            long size,
            String contentType
    ) throws Exception {

        minioStorageService.createBucketIfNotExists();
        minioStorageService.uploadFile(objectName, inputStream, size, contentType);

        FileRecord fileRecord = new FileRecord(
                originalFilename,
                minioStorageService.getBucketName(),
                objectName,
                contentType,
                size
        );

        return fileRepository.save(fileRecord);
    }

    public InputStream downloadFileById(int fileId) throws Exception {
        FileRecord fileRecord = fileRepository.findById(fileId);

        if (fileRecord == null) {
            throw new IllegalArgumentException("File not found with id=" + fileId);
        }

        return minioStorageService.getFile(fileRecord.getObjectKey());
    }

    public boolean deleteFileById(int fileId) throws Exception {
        FileRecord fileRecord = fileRepository.findById(fileId);

        if (fileRecord == null) {
            return false;
        }

        minioStorageService.deleteFile(fileRecord.getObjectKey());
        return fileRepository.deleteById(fileId);
    }

    public FileRecord getMetadataById(int fileId) throws Exception {
        return fileRepository.findById(fileId);
    }
}