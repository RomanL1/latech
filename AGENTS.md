---
description: "Use when: taking any action in this repository or answering general questions about the LaTeCH codebase, architecture, tech stack, or development conventions."
---

# LaTeCH Project Context

This is LaTeCH, a web-based collaborative LaTeX editor.

## System Architecture & Tech Stack

This project uses a microservices architecture. Each folder in `src/` represents a separate service:

- **Frontend** (`src/frontend/`): React.js Application built with Vite and Bun. Contains the Web UI.
- **API Backend** (`src/api/`): Java Spring Boot application (Gradle). Handles endpoints for documents, templates, and storage.
- **LaTeX Renderer** (`src/renderer/`): Java Spring Boot application (Gradle). Generates PDFs from LaTeX code.
- **Socket Server** (`src/socket-server/`): Node.js WebSocket server utilizing [Yjs](https://yjs.dev/) for real-time collaboration.
- **Infrastructure**: PostgreSQL (DB), MinIO (File Storage), RabbitMQ. Run locally via `compose.yml`.

See the [System Architecture](./docs/architecture/architecture.md) and [RabbitMQ Architecture](./docs/architecture/rabbitmq_architecture.md).

## Development Conventions

- **Frontend**: Uses `bun` as the package manager (`bunfig.toml` exists). Tests run with `vitest`.
- **Backend**: Uses Gradle (`./gradlew build`, `./gradlew test`). Tests use `JUnit` and `Testcontainers`.
- For more on testing strategy, read the [Testing Concept](./docs/testing-concept.md).

## Git & Workflow Conventions

- **Branch Naming**: Must follow the pattern `feature/{NAME}/{DESCRIPTION}` (e.g., `feature/roman/add-login`).
- **Commits**: Must follow [Conventional Commits](https://www.conventionalcommits.org/).
- **Pull Requests**: Keep them small and feature-focused.

For full rules, read the [Git Guidelines](./docs/guidelines/git_guidelines.md).
