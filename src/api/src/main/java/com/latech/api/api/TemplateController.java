package com.latech.api.api;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.util.ObjectUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.latech.api.model.api.TemplateContentDto;
import com.latech.api.model.api.TemplateDto;
import com.latech.api.model.db.Template;
import com.latech.api.repository.TemplateRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping( "api/template" )
public class TemplateController
{
	private final TemplateRepository templateRepository;

	@GetMapping
	public ResponseEntity<List<TemplateDto>> listAllTemplates ()
	{
		List<Template> all = templateRepository.findAll();

		List<TemplateDto> templateDtos = new ArrayList<>();
		for ( Template template : all )
		{
			TemplateDto templateDto = getTemplateDto( template );
			templateDtos.add( templateDto );
		}

		return ResponseEntity.ok( templateDtos );
	}

	@PostMapping
	public ResponseEntity<TemplateDto> saveTemplate ( @RequestBody TemplateContentDto templateDto,
			UriComponentsBuilder uriBuilder )
	{
		if ( ObjectUtils.isEmpty( templateDto ) || ObjectUtils.isEmpty( templateDto.getName() ) || ObjectUtils.isEmpty(
				templateDto.getContent() ) )
		{
			return ResponseEntity.badRequest().build();
		}

		Template template = Template.builder()
				.name( templateDto.getName() )
				.description( templateDto.getDescription() )
				.content( templateDto.getContent() )
				.build();

		Template saved = templateRepository.save( template );

		TemplateDto response = getTemplateDto( saved );

		URI location = uriBuilder.path( "/api/template/{id}" ).buildAndExpand( saved.getId() ).toUri();
		return ResponseEntity.created( location ).body( response );
	}

	@GetMapping( "/{templateId}" )
	public ResponseEntity<TemplateContentDto> getTemplateContent ( @PathVariable String templateId )
	{
		if ( ObjectUtils.isEmpty( templateId ) )
		{
			return ResponseEntity.badRequest().build();
		}

		if ( templateRepository.existsById( UUID.fromString( templateId ) ) )
		{
			return ResponseEntity.notFound().build();
		}

		Template template = templateRepository.findById( UUID.fromString( templateId ) ).orElseThrow();

		TemplateContentDto contentDto = TemplateContentDto.builder()
				.id( template.getId().toString() )
				.name( template.getName() )
				.description( template.getDescription() )
				.content( template.getContent() )
				.build();

		return ResponseEntity.ok( contentDto );
	}

	private static TemplateDto getTemplateDto ( Template template )
	{
		return TemplateDto.builder()
				.id( template.getId().toString() )
				.name( template.getName() )
				.description( template.getDescription() )
				.build();
	}

}
