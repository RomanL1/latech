package com.latech.api.poc.model;

import java.sql.Timestamp;

public class FileRecord {
    private Integer id;
    private String filename;
    private String bucket;
    private String objectKey;
    private String mimeType;
    private Long sizeBytes;
    private Timestamp createdAt;

    public FileRecord() {
    }

    public FileRecord(String filename, String bucket, String objectKey, String mimeType, Long sizeBytes) {
        this.filename = filename;
        this.bucket = bucket;
        this.objectKey = objectKey;
        this.mimeType = mimeType;
        this.sizeBytes = sizeBytes;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getBucket() {
        return bucket;
    }

    public void setBucket(String bucket) {
        this.bucket = bucket;
    }

    public String getObjectKey() {
        return objectKey;
    }

    public void setObjectKey(String objectKey) {
        this.objectKey = objectKey;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public Long getSizeBytes() {
        return sizeBytes;
    }

    public void setSizeBytes(Long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "FileRecord{" +
                "id=" + id +
                ", filename='" + filename + '\'' +
                ", bucket='" + bucket + '\'' +
                ", objectKey='" + objectKey + '\'' +
                ", mimeType='" + mimeType + '\'' +
                ", sizeBytes=" + sizeBytes +
                ", createdAt=" + createdAt +
                '}';
    }
}