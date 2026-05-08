# y-websocket-server :tophat:

> Simple backend for [y-websocket](https://github.com/yjs/y-websocket)

The Websocket Provider is a solid choice if you want a central source that
handles authentication and authorization. Websockets also send header
information and cookies, so you can use existing authentication mechanisms with
this server.

This project is adapted for Latech and authorizes WebSocket connections through
the Latech API before allowing a client to join a Yjs document room.

## Quick Start

### Install dependencies

```sh
npm install
```

### Start the socket server locally without Docker

```sh
HOST=localhost PORT=3000 API_INTERNAL_URL=http://localhost:5001 INTERNAL_AUTH_SECRET=d1994d751e106da55475cc5aadfb3e742b2c849bdb961b420a934e094108965f npm start
```

PowerShell:

```powershell
$env:HOST="localhost"
$env:PORT="3000"
$env:API_INTERNAL_URL="http://localhost:5001"
$env:INTERNAL_AUTH_SECRET="d1994d751e106da55475cc5aadfb3e742b2c849bdb961b420a934e094108965f"
npm start
```

### Start with Docker

For the local Docker setup, the Dockerfile already defines:

```dockerfile
ENV HOST=0.0.0.0
ENV PORT=3000
ENV API_INTERNAL_URL=http://latech-api:5001
ENV INTERNAL_AUTH_SECRET=d1994d751e106da55475cc5aadfb3e742b2c849bdb961b420a934e094108965f
```

So the container can be started without passing the internal auth secret manually, as long as the API service is reachable as `latech-api`.

```sh
docker build -t latech-socket-server .
docker run -p 3000:3000 latech-socket-server
```

The API must use the same secret value:

```properties
latech.internal.auth-secret=${LATECH_INTERNAL_AUTH_SECRET:d1994d751e106da55475cc5aadfb3e742b2c849bdb961b420a934e094108965f}
```

## Client Code

```js
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

const doc = new Y.Doc()
const wsProvider = new WebsocketProvider('ws://localhost:3000', 'DOCUMENT_ID', doc)

wsProvider.on('status', event => {
  console.log(event.status) // logs "connected" or "disconnected"
})
```

`DOCUMENT_ID` is the same document id used by the API.

The session token must not be passed in the WebSocket URL. It is sent by the
browser as a cookie.

## Environment Variables

The socket server is configured through environment variables.

| Variable | Required | Default in local Dockerfile | Description |
|---|---:|---|---|
| `HOST` | No | `0.0.0.0` | Host used by the socket server |
| `PORT` | No | `3000` | Port used by the socket server |
| `API_INTERNAL_URL` | Yes | `http://latech-api:5001` | Base URL of the Latech API |
| `INTERNAL_AUTH_SECRET` | Yes | `d1994d751e106da55475cc5aadfb3e742b2c849bdb961b420a934e094108965f` | Shared secret between socket server and API |
| `CALLBACK_URL` | No | none | API callback URL used to persist document updates |
| `CALLBACK_DEBOUNCE_WAIT` | No | `2000` | Debounce time between callbacks, in ms |
| `CALLBACK_DEBOUNCE_MAXWAIT` | No | `10000` | Maximum callback wait time, in ms |
| `CALLBACK_TIMEOUT` | No | `5000` | Timeout for callback HTTP requests, in ms |
| `CALLBACK_OBJECT_NAME` | Yes, if callback is enabled | none | Yjs shared object name to persist, for example `latech` |

## WebSocket Authorization

Before accepting a WebSocket connection, the socket server calls the API:

```txt
POST /internal/document/{documentId}/authorize-ws
```

The socket server forwards:

```txt
Cookie: doc_session=...
X-Internal-Secret: ...
```

The API response decides whether the connection is accepted:

| API Response | Socket behavior |
|---|---|
| `200` | Accept WebSocket connection |
| `401` | Reject connection |
| `403` | Reject connection |
| `404` | Reject connection |

The `INTERNAL_AUTH_SECRET` value must match the API configuration.

For the local Docker setup, the shared value is:

```txt
d1994d751e106da55475cc5aadfb3e742b2c849bdb961b420a934e094108965f
```

API configuration example:

```properties
latech.internal.auth-secret=${LATECH_INTERNAL_AUTH_SECRET:d1994d751e106da55475cc5aadfb3e742b2c849bdb961b420a934e094108965f}
```

## HTTP Callback

The socket server can send a debounced callback to the API when a Yjs document is updated.

Example without Docker:

```sh
CALLBACK_URL=http://localhost:5001/api/document/callback CALLBACK_OBJECT_NAME=latech INTERNAL_AUTH_SECRET=d1994d751e106da55475cc5aadfb3e742b2c849bdb961b420a934e094108965f npm start
```

The callback sends:

```json
{
  "room": "DOCUMENT_ID",
  "data": "..."
}
```

The callback request includes:

```txt
X-Internal-Secret: ...
```

The API uses this header to verify that the callback comes from the socket server.

## Docker

Build:

```sh
docker build -t latech-socket-server .
```

Run locally with Dockerfile defaults:

```sh
docker run -p 3000:3000 latech-socket-server
```

Run locally while overriding the API URL:

```sh
docker run \
  -e API_INTERNAL_URL=http://host.docker.internal:5001 \
  -e CALLBACK_URL=http://host.docker.internal:5001/api/document/callback \
  -e CALLBACK_OBJECT_NAME=latech \
  -p 3000:3000 \
  latech-socket-server
```

Docker Compose example:

```yaml
services:
  socket-server:
    build: .
    ports:
      - "3000:3000"
    environment:
      HOST: 0.0.0.0
      PORT: 3000
      API_INTERNAL_URL: http://latech-api:5001
      INTERNAL_AUTH_SECRET: d1994d751e106da55475cc5aadfb3e742b2c849bdb961b420a934e094108965f
      CALLBACK_URL: http://latech-api:5001/api/document/callback
      CALLBACK_OBJECT_NAME: latech
```

## Security Notes

For the local Docker setup, the internal auth secret is currently defined in the Dockerfile.

This is acceptable for local development or a controlled demo setup, but it is not recommended for production deployment.

The Dockerfile is part of the built image and can be pushed to a registry or shared across environments. If a production secret is hardcoded in the Dockerfile, anyone with access to the image or registry may be able to recover it. Changing the secret would also require rebuilding and redeploying the image.

For production, `INTERNAL_AUTH_SECRET` and `LATECH_INTERNAL_AUTH_SECRET` should be provided at runtime through environment variables, Docker Compose secrets, Kubernetes Secrets, or another secret manager.

## License

[The MIT License](./LICENSE) © Kevin Jahns