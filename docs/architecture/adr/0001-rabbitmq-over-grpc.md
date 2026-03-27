# ADR 0001: Use RabbitMQ over gRPC for Asynchronous PDF Rendering

## Status

Accepted

## Context

The Latech application involves generating PDF documents from LaTeX source code. This process can be computationally intensive and variable in duration depending on the complexity of the document. If we process these rendering requests synchronously, we risk tying up API threads, leading to slow response times or HTTP timeouts for the end-user.

We evaluated gRPC and RabbitMQ for the communication between the Latech API backend and the external PDF rendering workers. While gRPC is excellent for fast, synchronous, and tightly coupled microservice communication, it is less naturally suited for long-running, asynchronous background tasks without implementing custom polling or complex streaming mechanisms.

We needed a solution that natively supports:

- **Asynchronous Task Processing**: "Fire-and-forget" from the API's perspective.
- **Queueing**: Safe buffering of rendering requests during periods of high load.
- **Worker Load Balancing**: Native round-robin distribution to available rendering worker instances.
- **Resilience and Error Handling**: Native support for manual acknowledgments and dead-letter queues (DLQ) if a document fundamentally fails to render due to severe syntax errors (poison pills).

## Decision

We decided to use **RabbitMQ** as our message broker instead of gRPC for the document rendering pipeline.

The API backend will publish a `DocumentRecord` (Protobuf) message to a RabbitMQ Topic Exchange. Available PDF Renderer workers will consume these messages from the bound queues, process the LaTeX content asynchronously, and then publish a `PdfMetadata` result message back to a different queue that the API listens to.

## Consequences

### Positive

- **Fully Asynchronous**: The API responds immediately after enqueuing the job, freeing up threads and preventing timeouts.
- **Scalability**: We can independently scale the rendering workers based on the queue depth (e.g., adding more consumers).
- **Robustness**: RabbitMQ natively provides message persistence, manual acknowledgments, and Dead Letter Exchanges (DLX/DLQ) to quarantine failing payloads without repeatedly crashing workers.
- **Decoupling**: The API and the renderers are completely decoupled; they only share the Protobuf message contract and the RabbitMQ broker connection.

### Negative

- **Operational Complexity**: We must host, monitor, and maintain a RabbitMQ instance/cluster in our infrastructure, introducing another point of failure compared to direct gRPC connections.
- **Eventual Consistency**: The system is now eventually consistent. The frontend must implement a mechanism (like polling, Server-Sent Events, or WebSockets) to receive the final rendering outcome, as the initial HTTP request will only indicate that the job was accepted.
