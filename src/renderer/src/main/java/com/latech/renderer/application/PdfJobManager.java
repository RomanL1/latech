package com.latech.renderer.application;

import com.latech.renderer.model.PdfJob;
import com.latech.renderer.model.QueueFullException;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.util.UUID;
import java.util.concurrent.*;

@Service
@Slf4j
public class PdfJobManager {
    private final BlockingQueue<PdfJob> queue;
    private final ExecutorService workers;
    private final JobCache jobCache;
    private final RenderingPoC renderingPoC;
    private final int workerCount;

    public PdfJobManager(
            JobCache jobCache,
            RenderingPoC renderingPoC,
            @Value("${pdfJobManager.workers:4}") int workerCount,
            @Value("${pdfJobManager.queueCapacity:200}") int queueCapacity
    ) {
        this.jobCache = jobCache;
        this.renderingPoC = renderingPoC;
        this.workerCount = workerCount;
        this.queue = new ArrayBlockingQueue<>(queueCapacity);
        this.workers = Executors.newFixedThreadPool(workerCount); // cap concurrency
    }

    public String enqueue(String content) {
        String id = UUID.randomUUID().toString();
        jobCache.queued(id);

        if (!queue.offer(new PdfJob(id, content))) {
            //TODO(marc): Should the job get deleted here, or really moved to failed status? Need to coordinate with API
            jobCache.failed(id, "Queue full");
            throw new QueueFullException("Queue full");
        }
        return id;
    }

    @PostConstruct
    void start() {
        for (int i = 0; i < workerCount; i++) {
            workers.submit(this::loop);
        }
    }

    private void loop() {
        while (!Thread.currentThread().isInterrupted()) {
            try {
                PdfJob job = queue.take();
                jobCache.running(job.jobId());
                try {
                    Path finishedPdfPath = renderingPoC.compile(job);
                    jobCache.done(job.jobId(), finishedPdfPath);
                } catch (Exception e) {
                    jobCache.failed(job.jobId(), e.getMessage());
                    log.error("Exception during pdf creation: ", e);
                }
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
            }
        }
    }

    @PreDestroy
    void stop() {
        workers.shutdown();
        try {
            if (!workers.awaitTermination(2, TimeUnit.SECONDS)) {
                workers.shutdownNow();
            }
        } catch (InterruptedException e) {
            workers.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}
