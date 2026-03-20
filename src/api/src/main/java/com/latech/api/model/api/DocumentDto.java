package com.latech.api.model.api;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DocumentDto
{
	private String id;
	private String name;
	private Boolean secured;
	private String content;
}
