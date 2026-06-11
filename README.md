<div align="center">

  <h1 align="center">LaTeCH</h1>

  <span align="center">
    Collaborative LaTeX editor
  </span>

  <a href="https://latech.app" target="_blank">latech.app</a>

[![Continuous Integration Build](https://github.com/RomanL1/latech/actions/workflows/continuous_integration.yml/badge.svg)](https://github.com/RomanL1/latech/actions/workflows/continuous_integration.yml)

</div>

## Table of Contents

- [About the Project](#about-the-project)
- [Service Documentation](#service-documentation)
- [System Requirements](#system-requirements)
- [Configuration](#configuration)
- [Deploy on a VPS](#deploy-on-a-vps)
- [Local Development](#local-development)
- [Operations](#operations)
- [Contributing](#contributing)
- [License](#license)

## About the Project

LaTeCH is a web-based LaTeX editor that allows multiple users to collaborate on documents in real time.

The application is split into several services:

- **Frontend**: React/Vite application served by Nginx.
- **API**: Java Spring Boot backend for documents, templates, images, persistence, and HTTP APIs.
- **Renderer**: Java Spring Boot worker that starts isolated LaTeX containers to compile PDFs.
- **Socket Server**: Node.js/Yjs WebSocket server for real-time collaboration.
- **Infrastructure**: PostgreSQL, RabbitMQ, SeaweedFS S3-compatible storage, and Caddy reverse proxy.

Useful project documentation:

- [System Architecture](./docs/architecture/architecture.md)
- [RabbitMQ Architecture](./docs/architecture/rabbitmq_architecture.md)
- [Requirements](./docs/requirements.md)
- [Testing Concept](./docs/testing-concept.md)
- [IntelliJ Setup](./docs/INTELLIJ_SETUP.md)

## Service Documentation

Read these service-level guides before changing or running a specific component:

- [Frontend README](./src/frontend/README.md)
- [API README](./src/api/README.md)
- [Renderer README](./src/renderer/README.md)
- [Socket Server README](./src/socket-server/README.md)
- [Database Migrations README](./src/api/src/main/resources/db/README.md)

## System Requirements

For a VPS deployment, use a Linux host. The renderer explicitly depends on Linux because it uses the host Docker daemon to run LaTeX compilation containers.

Required on the server:

- Docker Engine with the Docker Compose plugin.
- A domain name pointing to the server.
- Open inbound ports `80` and `443` for Caddy and TLS certificates.
- Enough disk space for Docker images, PostgreSQL data, RabbitMQ data, SeaweedFS objects, and rendered files.
- A mounted renderer work directory at `/mnt/compileRAMTempFS`.
- Access to the LaTeCH container images in GHCR, or a local build workflow for all images.

Production Compose uses these runtime services:

| Service | Purpose | Internal Port |
|---|---|---:|
| `caddy` | Public HTTPS reverse proxy | `80`, `443` |
| `frontend` | React application served by Nginx | `80` |
| `api` | Spring Boot API | `5001` |
| `socket-server` | Yjs WebSocket server | `3000` |
| `renderer` | PDF render worker | `8090` |
| `postgres` | Database | `5432` |
| `rabbitmq` | Message broker | `5672` |
| `seaweedfs` | S3-compatible object storage | `8333` |

## Configuration

The production deployment reads secrets from an `.env` file next to `deploy.prod.yml`.

Create this file on the VPS:

```env
POSTGRES_USER=latech
POSTGRES_PASSWORD=replace-with-a-long-random-password
RABBITMQ_USER=latech
RABBITMQ_PASSWORD=replace-with-a-long-random-password
SEAWEEDFS_ACCESS_KEY=replace-with-a-long-random-access-key
SEAWEEDFS_SECRET_KEY=replace-with-a-long-random-secret-key
INTERNAL_AUTH_SECRET=replace-with-a-long-random-shared-secret
DOCKER_GID=replace-with-the-host-docker-group-id
```

Get the Docker group id on the server with:

```sh
stat -c '%g' /var/run/docker.sock
```

Important configuration points:

- `INTERNAL_AUTH_SECRET` must be identical for the API and socket server. It protects internal WebSocket authorization and callback requests.
- `FRONTEND_URL`, `VITE_API_HOST`, and `WEBSOCKET_SERVER_URL` are currently set in `deploy.prod.yml` for `https://latech.app`. Change them if deploying under another domain.
- `Caddyfile` is currently configured for `latech.app` and `portainer.latech.app`. Change hostnames before deploying another environment.
- The API and renderer both use the same SeaweedFS bucket in production: `latech`.
- Database migrations are managed by Flyway and run when the API starts. See the [Database Migrations README](./src/api/src/main/resources/db/README.md).

## Deploy on a VPS

1. Install Docker Engine and the Docker Compose plugin on the Linux VPS.

2. Point your DNS records to the VPS:

   ```txt
   latech.example.com      A/AAAA -> your server IP
   ```

3. Clone the repository on the server:

   ```sh
   git clone https://github.com/RomanL1/latech.git
   cd latech
   ```

4. Update the domain-specific files:

   - In [deploy.prod.yml](./deploy.prod.yml), replace `https://latech.app`, `wss://latech.app/ws`, and `https://latech.app/api` with your production domain.
   - In [Caddyfile](./Caddyfile), replace `latech.app` with your production domain.
   - Remove or update the `portainer.latech.app` block if you do not run Portainer.

5. Create the `.env` file described in [Configuration](#configuration).

6. Create the renderer work filesystem:

   ```sh
   sudo ./createTempFSforRenderer.sh
   ```

   This mounts `/mnt/compileRAMTempFS`, which is used by the `render_tmp` volume in `deploy.prod.yml`.

7. Make sure the LaTeX runner image exists on the Docker host:

   ```sh
   docker build -t tex-renderer-image -f src/renderer/src/main/resources/tex-renderer-Dockerfile src/renderer/src/main/resources
   ```

   The renderer starts this image through the host Docker socket when compiling documents.

8. Start the production stack:

   ```sh
   docker compose -f deploy.prod.yml up -d
   ```

9. Check the services:

   ```sh
   docker compose -f deploy.prod.yml ps
   docker compose -f deploy.prod.yml logs -f api renderer socket-server caddy
   ```

10. Open your configured domain in a browser. Caddy will request and renew TLS certificates automatically when DNS and ports `80`/`443` are correct.

To deploy staging instead, use [deploy.staging.yml](./deploy.staging.yml) and [Caddyfile.staging](./Caddyfile.staging). The staging files currently target `staging.latech.app`.

## Local Development

Local development can run with the root [compose.yml](./compose.yml) plus service-specific development commands.

Start infrastructure and backend services with Docker Compose:

```sh
./localDevCompose.sh
```

This script sets `DOCKER_GID` from `/var/run/docker.sock` and starts Compose with local builds.

Run individual services locally when working on them:

- Frontend: see [Frontend README](./src/frontend/README.md). It uses Bun and Vite.
- API: see [API README](./src/api/README.md). It uses Gradle and Java 25.
- Renderer: see [Renderer README](./src/renderer/README.md). It only works on Linux and requires the LaTeX runner image.
- Socket Server: see [Socket Server README](./src/socket-server/README.md). It uses Node.js and Yjs.

The local Compose setup exposes:

- Frontend dev server: `http://localhost:5173` when started with Bun.
- API: `http://localhost:5001`.
- Socket server: `ws://localhost:3000/ws`.
- Renderer: `http://localhost:8090`.
- PostgreSQL: `localhost:5432`.
- RabbitMQ management UI: `http://localhost:15672`.
- SeaweedFS S3 API: `http://localhost:8333`.

## Operations

Useful commands:

```sh
docker compose -f deploy.prod.yml pull
docker compose -f deploy.prod.yml up -d
docker compose -f deploy.prod.yml logs -f
docker compose -f deploy.prod.yml down
```

Persistent data is stored in Docker volumes:

- `postgres_data`
- `rabbitmq_data`
- `seaweedfs-data`
- `caddy_data`
- `caddy_config`
- `render_tmp`, bound to `/mnt/compileRAMTempFS`

Back up `postgres_data` and `seaweedfs-data` before upgrades or server migrations. RabbitMQ and Caddy volumes may also be worth backing up depending on the environment.

To remove the renderer temporary filesystem:

```sh
sudo ./teardownTempFSforRenderer.sh
```

## Contributing

See our [Git Guidelines](./docs/guidelines/git_guidelines.md) for how to contribute to this project.

## License

This project is [MIT](https://github.com/RomanL1/latech/blob/main/LICENSE) licensed.<br>
You are free to use, modify, and distribute this software, provided that the original copyright and license notice are included.
