package com.latech.api.model.api;

import lombok.Builder;

@Builder
public record PDFReadyMessageDto(String docId, boolean success, String logMessage, String downloadPath,
                                 long timestampUTC) {
}
