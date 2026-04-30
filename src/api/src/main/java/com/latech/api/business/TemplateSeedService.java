package com.latech.api.business;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.latech.api.model.db.Template;
import com.latech.api.repository.TemplateRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TemplateSeedService {
    private static final String DEFAULT_MANIFEST = "classpath:seed-templates/manifest.json";
    private static final ObjectMapper OBJECT_MAPPER = JsonMapper.builder().build();

    private final ResourceLoader resourceLoader;
    private final TemplateRepository templateRepository;

    @Transactional
    public int seedFromClasspathManifest () throws IOException {
        return seedFromManifest( DEFAULT_MANIFEST );
    }

    @Transactional
    public int seedFromManifest ( String manifestLocation ) throws IOException {
        Resource manifestResource = resourceLoader.getResource( manifestLocation );
        List<TemplateSeedDefinition> definitions;

        // The manifest is the lightweight index: metadata lives here, template bodies stay in .tex files.
        try (InputStream inputStream = manifestResource.getInputStream()) {
            definitions = OBJECT_MAPPER.readValue( inputStream, new TypeReference<>() {
            } );
        }

        int processed = 0;
        for (TemplateSeedDefinition definition : definitions) {
            upsertTemplate( definition );
            processed++;
        }

        return processed;
    }

    private void upsertTemplate ( TemplateSeedDefinition definition ) throws IOException {
        String content = readTemplateContent( definition.file() );
        Optional<Template> existingTemplate = templateRepository.findByName( definition.name() );

        // Reuse the existing row when present so reseeding updates content instead of duplicating templates.
        Template template = existingTemplate.orElseGet( Template::new );
        template.setName( definition.name() );
        template.setDescription( definition.description() );
        template.setContent( content );

        templateRepository.save( template );
        log.info( "Seeded template '{}'", definition.name() );
    }

    private String readTemplateContent ( String fileName ) throws IOException {
        Resource templateResource = resourceLoader.getResource( "classpath:seed-templates/" + fileName );
        // Template source stays as plain .tex in resources so it can be edited independently from SQL/JSON.
        return templateResource.getContentAsString( StandardCharsets.UTF_8 );
    }

    private record TemplateSeedDefinition(String name, String description, String file) {
    }
}
