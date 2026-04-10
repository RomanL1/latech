package com.latech.renderer.business;

import com.latech.renderer.api.DocumentRecord;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.util.FileSystemUtils;

import java.io.IOException;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class NaivePDFJobWorkerTest {

    @Test
    @Disabled
    void compile_producesPdfFile_whenGivenValidLatex() throws IOException, InterruptedException {
        DocumentRecord documentRecord = DocumentRecord.newBuilder()
                .setRenderId("render-123")
                .setDocumentId("doc-abc")
                .setLatexContent("""
                        \\documentclass{article}
                        \\begin{document}
                        Hello, World!
                        \\end{document}
                        """)
                .build();

        Path result = NaivePDFJobWorker.compile(documentRecord);

        assertTrue(result.toFile().exists(), "Expected a PDF file to exist at: " + result);
        assertTrue(result.toString().endsWith(".pdf"), "Expected output path to end with .pdf");
    }

    @Test
    @Disabled
    void compile_throwsOrReturnsPath_whenLatexIsInvalid() {
        DocumentRecord documentRecord = DocumentRecord.newBuilder()
                .setRenderId("render-456")
                .setDocumentId("doc-broken")
                .setLatexContent("this is not valid latex %%%")
                .build();

        assertThrows(RuntimeException.class, () -> NaivePDFJobWorker.compile(documentRecord));

        try {
            Path dirToDelete = Path.of("output", "doc-broken");
            FileSystemUtils.deleteRecursively(dirToDelete);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}