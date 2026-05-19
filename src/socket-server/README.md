# Socket Server

Yjs WebSocket backend for LaTeCH. This service accepts collaboration
connections, authorizes them through the API, and can send document updates
back to the API.

## Local start

```powershell
npm install
$env:HOST="localhost"
$env:PORT="3000"
$env:API_INTERNAL_URL="http://localhost:5001"
$env:INTERNAL_AUTH_SECRET="changeme"
npm start
```

Local start with callbacks:

```powershell
$env:HOST="localhost"
$env:PORT="3000"
$env:API_INTERNAL_URL="http://localhost:5001"
$env:INTERNAL_AUTH_SECRET="changeme"
$env:CALLBACK_URL="http://localhost:5001/api/document/callback"
$env:CALLBACK_OBJECT_NAME="latech"
npm start
```

## Docker / Compose

Current repo defaults:

- Dockerfile sets `HOST=0.0.0.0`, `PORT=3000`, `API_INTERNAL_URL=http://api:5001`
- `compose.yml` sets `API_INTERNAL_URL=http://api:5001`
- `compose.yml` sets `INTERNAL_AUTH_SECRET=changeme`
- `compose.yml` enables callbacks with `CALLBACK_URL=http://api:5001/api/document/callback`

In Compose, `http://api:5001` works because `api` is the service name on the
Docker network.

Build manually:

```sh
docker build -t latech-socket-server .
docker run -p 3000:3000 \
  -e API_INTERNAL_URL=http://host.docker.internal:5001 \
  -e INTERNAL_AUTH_SECRET=changeme \
  latech-socket-server
```

If you also want callbacks outside Compose:

```sh
docker run -p 3000:3000 \
  -e API_INTERNAL_URL=http://host.docker.internal:5001 \
  -e INTERNAL_AUTH_SECRET=changeme \
  -e CALLBACK_URL=http://host.docker.internal:5001/api/document/callback \
  -e CALLBACK_OBJECT_NAME=latech \
  latech-socket-server
```

## Environment variables

| Variable | Required | Default | Description |
|---|---:|---|---|
| `HOST` | No | `localhost` | Bind host |
| `PORT` | No | `3000` | Bind port |
| `API_INTERNAL_URL` | No | `http://localhost:5001` | API base URL used for WebSocket authorization |
| `INTERNAL_AUTH_SECRET` | Yes | empty | Shared secret used for WebSocket auth and callbacks |
| `CALLBACK_URL` | No | none | API endpoint for document persistence callbacks |
| `CALLBACK_OBJECT_NAME` | Yes, if callback is enabled | none | Yjs text object to persist |
| `CALLBACK_TIMEOUT` | No | `5000` | Callback timeout in ms |
| `CALLBACK_DEBOUNCE_WAIT` | No | `2000` | Debounce wait in ms |
| `CALLBACK_DEBOUNCE_MAXWAIT` | No | `10000` | Max debounce wait in ms |

## Authorization flow

Before accepting a WebSocket upgrade, the server calls:

```txt
POST /internal/document/{documentId}/authorize-ws
```

It forwards the request cookies together with `X-Internal-Secret`. If the API
does not return `200`, the connection is rejected.

The API uses the same secret via:

```properties
latech.internal.auth-secret=${INTERNAL_AUTH_SECRET:d1994d751e106da55475cc5aadfb3e742b2c849bdb961b420a934e094108965f}
```

## Callback payload

If callbacks are enabled, the server sends:

```json
{
  "room": "DOCUMENT_ID",
  "data": "..."
}
```

The request includes `X-Internal-Secret`.

## License

[The MIT License](./LICENSE) Copyright Kevin Jahns
