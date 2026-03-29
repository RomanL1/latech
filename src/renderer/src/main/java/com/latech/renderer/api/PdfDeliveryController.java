package com.latech.renderer.api;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
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

            Resource resource = new UrlResource(normalizedPath.toUri());

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
