package com.latech.api.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DocumentDto
{
	private String id;
	private String name;
	private String content;
}
