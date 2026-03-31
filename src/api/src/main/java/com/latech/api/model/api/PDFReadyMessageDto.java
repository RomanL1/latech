package com.latech.api.model.api;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PDFReadyMessageDto
{
	private String docId;
	private String downloadPath;
	private long timestampUTC;
}
