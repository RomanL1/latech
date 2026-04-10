package com.latech.renderer.api;

import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.FileSystemUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
public class PdfDeliveryController {

    @GetMapping("/renderer/pdf")
    public ResponseEntity<Resource> downloadPdf(@RequestParam("filePath") String filePath) {
        try {
            Path path = Paths.get(filePath);

            // Ensure the file path is within the allowed output directory to prevent path
            // traversal
            Path normalizedPath = path.normalize().toAbsolutePath();
            Path baseOutputDir = Paths.get("output").normalize().toAbsolutePath();

            if (!normalizedPath.startsWith(baseOutputDir)) {
                return ResponseEntity.status(403).build();
            }

            if (!Files.exists(normalizedPath)) {
                return ResponseEntity.notFound().build();
            }

            InputStream inputStream = Files.newInputStream(normalizedPath);

            InputStream deletingStream = new FilterInputStream(inputStream) {
                @Override
                public void close() throws IOException {
                    try {
                        super.close();
                    } finally {
                        Path parentDir = normalizedPath.getParent();
                        FileSystemUtils.deleteRecursively(parentDir);
                    }
                }
            };

            Resource resource = new InputStreamResource(deletingStream);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .contentLength(Files.size(normalizedPath)) // <-- required!
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + normalizedPath.getFileName() + "\"")
                    .body(resource);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
