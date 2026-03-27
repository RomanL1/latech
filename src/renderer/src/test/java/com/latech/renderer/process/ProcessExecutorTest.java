package com.latech.renderer.process;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

class ProcessExecutorTest {

    private ProcessExecutor processExecutor;

    @BeforeEach
    void setUp() {
        processExecutor = new ProcessExecutor();
    }

    @Test
    void executeShouldCaptureStdoutAndExitCode() {
        ProcessResult result = processExecutor.execute(Duration.ofSeconds(2), "echo", "hello world");
        
        assertTrue(result.isSuccess());
        assertEquals(0, result.exitCode());
        assertEquals("hello world\n", result.output());
        assertEquals("", result.error());
    }

    @Test
    void executeShouldCaptureStderrAndNonZeroExitCode() {
        // ls a non-existent file to generate an error
        ProcessResult result = processExecutor.execute(Duration.ofSeconds(2), "ls", "this_file_does_not_exist.txt");
        
        assertFalse(result.isSuccess());
        assertNotEquals(0, result.exitCode());
        assertTrue(result.error().contains("No such file or directory"));
    }

    @Test
    void executeShouldThrowExceptionOnTimeout() {
        ProcessExecutionException exception = assertThrows(ProcessExecutionException.class, () -> {
            processExecutor.execute(Duration.ofMillis(100), "sleep", "1");
        });

        assertTrue(exception.getMessage().contains("Process timed out after 100ms"));
    }

    @Test
    void startInBackgroundShouldReturnRunningProcess() throws Exception {
        Process process = processExecutor.startInBackground("sleep", "1");
        assertTrue(process.isAlive());
        process.waitFor();
        assertFalse(process.isAlive());
    }
}
