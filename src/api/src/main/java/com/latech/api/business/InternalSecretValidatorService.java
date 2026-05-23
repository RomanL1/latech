package com.latech.api.business;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;

import static java.nio.charset.StandardCharsets.UTF_8;

@Service
@RequiredArgsConstructor
public class InternalSecretValidatorService {

    @Value( "${latech.internal.auth-secret:}" )
    private String internalAuthSecret;

    public boolean isValidInternalSecret ( String providedSecret ) {
        return providedSecret != null && internalAuthSecret != null && MessageDigest.isEqual(
                providedSecret.getBytes( UTF_8 ), internalAuthSecret.getBytes( UTF_8 ) );
    }
}
