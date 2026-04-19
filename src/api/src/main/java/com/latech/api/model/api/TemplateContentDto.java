package com.latech.api.model.api;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode( callSuper = true )
public class TemplateContentDto extends TemplateDto {
    private String content;
}
