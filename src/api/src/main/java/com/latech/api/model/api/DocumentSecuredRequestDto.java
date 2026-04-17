package com.latech.api.model.api;

import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DocumentSecuredRequestDto {
    private String password;
}
