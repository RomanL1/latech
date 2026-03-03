package com.latech.renderer.application;

import com.latech.renderer.model.PdfJob;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.temporal.ChronoUnit;

@Slf4j
@Service
public class RenderingPoC {

    //TODO(marc): figure out reasonable size limits.
    @Value("${renderingPoC.maxOutputSizeBytes}")
    private long maxOutputSizeBytes;

    public RenderingPoC(){}

    public Path compile(PdfJob job) throws IOException, InterruptedException {

        Path jobDir = Path.of("output", job.jobId());

        Files.createDirectories(jobDir);
        //TODO(marc): figure out if we reject absurdly large .tex files here, or already in the API
        Path texFile = jobDir.resolve(job.jobId() + ".tex");
        Files.writeString(texFile, job.content());

        long containerStart = System.currentTimeMillis();
        Process process =  new ProcessBuilder(
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
                "-v", jobDir.toAbsolutePath().toString().replace("\\", "/") + ":/workdir",  // mount job directory
                "-w", "/workdir",                // set working directory inside container
                "tex-renderer-image",
                "pdflatex",
                "-interaction=nonstopmode",
                "-no-shell-escape",         //never run with shell-escape enabled
                "-halt-on-error",
                job.jobId() + ".tex"                      // relative to /workdir inside container
        )
                .directory(jobDir.toFile())
                .redirectErrorStream(true)  // merge stderr into stdout
                .start();

        // Drain stdout — if you don't, the process can deadlock on a full pipe buffer
        String output = new String(process.getInputStream().readAllBytes());

        //TODO(marc): tune the wait time.
        boolean exitCode = process.waitFor(Duration.of(10, ChronoUnit.SECONDS));
        long containerDuration = System.currentTimeMillis() - containerStart;
        log.info("Spinning up Container and Compiling {} took {}ms", job.jobId() + ".pdf", containerDuration);


        if (!exitCode) {
            throw new RuntimeException("pdflatex failed (exitCode: false):\n" + output);
        }

        Path pdfPath = jobDir.resolve(job.jobId() + ".pdf");

        try {
            long size = Files.size(pdfPath);
            if (size > maxOutputSizeBytes) {
                //TODO(marc): figure out if we delete files/directory here.
                throw new RuntimeException("Output too large");
            }
        } catch (IOException e) {
            log.error("could not read " + pdfPath + "; " + e);
            throw new RuntimeException("IOException while trying to read pdf file: " + pdfPath + "; " + e);
        }

        return pdfPath;
    }
}
