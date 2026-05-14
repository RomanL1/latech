package com.latech.renderer.business;

import com.latech.renderer.model.DockerEvent;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Slf4j
@Service
public class DockerEventsListener {

    private final CompileJobOrchestrator compileJobOrchestrator;
    private final ExecutorService virtualExecutor;
    private final ObjectMapper objectMapper;

    public DockerEventsListener(CompileJobOrchestrator compileJobOrchestrator, ObjectMapper objectMapper){
        this.compileJobOrchestrator = compileJobOrchestrator;
        this.objectMapper = objectMapper;
        this.virtualExecutor = Executors.newVirtualThreadPerTaskExecutor();
    }

    @PostConstruct
    public void start(){
        startListening();
    }

    public void startListening(){
        this.virtualExecutor.submit(() -> {
            try {
                Process events = new ProcessBuilder(
                        "docker", "events",
                        "--filter", "event=die",
                        "--filter", "event=start",
                        "--format", "{{json .}}"
                ).start();

                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(events.getInputStream()))) {
                    String line;
                    while ( (line = reader.readLine()) != null ) {
                        DockerEvent event = parse( line );
                        if ( event == null ){
                            continue;
                        }
                        compileJobOrchestrator.onContainerExit(event.renderId(), event.exitCode());
                    }
                }
                log.warn("docker events process died, restarting...");
                Thread.sleep(500);
                startListening();

            } catch (Exception ex) {
                log.error("docker events listener failed", ex);
                try {
                    Thread.sleep(500);
                } catch ( InterruptedException e ) {
                    throw new RuntimeException( e );
                }
            }finally{
                startListening();
            }
        });
    }

    private DockerEvent parse( String line ) {
        JsonNode node = objectMapper.readTree( line );
        String name = node.at( "/Actor/Attributes/name" ).asString();
        String event = node.at( "/Action" ).asString();
        if (!name.contains( "tex-compiler-container-" )){
            return null;
        }
        if (event.equals( "start" )){
            log.info("Container {} has finished spinning up.", name);
            return null;
        }
        int exitCode = Integer.parseInt( node.at( "/Actor/Attributes/exitCode" ).asString() );
        String renderId = name.replace( "tex-compiler-container-", "" );
        return new DockerEvent( renderId, exitCode );
    }
}
