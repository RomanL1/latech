package com.latech.renderer.model;

import com.google.protobuf.Timestamp;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;

import java.nio.file.Path;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Setter
@Getter
public class CompileJob {

    private final String documentId;
    private final String renderId;
    private final String latexContent;
    @Getter(AccessLevel.NONE)
    private final Map<String, String> images;
    private JobStatus jobStatus;
    private Path compileDir;
    private Path texFilePath;
    private String containerName;
    private Path compileLogPath;
    private String s3PdfKey;
    @Getter(AccessLevel.NONE)
    private Throwable exception;
    private Long containerStartTime;
    @Setter( AccessLevel.NONE)
    private int retries;
    @Getter(AccessLevel.NONE)
    private Timestamp compileTimestamp;
    private String compileOutput;
    private Path pdfPath;


    public CompileJob ( String documentId, String renderId, String latexContent, Map<String, String> images ) {
        this.documentId = documentId;
        this.renderId = renderId;
        this.latexContent = latexContent;
        this.images = images.isEmpty() ? null : images;
        this.jobStatus = JobStatus.STARTING;
        this.s3PdfKey = "";
        this.compileOutput = "";
        this.containerStartTime = null;
    }

    public Optional<Map<String, String>> getImages () {
        return Optional.ofNullable(this.images);
    }

    public Optional<Throwable> getException(){
        return Optional.ofNullable( this.exception );
    }

    public Optional<Timestamp> getCompileTimestamp(){
        return Optional.ofNullable( this.compileTimestamp );
    }

    public void incRetries(){
        this.retries++;
    }

    @Override
    public boolean equals ( Object o ) {
        if ( this == o ) return true;
        return ( o instanceof CompileJob that )
                && Objects.equals( documentId, that.documentId )
                && Objects.equals( renderId, that.renderId )
                ;
    }

    @Override
    public int hashCode () {
        return Objects.hash( documentId, renderId );
    }


}
