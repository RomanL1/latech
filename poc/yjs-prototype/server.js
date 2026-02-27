import WebSocket from 'ws'
import http from 'http'
import { setupWSConnection } from 'y-websocket/bin/utils'

const port = process.env.PORT || 1234
const host = process.env.HOST || '$$IP$$'

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('okay')
})

const wss = new WebSocket.Server({ server })

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req)
})

server.listen(port, host, () => {
  console.log(`running at '${host}' on port ${port}`)
})
