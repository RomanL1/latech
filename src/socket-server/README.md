# Socket Server

This service provides the Yjs WebSocket backend for LaTeCH. It is based on
`y-websocket`, but adds a Latech-specific authorization check before a client
may join a document room.

## What it does

- accepts WebSocket connections for collaborative editing
- authorizes each connection through the API
- optionally sends debounced document updates back to the API

## Local start

Install dependencies:

```sh
npm install
```

Start the server:

```powershell
$env:HOST="localhost"
$env:PORT="3000"
$env:API_INTERNAL_URL="http://localhost:5001"
$env:INTERNAL_AUTH_SECRET="d1994d751e106da55475cc5aadfb3e742b2c849bdb961b420a934e094108965f"
npm start
```

To enable document persistence callbacks as well:

```powershell
$env:CALLBACK_URL="http://localhost:5001/api/document/callback"
$env:CALLBACK_OBJECT_NAME="latech"
npm start
```

## Docker

The Dockerfile already defines these defaults for local development:

```txt
HOST=0.0.0.0
PORT=3000
API_INTERNAL_URL=http://api:5001
INTERNAL_AUTH_SECRET=d1994d751e106da55475cc5aadfb3e742b2c849bdb961b420a934e094108965f
```

Build and run:

```sh
docker build -t latech-socket-server .
docker run -p 3000:3000 latech-socket-server
```

In the repository `compose.yml`, the socket server talks to the API service as
`http://api:5001`.

## Environment variables

| Variable | Required | Default | Description |
|---|---:|---|---|
| `HOST` | No | `localhost` | Bind host |
| `PORT` | No | `3000` | Bind port |
| `API_INTERNAL_URL` | No | `http://localhost:5001` | Base URL of the API used for WebSocket authorization |
| `INTERNAL_AUTH_SECRET` | Yes | none | Shared secret between API and socket server |
| `CALLBACK_URL` | No | none | API endpoint for document persistence callbacks |
| `CALLBACK_OBJECT_NAME` | Yes, if callback is enabled | none | Yjs text object that should be persisted |
| `CALLBACK_TIMEOUT` | No | `5000` | Callback HTTP timeout in ms |
| `CALLBACK_DEBOUNCE_WAIT` | No | `2000` | Debounce wait in ms |
| `CALLBACK_DEBOUNCE_MAXWAIT` | No | `10000` | Maximum debounce wait in ms |

## WebSocket authorization

Before a client joins a room, the server calls:

```txt
POST /internal/document/{documentId}/authorize-ws
```

It forwards the browser cookies and the `X-Internal-Secret` header to the API.
If the API does not return `200`, the WebSocket upgrade is rejected.

The shared secret must match the API configuration:

```properties
latech.internal.auth-secret=${LATECH_INTERNAL_AUTH_SECRET:d1994d751e106da55475cc5aadfb3e742b2c849bdb961b420a934e094108965f}
```

## Callback payload

If `CALLBACK_URL` is configured, the server sends updates in this shape:

```json
{
  "room": "DOCUMENT_ID",
  "data": "..."
}
```

The request also includes `X-Internal-Secret`.

## License

[The MIT License](./LICENSE) Copyright Kevin Jahns
