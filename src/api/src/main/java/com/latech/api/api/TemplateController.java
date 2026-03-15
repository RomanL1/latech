package com.latech.api.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.latech.api.model.TemplateContentDto;
import com.latech.api.model.TemplateDto;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping( "api/template" )
public class TemplateController
{
	@GetMapping
	public ResponseEntity<List<TemplateDto>> listAllTemplates ()
	{
		// Todo Logic to get all Templates
		return ResponseEntity.ok( List.of() );
	}

	@GetMapping( "/{templateId}" )
	public ResponseEntity<TemplateContentDto> listAllTemplates ( @PathVariable String templateId )
	{
		// Todo Logic to get template content by id
		return ResponseEntity.ok( null );
	}

}
