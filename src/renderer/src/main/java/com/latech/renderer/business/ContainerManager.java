package com.latech.renderer.business;


import com.latech.renderer.model.RunningContainer;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

@Service
@Slf4j
public class ContainerManager {

    private final BlockingQueue<RunningContainer> containerBuffer;
    private final BlockingQueue<RunningContainer> removalQueue;
    private Thread removalQueueWorker;
    private final static int NUM_CONTAINERS_BUFFERED = 2;

    public ContainerManager(){
        this.removalQueue = new ArrayBlockingQueue<>(NUM_CONTAINERS_BUFFERED);
        this.containerBuffer = new ArrayBlockingQueue<>(NUM_CONTAINERS_BUFFERED);
        for (int i = 0; i < NUM_CONTAINERS_BUFFERED; i++) {
            try {
                this.containerBuffer.put(spinupNewContainer());
            } catch (InterruptedException | IOException e) {
                log.error("Exception while trying to pre-fill Queue: " + e);
            }
        }
    }

    public RunningContainer getContainer() throws InterruptedException, IOException {
        RunningContainer container =  this.containerBuffer.take();
        //TODO(marc): figure out if we need to test if the container is alive as well
        if (!container.process().isAlive()){
            FileSystemUtils.deleteRecursively(container.folder());
            container = spinupNewContainer();
        }
        return container;
    }

    public void returnContainer(RunningContainer container) throws InterruptedException {
        this.removalQueue.put(container);
    }

    private RunningContainer spinupNewContainer() throws IOException {
        long start = System.currentTimeMillis();
        String containerId = "tex-worker-" + UUID.randomUUID();
        Path workDir = Path.of("output", containerId);
        Files.createDirectories(workDir);

        Process containerProcess =  new ProcessBuilder(
                "docker", "run",
                "--rm",
                "--network", "none",
                "--memory", "512m",
                "--cpus", "1.0",
                "--pids-limit", "50",
                "--security-opt", "no-new-privileges",
                "--cap-drop", "ALL",       //drop linux capabilities
                "--read-only",             //make everything readonly
                "--tmpfs", "/tmp",         //writable in-memory tmpfs, needed by pdflatex
                //TODO(marc): remove this replace once the whole renderer runs in its own linux container.
                "-v", workDir.toAbsolutePath().toString().replace("\\", "/") + ":/workdir",
                "-w", "/workdir",
                "--name", containerId,
                "tex-renderer-image",
                "sleep", "infinity"       //keep it alive waiting on further instructions
        )
                .start();

        //TODO(marc): remove this polling loop once we know how long it takes to spin up containers.
        while (true) {
            try {
                Process probe = new ProcessBuilder("docker", "exec", containerId, "echo", "ok")
                        .start();
                int exitCode = probe.waitFor();

                if (exitCode == 0) break;
                Thread.sleep(5);
            } catch (Exception e) {
               log.error("Exception while trying to poll for container startup time: " + e);
            }
        }

        long timeTaken = System.currentTimeMillis() - start;
        log.info("Spun up a new Container in " + timeTaken + "ms.");

        return new RunningContainer(containerId, containerProcess, workDir);
    }

    @PostConstruct
    void start() {
        this.removalQueueWorker = Thread.ofVirtual().start(this::loop);
    }

    private void loop(){
        while (!Thread.currentThread().isInterrupted()){
            try{
                //TODO(marc): Ensure we don't risk losing any processes here.
                RunningContainer runningContainer = this.removalQueue.take();
                new ProcessBuilder("docker", "stop", runningContainer.id()).start();
                this.containerBuffer.put(spinupNewContainer());
            } catch (InterruptedException | IOException e) {
                throw new RuntimeException(e);
            }
        }
    }

    @PreDestroy
    void stop(){
        this.removalQueueWorker.interrupt();
    }
}
