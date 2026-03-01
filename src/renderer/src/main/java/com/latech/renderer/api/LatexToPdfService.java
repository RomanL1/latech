package com.latech.renderer.api;

import com.latech.pdf.v1.*;
import com.latech.renderer.JobStore;
import com.latech.renderer.PdfJobManager;
import com.latech.renderer.QueueFullException;
import com.latech.renderer.State;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import org.springframework.grpc.server.service.GrpcService;

@GrpcService
public class LatexToPdfService extends PdfServiceGrpc.PdfServiceImplBase {
    private final PdfJobManager manager;
    private final JobStore store;

    public LatexToPdfService(PdfJobManager manager, JobStore store) {
        this.manager = manager;
        this.store = store;
    }

    @Override
    public void createPdfJob(CreatePdfJobRequest req, StreamObserver<CreatePdfJobResponse> obs) {
        try {
            String id = this.manager.enqueue(req.getContent());
            obs.onNext(CreatePdfJobResponse.newBuilder().setJobId(id).build());
            obs.onCompleted();
        } catch (QueueFullException e) {
            obs.onError(Status.RESOURCE_EXHAUSTED
                    .withDescription(e.getMessage())
                    .asRuntimeException());
        } catch (Exception e) {
            obs.onError(Status.INTERNAL
                    .withDescription("Unexpected error")
                    .withCause(e)
                    .asRuntimeException());
        }
    }

    @Override
    public void getJobStatus(GetJobStatusRequest req, StreamObserver<GetJobStatusResponse> obs) {
        var e = store.get(req.getJobId());
        if (e == null) {
            obs.onError(Status.NOT_FOUND.withDescription("Unknown jobId").asRuntimeException());
            return;
        }

        obs.onNext(GetJobStatusResponse.newBuilder()
                .setJobId(req.getJobId())
                .setState(toProtoState(e.state().name()))
                .setMessage(e.message() == null ? "" : e.message())
                .build());
        obs.onCompleted();
    }

    @Override
    public void getPdf(GetPdfRequest req, StreamObserver<GetPdfChunk> obs) {
        var e = store.get(req.getJobId());

        if (e == null) {
            obs.onError(Status.NOT_FOUND
                    .withDescription("unknown JobId")
                    .asRuntimeException());
            return;
        }

        if (e.state() == State.RUNNING || e.state() == State.QUEUED) {
            obs.onError(Status.FAILED_PRECONDITION
                    .withDescription("Not ready")
                    .asRuntimeException());
            return;
        }

        if (e.state() == State.FAILED) {
            obs.onError(Status.INTERNAL
                    .withDescription("Failed: " + e.message())
                    .asRuntimeException());

            //TODO(marc): do we delete the entry here? API needs to handle failed jobs correctly.
            store.deleteEntry(req.getJobId());
            return;
        }

        //TODO(marc): maybe don't load entire pdf, instead stream it from disc aswell.
        byte[] pdf = e.pdfBytes();
        int chunkSize = 64 * 1024;
        for (int i = 0; i < pdf.length; i += chunkSize) {
            int len = Math.min(chunkSize, pdf.length - i);
            obs.onNext(GetPdfChunk.newBuilder()
                    .setData(com.google.protobuf.ByteString.copyFrom(pdf, i, len))
                    .build());
        }
        obs.onCompleted();

        //TODO(marc): delete pdf from disc if we store only the path in store.
        // assuming API handles getting the file once and redirects following requests away from renderer.
        store.deleteEntry(req.getJobId());
    }

    private static JobState toProtoState(String s) {
        return switch (s) {
            case "QUEUED" -> JobState.QUEUED;
            case "RUNNING" -> JobState.RUNNING;
            case "DONE" -> JobState.DONE;
            case "FAILED" -> JobState.FAILED;
            default -> JobState.JOB_STATE_UNSPECIFIED;
        };
    }
}
