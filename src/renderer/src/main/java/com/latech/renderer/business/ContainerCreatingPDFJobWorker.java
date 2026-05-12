package com.latech.renderer.business;


import com.latech.renderer.api.DocumentRecord;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.temporal.ChronoUnit;

@Slf4j
@Component
public class ContainerCreatingPDFJobWorker {

    private final FileWorker fileWorker;

    @Value( "${ContainerCreatingPDFJobWorker.hostSideWorkDirPath}" )
    private String hostSideWorkDirPath;

    public ContainerCreatingPDFJobWorker(FileWorker fileWorker){
        this.fileWorker = fileWorker;
    }

    public CompileResult compile( DocumentRecord documentRecord) throws IOException, InterruptedException {
        Path texFile = this.fileWorker.setupFiles( documentRecord );
        Path hostSideCompileDir = Path.of( this.hostSideWorkDirPath + "/" + documentRecord.getRenderId() + "/");

        long startTime = System.currentTimeMillis();
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
                "-v", hostSideCompileDir + ":/workdir",  // mount job directory
                "-w", "/workdir",                // set working directory inside container
                "tex-renderer-image",
                "sh", "-c",
                "pdflatex -interaction=nonstopmode -no-shell-escape -halt-on-error " + texFile.getFileName().toString() +
                " && pdflatex -interaction=nonstopmode -no-shell-escape -halt-on-error " + texFile.getFileName().toString()
        )
                .redirectErrorStream(true)  // merge stderr into stdout
                .start();

        // Drain stdout — if you don't, the process can deadlock on a full pipe buffer
        String output = new String(process.getInputStream().readAllBytes());

        //TODO(marc): tune the wait time.
        boolean completed = process.waitFor( Duration.of( 10, ChronoUnit.SECONDS));
        long containerDuration = System.currentTimeMillis() - startTime;
        Path pdfPath = texFile.getParent().resolve( documentRecord.getDocumentId() + ".pdf");
        log.info( "Spinning up Container and Compiling {} took {}ms", pdfPath, containerDuration);

        if (!completed) {
            return new CompileResult( false, null, "pdflatex timed out :\n" + output );
        }

        if ( !Files.exists( pdfPath ) ) {
            return new CompileResult( false, null, "pdf file could not be created.\n" + output );
        }


        return new CompileResult( true, pdfPath, output );
    }
}
