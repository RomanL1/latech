package com.latech.renderer.business;

import com.latech.renderer.api.DocumentRecord;
import com.latech.renderer.model.RunningContainer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.temporal.ChronoUnit;

@Component
@Slf4j
public class PdfJobWorker {

    private ContainerManager containerManager;
    private FileWorker fileWorker;

    //TODO(marc): figure out reasonable size limits.
    @Value("${PdfJobWorker.maxOutputSizeBytes}")
    private long maxOutputSizeBytes;

    public PdfJobWorker(ContainerManager containerManager, FileWorker fileWorker){
        this.containerManager = containerManager;
        this.fileWorker = fileWorker;
    }

    public Path createPdf(DocumentRecord documentRecord) throws IOException, InterruptedException {

        RunningContainer runningContainer = this.containerManager.getContainer();

        assert runningContainer != null;
        Path workDir = runningContainer.folder();
        this.fileWorker.setupFiles(documentRecord, workDir);

        long jobStart = System.currentTimeMillis();
        Process pdfLatexProcess = new ProcessBuilder(
                "docker", "exec",
                runningContainer.id(),
                "pdflatex",
                "-interaction=nonstopmode",
                "-no-shell-escape",
                "-halt-on-error",
                documentRecord.getDocumentId() + ".tex"
        )
                .redirectErrorStream(true)
                .start();

        // Drain stdout — if you don't, the process can deadlock on a full pipe buffer
        //TODO: figure out if we need to guard against absurdly big streams here?
        String output = new String(pdfLatexProcess.getInputStream().readAllBytes());
        //TODO(marc): tune wait time.
        boolean exitCode = pdfLatexProcess.waitFor(Duration.of(10, ChronoUnit.SECONDS));
        long jobDuration = System.currentTimeMillis() - jobStart;
        log.info("Compiling {} took {}ms", documentRecord.getDocumentId() + ".pdf", jobDuration);

        if (!exitCode){
            throw new RuntimeException("pdflatex failed (exitCode: false):\n" + output);
        }

        Path pdfPath = workDir.resolve(documentRecord.getDocumentId() + ".pdf");

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

        this.containerManager.returnContainer(runningContainer);
        return pdfPath;
    }
}
