package com.latech.api.model.api;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentImageDto {
    private UUID id;
    private String name;
    private String url;
    private String mimeType;
}