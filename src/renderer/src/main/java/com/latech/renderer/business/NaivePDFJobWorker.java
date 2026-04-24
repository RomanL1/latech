package com.latech.renderer.business;

import com.latech.renderer.api.DocumentRecord;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.temporal.ChronoUnit;

@Slf4j
public class NaivePDFJobWorker {

    public NaivePDFJobWorker () {
    }

    public static Path compile ( DocumentRecord documentRecord ) throws IOException, InterruptedException {

        Path jobDir = Path.of( "output", documentRecord.getDocumentId() );

        Files.createDirectories( jobDir );
        //TODO(marc): figure out if we reject absurdly large .tex files here, or already in the API
        Path texFile = jobDir.resolve( documentRecord.getDocumentId() + ".tex" );
        Files.writeString( texFile, documentRecord.getLatexContent() );

        long compileStart = System.currentTimeMillis();
        Process process = new ProcessBuilder( "pdflatex", "-no-shell-escape", "-interaction=nonstopmode", "-halt-on-error", "-output-directory=" + jobDir.toAbsolutePath()
                .toString(), documentRecord.getDocumentId() + ".tex"                      // relative to /workdir inside container
        ).directory( jobDir.toFile() ).redirectErrorStream( true )  // merge stderr into stdout
                .start();

        // Drain stdout — if you don't, the process can deadlock on a full pipe buffer
        String output = new String( process.getInputStream().readAllBytes() );

        //TODO(marc): tune the wait time.
        boolean completed = process.waitFor( Duration.of( 10, ChronoUnit.SECONDS ) );
        long compileDuration = System.currentTimeMillis() - compileStart;
        log.info( "Compiling of {} took {}ms", documentRecord.getDocumentId() + ".pdf", compileDuration );

        if ( !completed ) {
            throw new RuntimeException( "pdflatex failed :\n" + output );
        }

        Path pdfPath = jobDir.resolve( documentRecord.getDocumentId() + ".pdf" );

        if ( !Files.exists( pdfPath ) ) {
            throw new RuntimeException( "pdf file could not be created." );
        }


        return pdfPath;
    }
}
