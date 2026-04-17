package com.latech.api.model.db;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table( name = "document" )
public class Document {

    @Id
    @GeneratedValue( strategy = GenerationType.UUID )
    private UUID id;

    @Column( nullable = false )
    private String name;

    @Column( columnDefinition = "TEXT" )
    private String content;

    @Column( name = "password" )
    private String password;

    private Instant lastChange;

    private Instant lastCompile;

    private String pdfPath;

    private Instant compileAbandonedAt;
}
