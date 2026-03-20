package com.latech.api.model.api;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DocumentSecuredCreateRequestDto
{
	private String name;
	private String password;
}
