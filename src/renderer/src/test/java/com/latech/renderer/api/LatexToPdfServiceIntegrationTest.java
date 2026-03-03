package com.latech.renderer.api;

import com.latech.pdf.v1.*;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Iterator;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
class LatexToPdfServiceIntegrationTest {

        private PdfServiceGrpc.PdfServiceBlockingStub stub;

        private static final String TEX_CONTENT = """
            \\documentclass{article}
            \\usepackage{amsmath}
            \\begin{document}
            Hello, \\textbf{world}! Here is Euler's identity: $e^{i\\pi} + 1 = 0$.
            \\end{document}
            """;

        @BeforeEach
        void setup() {
            ManagedChannel channel = ManagedChannelBuilder
                    .forAddress("localhost", 9090)
                    .usePlaintext()
                    .build();
            stub = PdfServiceGrpc.newBlockingStub(channel);
        }

        @Test
        void submitPollAndRetrievePdf() throws InterruptedException {
            CreatePdfJobResponse createResponse = stub.createPdfJob(
                    CreatePdfJobRequest.newBuilder()
                            .setContent(TEX_CONTENT)
                            .build()
            );
            String jobId = createResponse.getJobId();
            assertNotNull(jobId);
            System.out.println("Job created: " + jobId);

            GetJobStatusResponse status;
            do {
                status = stub.getJobStatus(
                        GetJobStatusRequest.newBuilder()
                                .setJobId(jobId)
                                .build()
                );
                System.out.println("Job " + jobId + " state: " + status.getState());
                Thread.sleep(200);
            } while (status.getState() == JobState.QUEUED
                    || status.getState() == JobState.RUNNING);

            assertEquals(JobState.DONE, status.getState(),
                    "Job failed with message: " + status.getMessage());

            Iterator<GetPdfChunk> chunks = stub.getPdf(
                    GetPdfRequest.newBuilder()
                            .setJobId(jobId)
                            .build()
            );

            ByteArrayOutputStream pdf = new ByteArrayOutputStream();
            chunks.forEachRemaining(chunk -> pdf.write(chunk.getData().toByteArray(), 0, chunk.getData().size()));

            assertTrue(pdf.size() > 0);
            System.out.println("Received PDF of " + pdf.size() / 1024 + "KB");


            //saving file to disc for manual inspection
            try {
                Files.write(Path.of("output", jobId + "_result.pdf"), pdf.toByteArray());
            } catch (IOException e) {
                System.out.println("exception while trying to write file to disc: " + e);
            }
        }
}