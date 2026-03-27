package com.latech.renderer.process;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.*;

@Service
@Slf4j
public class ProcessExecutor {

    /**
     * Executes a native command with a timeout, safely capturing stdout and stderr.
     *
     * @param timeout the maximum duration to wait for the process to complete
     * @param command the command and its arguments
     * @return ProcessResult containing the exit code, stdout, and stderr
     * @throws ProcessExecutionException if the process times out, is interrupted, or fails to start
     */
    public ProcessResult execute(Duration timeout, String... command) {
        ProcessBuilder pb = new ProcessBuilder(command);
        Process process;
        try {
            process = pb.start();
        } catch (IOException e) {
            throw new ProcessExecutionException("Failed to start process: " + String.join(" ", command), e);
        }

        return waitForProcess(process, timeout, String.join(" ", command));
    }

    /**
     * Executes a native command without a timeout, safely capturing stdout and stderr.
     *
     * @param command the command and its arguments
     * @return ProcessResult containing the exit code, stdout, and stderr
     * @throws ProcessExecutionException if the process is interrupted or fails to start
     */
    public ProcessResult execute(String... command) {
        return execute(null, command);
    }

    /**
     * Starts a background process and immediately returns the Process instance.
     * The caller is responsible for managing the process lifecycle and streams.
     *
     * @param command the command and its arguments
     * @return the running Process
     * @throws ProcessExecutionException if the process fails to start
     */
    public Process startInBackground(String... command) {
        ProcessBuilder pb = new ProcessBuilder(command);
        try {
            return pb.start();
        } catch (IOException e) {
            throw new ProcessExecutionException("Failed to start background process: " + String.join(" ", command), e);
        }
    }

    private ProcessResult waitForProcess(Process process, Duration timeout, String commandLine) {
        try (ExecutorService streamCompleter = Executors.newFixedThreadPool(2)) {
            
            Future<String> outputFuture = streamCompleter.submit(() -> readStream(process.getInputStream()));
            Future<String> errorFuture = streamCompleter.submit(() -> readStream(process.getErrorStream()));

            boolean exited;
            if (timeout != null) {
                exited = process.waitFor(timeout.toMillis(), TimeUnit.MILLISECONDS);
            } else {
                process.waitFor();
                exited = true;
            }

            if (!exited) {
                process.destroyForcibly();
                throw new ProcessExecutionException("Process timed out after " + timeout.toMillis() + "ms: " + commandLine);
            }

            String output = outputFuture.get();
            String error = errorFuture.get();

            return new ProcessResult(process.exitValue(), output, error);

        } catch (InterruptedException e) {
            process.destroyForcibly();
            Thread.currentThread().interrupt();
            throw new ProcessExecutionException("Thread interrupted while waiting for process: " + commandLine, e);
        } catch (ExecutionException e) {
            process.destroyForcibly();
            throw new ProcessExecutionException("Failed to read process output: " + commandLine, e.getCause());
        }
    }

    private String readStream(InputStream is) throws IOException {
        return new String(is.readAllBytes(), StandardCharsets.UTF_8);
    }
}
