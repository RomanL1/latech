package com.latech.renderer.business;

import com.latech.renderer.model.CompileJob;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Slf4j
@Component
public class ContainerService {

    @Value( "${ContainerCreatingPDFJobWorker.hostSideWorkDirPath}" )
    private String hostSideWorkDirPath;

    @Value( "timeout -k 2 10")
    private String containerTimeoutValue;

    public ContainerService(){}

    public void startContainer( CompileJob compileJob ) throws IOException {
        Path hostSideCompileDir = Path.of( this.hostSideWorkDirPath + "/" + compileJob.getRenderId() + "/");
        String containerName = "tex-compiler-container-" + compileJob.getRenderId();

        new ProcessBuilder(
                "docker", "run",
                "--name", containerName,
                "--rm",
                "--network", "none",
                "--memory", "512m",
                "--cpus", "1.0",
                "--pids-limit", "50",
                "--security-opt", "no-new-privileges",
                "--cap-drop", "ALL",       //drop linux capabilities
                "--read-only",             //make everything readonly
                "--tmpfs", "/tmp",         //writable in-memory tmpfs, needed by pdflatex
                "-v", hostSideCompileDir + ":/workdir",  // mount job directory
                "-w", "/workdir",                // set working directory inside container
                "tex-renderer-image",
                "sh", "-c",
                containerTimeoutValue + " pdflatex -interaction=nonstopmode -no-shell-escape -halt-on-error " + compileJob.getTexFilePath().getFileName() +
                        " && " + containerTimeoutValue + " pdflatex -interaction=nonstopmode -no-shell-escape -halt-on-error " + compileJob.getTexFilePath().getFileName()
        )
                .redirectErrorStream(true)
                .redirectOutput(compileJob.getCompileLogPath().toFile())
                .start();

        compileJob.setContainerStartTime( System.currentTimeMillis() );
        compileJob.setContainerName( containerName );
    }

    public void stopContainer(String containerName) {
        try {
            // "docker stop" sends SIGTERM, then SIGKILL after a grace period
            new ProcessBuilder("docker", "stop", "-t", "2", containerName).start();
        } catch (IOException e) {
            log.error("Failed to stop container {}", containerName, e);
        }
    }
}
