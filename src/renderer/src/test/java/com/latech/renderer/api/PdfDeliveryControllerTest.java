package com.latech.renderer.api;


import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.util.FileSystemUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PdfDeliveryController.class)
class PdfDeliveryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private Path tempDir;
    private Path tempFile;

    @BeforeEach
    void setUp() throws IOException {
        Path outputDir = Paths.get("output").toAbsolutePath();
        if (!Files.exists(outputDir)) {
            Files.createDirectories(outputDir);
        }
        tempDir = Files.createTempDirectory(outputDir, "test-");
        tempFile = Files.createTempFile(tempDir, "test-", ".pdf");
        Files.write(tempFile, "PDF content".getBytes());
    }

    @AfterEach
    void tearDown() throws IOException {
        FileSystemUtils.deleteRecursively(tempDir);
    }

    @Test
    void downloadsFileAndDeletesItAfterDelivery() throws Exception {
        mockMvc.perform(get("/renderer/pdf").param("filePath", tempFile.toString()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                        containsString("attachment")));

        assertThat(Files.exists(tempDir)).isFalse();
    }

    @Test
    void returns404WhenFileDoesNotExist() throws Exception {
        mockMvc.perform(get("/renderer/pdf").param("filePath", "output/nonexistent/file.pdf"))
                .andExpect(status().isNotFound());
    }

    @Test
    void returns403WhenPathIsOutsideOutputDirectory() throws Exception {
        mockMvc.perform(get("/renderer/pdf").param("filePath", "/etc/passwd"))
                .andExpect(status().isForbidden());
    }
}