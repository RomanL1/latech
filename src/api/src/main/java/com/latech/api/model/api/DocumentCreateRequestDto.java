package com.latech.api.model.api;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DocumentCreateRequestDto
{
	private String name;
	@Schema( types = { "string", "null" } )
	private String password;
}
