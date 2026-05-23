package com.latech.api.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.List;

@Configuration
public class CacheConfig {

    public static final String DOCUMENT_PASSWORD_STATUS = "documentPasswordStatus";
    public static final String DOCUMENT_SESSION_STATUS = "documentSessionStatus";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCache documentPasswordCache = new CaffeineCache(
                DOCUMENT_PASSWORD_STATUS,
                Caffeine.newBuilder()
                        .maximumSize(10_000)
                        .build()
        );

        CaffeineCache documentSessionCache = new CaffeineCache(
                DOCUMENT_SESSION_STATUS,
                Caffeine.newBuilder()
                        .maximumSize(50_000)
                        .expireAfterWrite(Duration.ofMinutes(5))
                        .build()
        );

        SimpleCacheManager manager = new SimpleCacheManager();
        manager.setCaches(List.of(documentPasswordCache, documentSessionCache));
        return manager;
    }
}
