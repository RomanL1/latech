package com.latech.api.business;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentSessionCleanupService {

    private final DocumentSessionService documentSessionService;

    @Scheduled(fixedDelayString = "${latech.document-session.cleanup-ms:3600000}")
    public void cleanupExpiredSessions() {
        long deletedSessions = documentSessionService.deleteExpiredSessions();

        if (deletedSessions > 0) {
            log.info("Deleted {} expired document sessions", deletedSessions);
        }
    }
}
