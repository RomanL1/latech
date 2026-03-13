package com.latech.api.poc.repository;

import com.latech.api.poc.model.FileRecord;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class FileRepository {

    private final String url;
    private final String user;
    private final String password;

    public FileRepository(String url, String user, String password) {
        this.url = url;
        this.user = user;
        this.password = password;
    }

    private Connection getConnection() throws SQLException {
        return DriverManager.getConnection(url, user, password);
    }

    public FileRecord save(FileRecord fileRecord) throws SQLException {
        String sql = """
                INSERT INTO files (filename, bucket, object_key, mime_type, size_bytes)
                VALUES (?, ?, ?, ?, ?)
                RETURNING id, created_at
                """;

        try (Connection connection = getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setString(1, fileRecord.getFilename());
            statement.setString(2, fileRecord.getBucket());
            statement.setString(3, fileRecord.getObjectKey());
            statement.setString(4, fileRecord.getMimeType());
            statement.setLong(5, fileRecord.getSizeBytes());

            try (ResultSet rs = statement.executeQuery()) {
                if (rs.next()) {
                    fileRecord.setId(rs.getInt("id"));
                    fileRecord.setCreatedAt(rs.getTimestamp("created_at"));
                }
            }
        }

        return fileRecord;
    }

    public FileRecord findById(int id) throws SQLException {
        String sql = """
                SELECT id, filename, bucket, object_key, mime_type, size_bytes, created_at
                FROM files
                WHERE id = ?
                """;

        try (Connection connection = getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setInt(1, id);

            try (ResultSet rs = statement.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        }

        return null;
    }

    public List<FileRecord> findAll() throws SQLException {
        String sql = """
                SELECT id, filename, bucket, object_key, mime_type, size_bytes, created_at
                FROM files
                ORDER BY id
                """;

        List<FileRecord> results = new ArrayList<>();

        try (Connection connection = getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet rs = statement.executeQuery()) {

            while (rs.next()) {
                results.add(mapRow(rs));
            }
        }

        return results;
    }

    public boolean deleteById(int id) throws SQLException {
        String sql = "DELETE FROM files WHERE id = ?";

        try (Connection connection = getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setInt(1, id);
            int affectedRows = statement.executeUpdate();
            return affectedRows > 0;
        }
    }

    private FileRecord mapRow(ResultSet rs) throws SQLException {
        FileRecord fileRecord = new FileRecord();
        fileRecord.setId(rs.getInt("id"));
        fileRecord.setFilename(rs.getString("filename"));
        fileRecord.setBucket(rs.getString("bucket"));
        fileRecord.setObjectKey(rs.getString("object_key"));
        fileRecord.setMimeType(rs.getString("mime_type"));
        fileRecord.setSizeBytes(rs.getLong("size_bytes"));
        fileRecord.setCreatedAt(rs.getTimestamp("created_at"));
        return fileRecord;
    }
}