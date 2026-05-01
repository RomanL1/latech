package com.latech.renderer.business;

import com.latech.renderer.api.DocumentRecord;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.FileSystemUtils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;

@Component
@Slf4j
public class FileWorker {

    private static final Path WORK_DIR = Path.of("/workdir");

    public FileWorker(){}

    public Path setupFiles(DocumentRecord documentRecord) throws IOException {
        //TODO(marc): figure out if we reject absurdly large .tex files here, or already in the API
        Path texFile = WORK_DIR.resolve(documentRecord.getDocumentId() + ".tex");
        Files.writeString(texFile, documentRecord.getLatexContent());


        //TODO(marc): getting the images will be handled here once we get MinIO running.
        return texFile;
    }

    public static void cleanup() throws IOException {
        try (var paths = Files.walk(WORK_DIR)) {
            paths.sorted( Comparator.reverseOrder())
                    .map(Path::toFile)
                    .filter(f -> !f.toPath().equals(WORK_DIR))
                    .forEach( File::delete);
        }
    }

    public Path getWorkDir(){
        return WORK_DIR;
    }
}
