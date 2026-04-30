package com.latech.renderer.business;

import com.latech.renderer.api.DocumentRecord;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.util.FileSystemUtils;

import java.io.IOException;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class NaivePDFJobWorkerTest {

    @Test
    @Disabled
    void compile_producesPdfFile_whenGivenValidLatex () throws IOException, InterruptedException {
        DocumentRecord documentRecord = DocumentRecord.newBuilder()
                .setRenderId( "render-123" )
                .setDocumentId( "doc-abc" )
                .setLatexContent( """
                        \\documentclass{article}
                        \\begin{document}
                        Hello, World!
                        \\end{document}
                        """ )
                .build();

        CompileResult result = NaivePDFJobWorker.compile( documentRecord );

        assertTrue( result.success(), "Expected compile to succeed" );
        assertTrue( result.pdfPath().toFile().exists(), "Expected a PDF file to exist at: " + result.pdfPath() );
        assertTrue( result.pdfPath().toString().endsWith( ".pdf" ), "Expected output path to end with .pdf" );
    }

    @Test
    @Disabled
    void compile_returnsFalse_whenLatexIsInvalid () throws Exception {
        DocumentRecord documentRecord = DocumentRecord.newBuilder()
                .setRenderId( "render-456" )
                .setDocumentId( "doc-broken" )
                .setLatexContent( "this is not valid latex %%%" )
                .build();

        CompileResult result = NaivePDFJobWorker.compile( documentRecord );
        assertFalse( result.success(), "Expected compile to fail" );
        assertTrue( result.output() != null && !result.output().isEmpty(), "Expected output to contain log message" );

        try {
            Path dirToDelete = Path.of( "output", "doc-broken" );
            FileSystemUtils.deleteRecursively( dirToDelete );
        } catch ( IOException e ) {
            throw new RuntimeException( e );
        }
    }
}
