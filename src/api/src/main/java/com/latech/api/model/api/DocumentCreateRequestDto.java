package com.latech.api.model.api;

import java.util.UUID;

public record DocumentCreateRequestDto(
		String name,
		String password,
		UUID templateId
) {}
