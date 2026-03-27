package com.latech.renderer.process;

public record ProcessResult(int exitCode, String output, String error) {
    public boolean isSuccess() {
        return exitCode == 0;
    }
}
