package com.latech.api.model.api;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentCreateRequestDto
{
	private String name;
	@Schema( types = { "string", "null" } )
	private String password;
}
