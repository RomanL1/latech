package com.latech.renderer.process;

public class ProcessExecutionException extends RuntimeException {
    
    private final ProcessResult result;

    public ProcessExecutionException(String message) {
        super(message);
        this.result = null;
    }

    public ProcessExecutionException(String message, Throwable cause) {
        super(message, cause);
        this.result = null;
    }

    public ProcessExecutionException(String message, ProcessResult result) {
        super(message + (result != null ? "\nExit code: " + result.exitCode() + "\nOutput: " + result.output() + "\nError: " + result.error() : ""));
        this.result = result;
    }

    public ProcessResult getResult() {
        return result;
    }
}
