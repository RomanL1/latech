package com.latech.api.model.db;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table( name = "render_history" )
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RenderHistory {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn( name = "document_id", nullable = false )
    private Document document;

    @Column( name = "render_id", nullable = false )
    private UUID renderId;

    @Column( name = "status", nullable = false )
    private String status;

    @Column( name = "log_message", columnDefinition = "TEXT" )
    private String logMessage;

    @Column( name = "rendered_at", nullable = false )
    private Instant renderedAt;
}
