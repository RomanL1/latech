package com.latech.renderer;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.UUID;
import java.util.concurrent.*;

@Service
public class PdfJobManager {
    private final BlockingQueue<PdfJob> queue;
    private final ExecutorService workers;
    private final JobStore store;
    //private final PdflatexPdfRenderer renderer;
    private final int workerCount;

    public PdfJobManager(
            JobStore store,
            //PdflatexPdfRenderer renderer,
            @Value("${pdf.workers:4}") int workerCount,
            @Value("${pdf.queueCapacity:200}") int queueCapacity
    ) {
        this.store = store;
        //this.renderer = renderer;
        this.workerCount = workerCount;
        this.queue = new ArrayBlockingQueue<>(queueCapacity);
        this.workers = Executors.newFixedThreadPool(workerCount); // cap concurrency
    }

    public String enqueue(String content) {
        String id = UUID.randomUUID().toString();
        store.queued(id);

        if (!queue.offer(new PdfJob(id, content))) {
            store.failed(id, "Queue full");
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
                store.running(job.jobId());
                try {
                    //TODO(marc): creation of container and actual compiling of the pdf
                    //store.done(job.jobId(), pdf);
                } catch (Exception e) {
                    store.failed(job.jobId(), e.getMessage());
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
