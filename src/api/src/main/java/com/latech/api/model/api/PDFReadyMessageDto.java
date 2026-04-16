package com.latech.api.model.api;

import lombok.Builder;

@Builder
public record PDFReadyMessageDto(String docId,
								 boolean success,
								 String errorMessage,
								 String downloadPath,
								 long timestampUTC){}
