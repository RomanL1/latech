package com.latech.api.model.db;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table( name = "template" )
public class Template {

    @Id
    @GeneratedValue( strategy = GenerationType.UUID )
    private UUID id;

    @Column( nullable = false )
    private String name;

    private String description;

    @Column( columnDefinition = "TEXT" )
    private String content;
}
