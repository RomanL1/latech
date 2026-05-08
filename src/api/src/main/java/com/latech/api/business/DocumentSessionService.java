package com.latech.api.business;

import com.latech.api.model.db.Document;
import com.latech.api.model.db.DocumentSession;
import com.latech.api.repository.DocumentSessionRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentSessionService {

    private final DocumentSessionRepository documentSessionRepository;
    private final SecureTokenService secureTokenService;

    @Value("${latech.document-session.cookie-name:doc_session}")
    private String cookieName;

    @Value("${latech.document-session.ttl-seconds:86400}")
    private long ttlSeconds;

    @Value("${latech.document-session.cookie-secure:true}")
    private boolean cookieSecure;

    @Value("${latech.document-session.cookie-same-site:Lax}")
    private String cookieSameSite;

    @Value("${latech.document-session.cookie-domain:}")
    private String cookieDomain;

    public DocumentSession createSession(Document document, HttpServletResponse response) {
        String rawToken = secureTokenService.generateToken();
        String tokenHash = secureTokenService.hashToken(rawToken);

        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(ttlSeconds);

        DocumentSession session = DocumentSession.builder()
                .document(document)
                .tokenHash(tokenHash)
                .createdAt(now)
                .expiresAt(expiresAt)
                .build();

        DocumentSession savedSession = documentSessionRepository.save(session);

        ResponseCookie cookie = baseCookie(rawToken)
                .maxAge(Duration.ofSeconds(ttlSeconds))
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return savedSession;
    }

    public boolean hasValidSession(UUID documentId, HttpServletRequest request) {
        Optional<String> rawToken = readTokenFromCookie(request);

        if (rawToken.isEmpty()) {
            return false;
        }

        String tokenHash = secureTokenService.hashToken(rawToken.get());

        Optional<DocumentSession> session =
                documentSessionRepository.findByTokenHashAndDocument_Id(tokenHash, documentId);

        if (session.isEmpty()) {
            return false;
        }

        if (session.get().getExpiresAt().isBefore(Instant.now()) ||
                session.get().getExpiresAt().equals(Instant.now())) {
            documentSessionRepository.delete(session.get());
            return false;
        }

        return true;
    }

    public void logout(UUID documentId, HttpServletRequest request, HttpServletResponse response) {
        Optional<String> rawToken = readTokenFromCookie(request);

        rawToken.ifPresent(token -> {
            String tokenHash = secureTokenService.hashToken(token);
            documentSessionRepository.deleteByTokenHashAndDocument_Id(tokenHash, documentId);
        });

        ResponseCookie expiredCookie = baseCookie("")
                .maxAge(Duration.ZERO)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, expiredCookie.toString());
    }

    public long deleteExpiredSessions() {
        return documentSessionRepository.deleteByExpiresAtBefore(Instant.now());
    }

    private Optional<String> readTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();

        if (cookies == null) {
            return Optional.empty();
        }

        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName()) && StringUtils.hasText(cookie.getValue())) {
                return Optional.of(cookie.getValue());
            }
        }

        return Optional.empty();
    }

    private ResponseCookie.ResponseCookieBuilder baseCookie(String value) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(cookieName, value)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/");

        if (StringUtils.hasText(cookieDomain)) {
            builder.domain(cookieDomain);
        }

        return builder;
    }
}
