package com.latech.renderer.application;

import com.latech.renderer.model.PdfJob;
import com.latech.renderer.model.QueueFullException;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.UUID;
import java.util.concurrent.*;

@Service
@Slf4j
public class PdfJobManager {
    private final BlockingQueue<PdfJob> queue;
    private final ExecutorService workers;
    private final JobCache jobCache;
    //private final PdflatexPdfRenderer renderer;
    private final int workerCount;

    public PdfJobManager(
            JobCache jobCache,
            //PdflatexPdfRenderer renderer,
            @Value("${pdf.workers:4}") int workerCount,
            @Value("${pdf.queueCapacity:200}") int queueCapacity
    ) {
        this.jobCache = jobCache;
        //this.renderer = renderer;
        this.workerCount = workerCount;
        this.queue = new ArrayBlockingQueue<>(queueCapacity);
        this.workers = Executors.newFixedThreadPool(workerCount); // cap concurrency
    }

    public String enqueue(String content) {
        String id = UUID.randomUUID().toString();
        jobCache.queued(id);

        if (!queue.offer(new PdfJob(id, content))) {
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
                    //TODO(marc): creation of container and actual compiling of the pdf
                    //store.done(job.jobId(), pdf);
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
