package com.latech.api;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.time.ZoneId;
import java.util.Map;
import java.util.TimeZone;

@Slf4j
@SpringBootApplication
public class LatechApiApplication implements ApplicationListener<ContextRefreshedEvent> {

    public static void main ( String[] args ) {
        TimeZone.setDefault( TimeZone.getTimeZone( ZoneId.of( "Europe/Paris" ) ) );
        SpringApplication.run( LatechApiApplication.class, args );
    }

    @Override
    public void onApplicationEvent ( ContextRefreshedEvent event ) {
        ApplicationContext applicationContext = event.getApplicationContext();
        RequestMappingHandlerMapping requestMappingHandlerMapping = applicationContext
                .getBean( "requestMappingHandlerMapping", RequestMappingHandlerMapping.class );
        Map<RequestMappingInfo, HandlerMethod> map = requestMappingHandlerMapping
                .getHandlerMethods();
        map.forEach( ( key, value ) -> log.info( "{} {}", key, value ) );
    }

}
