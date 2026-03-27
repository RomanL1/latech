package com.latech.renderer.business;

import com.latech.renderer.api.DocumentRecord;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.FileSystemUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Component
@Slf4j
public class FileWorker {

    public FileWorker(){}

    public void setupFiles(DocumentRecord documentRecord, Path workDir) throws IOException {
        //TODO(marc): figure out if we reject absurdly large .tex files here, or already in the API
        Path texFile = workDir.resolve(documentRecord.getDocumentId() + ".tex");
        Files.writeString(texFile, documentRecord.getLatexContent());

        //TODO(marc): getting the images will be handled here once we get MinIO running.
    }

    public void cleanupFolders(String documentId) throws IOException {
        Path dirToDelete = Path.of("output", documentId);

        FileSystemUtils.deleteRecursively(dirToDelete);
    }
}
