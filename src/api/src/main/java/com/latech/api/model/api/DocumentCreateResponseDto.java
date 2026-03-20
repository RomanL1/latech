package com.latech.api.model.api;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DocumentCreateResponseDto
{
	private String uuid;
	private String name;
}
