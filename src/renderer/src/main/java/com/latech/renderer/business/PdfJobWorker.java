package com.latech.renderer.business;

import com.latech.renderer.api.DocumentRecord;
import com.latech.renderer.model.RunningContainer;
import com.latech.renderer.process.ProcessExecutor;
import com.latech.renderer.process.ProcessResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;

@Component
@Slf4j
public class PdfJobWorker {

    private final ContainerManager containerManager;
    private final FileWorker fileWorker;
    private final ProcessExecutor processExecutor;

    //TODO(marc): figure out reasonable size limits.
    @Value("${PdfJobWorker.maxOutputSizeBytes}")
    private long maxOutputSizeBytes;

    public PdfJobWorker(ContainerManager containerManager, FileWorker fileWorker, ProcessExecutor processExecutor){
        this.containerManager = containerManager;
        this.fileWorker = fileWorker;
        this.processExecutor = processExecutor;
    }

    public Path createPdf(DocumentRecord documentRecord) throws IOException, InterruptedException {

        RunningContainer runningContainer = this.containerManager.getContainer();

        assert runningContainer != null;
        Path workDir = runningContainer.folder();
        this.fileWorker.setupFiles(documentRecord, workDir);

        long jobStart = System.currentTimeMillis();
        ProcessResult processResult = processExecutor.execute(Duration.ofSeconds(10),
                "docker", "exec",
                runningContainer.id(),
                "pdflatex",
                "-interaction=nonstopmode",
                "-no-shell-escape",
                "-halt-on-error",
                documentRecord.getDocumentId() + ".tex"
        );

        long jobDuration = System.currentTimeMillis() - jobStart;
        log.info("Compiling {} took {}ms", documentRecord.getDocumentId() + ".pdf", jobDuration);

        if (!processResult.isSuccess()){
            throw new RuntimeException("pdflatex failed (exitCode: " + processResult.exitCode() + "):\n" + processResult.output() + "\n" + processResult.error());
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
