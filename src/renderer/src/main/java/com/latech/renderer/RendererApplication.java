package com.latech.renderer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RendererApplication {

    public static void main ( String[] args ) {
        SpringApplication.run( RendererApplication.class, args );
    }

}
