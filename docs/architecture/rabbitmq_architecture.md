# Latech Application Architecture: Document Rendering Pipeline

This document outlines the complete architecture for asynchronous document processing within the Latech application. It spans from the collaborative frontend editor down to the robust, queue-driven RabbitMQ backends, incorporating decisions from our previous architectural discussions.

## 1. High-Level Flow: From Editor to Renderer

1. **Frontend Collaboration**: The frontend utilizes a collaborative editor supported by **Yjs** and **Monaco Editor**, specifically configured to support **LaTeX Syntax**.
2. **Submission**: When a document is complete or ready for rendering, the backend retrieves the synchronized Yjs document state.
3. **Serialization (Protobuf)**: The document state is mapped into a Protocol Buffer (`protobuf`) message before entering the messaging pipeline.
4. **Message Broker (RabbitMQ)**: Messages are routed across Topic Exchanges and Queues to facilitate stateless, scalable rendering.
5. **Completion**: Upon rendering, a status message is pushed back to the main API to update the system and the user.

## 2. Protobuf Data Structures

Two main Protocol Buffer (`.proto`) messages define the strict data contracts between the API backend and the external rendering services:

### DocumentRecord

Sent to the document queue to initiate rendering.

- `document_id`: UUID string identifying the document.
- `latex_content`: The complete, raw LaTeX document string gathered from the Yjs editor.
- `image_ids`: A repeated list of associated image string IDs.

### PdfMetadata

Sent back to the main API to communicate the result of a rendering task.

- `document_uuid`: UUID string linking back to the original request.
- `rendered_timestamp`: ISO 8601 millisecond timestamp (`google.protobuf.Timestamp`).
- `status`: Enum representing the outcome (`SUCCESSFULLY_RENDERED` or `ERROR_WHILE_RENDERING`).
- `error_message`: Optional string capturing the renderer's exception output if a failure occurred.

## 3. RabbitMQ Architecture: Topics over Queues

We utilize a central `TopicExchange` (`latech.topic`) rather than connecting services directly queue-to-queue. Coupling Queues to a Topic provides maximum routing flexibility.

### Topic Exchange Routing Strategy

By using a Topic Exchange, producers do not need to know which queues exist. Producers publish messages to the Exchange with a targeted Routing Key (e.g., `document_exchange.new`).
Queues are bound to the exchange using wildcard Routing Keys (e.g., `document_exchange.#`). Any message with a routing key starting with `document_exchange.` will naturally flow into the `document_exchange` queue.

### The Render Request Queue (`document_exchange`)

- **Producers**: The Latech API backend.
- **Consumers**: One or more PDF Renderer worker services.
- **Worker Queue Pattern**: Multiple renderer instances can listen to the `document_exchange` queue concurrently. RabbitMQ employs **round-robin** distribution to ensure a single document request is handled by exactly **one** available renderer.

### The Rendering Result Queue (`pdf_rendered`)

- **Producers**: The PDF Renderers.
- **Consumers**: The Latech API backend (e.g., `PdfRenderedConsumer.java`).

## 4. Message Reliability: Manual Acknowledgments

When a worker receives a message, the message enters an **"unacknowledged" (unacked)** state on the RabbitMQ server. This state renders the message invisible to all other workers. It is only permanently deleted when the server receives an acknowledgment.

The Latech application is configured for **Manual Acknowledgment Mode** (`spring.rabbitmq.listener.simple.acknowledge-mode=manual`). This grants explicit, programmatic control over the message lifecycle:

- **Success**: The consumer executes `channel.basicAck(tag, false)` once rendering entirely succeeds, securely finalizing the process.
- **Failure**: The consumer uses `channel.basicReject(tag, false)` to explicitly reject the message. Passing `false` for the "requeue" parameter prevents the software from placing the broken message back in line.

## 5. Handling Poison Pills: Dead Letter Exchanges (DLX) & Queues (DLQ)

If a LaTeX document contains severe parsing errors, the renderer will fail and reject the message. Without further intervention, an indefinitely requeued message becomes a "poison pill"—it endlessly crashes renderers as they try (and fail) over and over, preventing healthy documents from being processed.

To overcome this, we implement the **DLX (Dead Letter Exchange)** and **DLQ (Dead Letter Queue)** pattern.

### How DLX and DLQ Work Together

1. **Dead Letter Exchange (DLX)**: A supplemental Topic Exchange is created, specifically named `document_exchange.dlx`.
2. **Queue Configuration**: The standard `document_exchange` queue is strictly configured at creation time with two critical arguments:
   - `x-dead-letter-exchange`: Informs RabbitMQ where to send rejected messages (our DLX).
   - `x-dead-letter-routing-key`: Modifies or retains the routing key as it passes through the DLX.
3. **Dead Letter Queue (DLQ)**: A dedicated `document_exchange.dlq` queue is bound to the DLX.
4. **The DLQ Flow**:
   - A document fails to compile.
   - The worker rejects it via `channel.basicReject(tag, false)`.
   - RabbitMQ intercepts the rejected message and funnels it to `document_exchange.dlx`.
   - The DLX safely deposits the "dead" message into `document_exchange.dlq`.

**Operational Benefits**:

- **Uninterrupted Flow**: The primary `document_exchange` queue is free of blockers. Healthy documents continue processing seamlessly.
- **Observability and Recovery**: Failed payloads accumulate in the DLQ instead of disappearing. Developers can inspect these messages, debug the problematic LaTeX syntax, and cleanly discard or manually fix-and-requeue them.
