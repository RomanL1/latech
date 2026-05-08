package com.latech.api.config;

import com.latech.api.business.TemplateSeedService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "latech.templates.seed.enabled", havingValue = "true")
public class TemplateSeedCommand implements ApplicationRunner {
    private final TemplateSeedService templateSeedService;
    private final ConfigurableApplicationContext applicationContext;

    @Override
    public void run ( ApplicationArguments args ) throws Exception {
        int processedTemplates = templateSeedService.seedFromClasspathManifest();
        log.info( "Template seed completed. Processed {} template(s).", processedTemplates );
    }
}
