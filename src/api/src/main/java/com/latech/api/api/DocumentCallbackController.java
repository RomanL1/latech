package com.latech.api.api;

import org.springframework.http.ResponseEntity;
import org.springframework.util.ObjectUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.latech.api.model.api.DocumentCallbackDto;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping( "api/document/callback" )
public class DocumentCallbackController
{
	@PostMapping( "/{docId}" )
	public ResponseEntity<Void> saveDocumentState ( @PathVariable String docId,
			@RequestBody DocumentCallbackDto documentCallbackDto )
	{
		if ( ObjectUtils.isEmpty( docId ) )
		{
			return ResponseEntity.badRequest().build();
		}
		var bodyEmpty =
				ObjectUtils.isEmpty( documentCallbackDto ) && ObjectUtils.isEmpty( documentCallbackDto.getUnknown() );
		log.info( "DocumentCallbackController.getDocumentContent id: {}", docId );
		log.info( "Is body empty: {}", bodyEmpty );
		return ResponseEntity.ok().build();
	}
}
