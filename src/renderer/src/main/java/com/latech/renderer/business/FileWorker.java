package com.latech.renderer.business;

import com.latech.renderer.model.CompileJob;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.FileSystemUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

@Component
@Slf4j
public class FileWorker {

    private static final Path WORK_DIR = Path.of("/workdir");
    private final S3Service s3Service;

    public FileWorker( S3Service s3Service){
        this.s3Service = s3Service;
    }

    public void setupWorkDir( CompileJob compileJob ) throws IOException, InterruptedException {
        Path compileDirectory = WORK_DIR.resolve( compileJob.getRenderId() + "/" );
        Files.createDirectory( compileDirectory );
        compileJob.setCompileDir( compileDirectory );
        new ProcessBuilder( "chown", "1001:1001", compileDirectory.toString() ).start().waitFor();
    }

    public void setupTexFileAndLogFile( CompileJob compileJob ) throws IOException {
        Path texFile = compileJob.getCompileDir().resolve( compileJob.getDocumentId() + ".tex");
        Files.writeString(texFile, compileJob.getLatexContent() );
        Path compileLogPath = compileJob.getCompileDir().resolve( "compile.log" );
        Files.createFile( compileLogPath );
        compileJob.setTexFilePath( texFile );
        compileJob.setCompileLogPath( compileLogPath );
    }

    public void setupImages( CompileJob compileJob ){
        Map<String, String> imagesMap = compileJob.getImages().orElseThrow();
        for (String imageUUID : imagesMap.keySet()){
            String s3ImageKey = compileJob.getDocumentId() + "/" + imageUUID;
            String userSuppliedName = imagesMap.get( imageUUID );
            Path imagePath = compileJob.getCompileDir().resolve( userSuppliedName );
            this.s3Service.getFileAndSaveToPath( s3ImageKey, imagePath );
        }
    }

    public static void cleanupWorkDir( CompileJob compileJob) throws IOException {
        if ( compileJob.getCompileDir() == null){
            return;
        }
        try {
            FileSystemUtils.deleteRecursively( compileJob.getCompileDir() );
        } catch ( IOException e ) {
            log.error( "Error while trying to cleanup: {}", e.getMessage() );
            throw new IOException( e );
        }
    }
}
