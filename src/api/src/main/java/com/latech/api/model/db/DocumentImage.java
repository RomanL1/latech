package com.latech.api.model.db;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "documentimage")
@Getter
@Setter
public class DocumentImage {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID imageId;

    @Column(nullable = false)
    private UUID documentId;

    @Column(nullable = false)
    private String userSuppliedName;

    private Instant createdAt;
}