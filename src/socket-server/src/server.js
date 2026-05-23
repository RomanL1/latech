#!/usr/bin/env node

import WebSocket from 'ws'
import http from 'http'
import * as number from 'lib0/number'
import { setupWSConnection } from './utils.js'

const wss = new WebSocket.Server({ noServer: true })
const host = process.env.HOST || 'localhost'
const port = number.parseInt(process.env.PORT || '3000')

const API_INTERNAL_URL = process.env.API_INTERNAL_URL || 'http://localhost:5001'
const INTERNAL_AUTH_SECRET = process.env.INTERNAL_AUTH_SECRET || ''

const server = http.createServer((_request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('okay')
})

wss.on('connection', setupWSConnection)

server.on('upgrade', async (request, socket, head) => {
  const documentId = getDocumentIdFromRequest(request)

  if (!documentId) {
    rejectSocket(socket, 400, 'Bad Request')
    return
  }

  const authorized = await authorizeDocumentSocket(request, documentId)

  if (!authorized) {
    rejectSocket(socket, 401, 'Unauthorized')
    return
  }

  wss.handleUpgrade(request, socket, head, /** @param {any} ws */ ws => {
    wss.emit('connection', ws, request)
    console.log('new connection to', request.url)
  })
})

/**
 * @param {import('http').IncomingMessage} request
 */
const getDocumentIdFromRequest = request => {
  const rawUrl = request.url || ''

  const path = rawUrl.split('?')[0]
  const parts = path.split('/').filter(Boolean)

  return parts[parts.length - 1] || null
}

/**
 * @param {import('http').IncomingMessage} request
 * @param {string} documentId
 */
const authorizeDocumentSocket = async (request, documentId) => {
  if (!INTERNAL_AUTH_SECRET) {
    console.error('INTERNAL_AUTH_SECRET is not configured')
    return false
  }

  const cookieHeader = request.headers.cookie || ''

  try {
    const response = await fetch(
        `${API_INTERNAL_URL}/internal/document/${encodeURIComponent(documentId)}/authorize-ws`,
        {
          method: 'POST',
          headers: {
            Cookie: cookieHeader,
            'X-Internal-Secret': INTERNAL_AUTH_SECRET
          }
        }
    )

    if (!response.ok) {
      console.warn(
          `WS auth failed for document ${documentId}: ${response.status} ${response.statusText}`
      )
      return false
    }

    return true
  } catch (error) {
    console.error('WS auth request failed', error)
    return false
  }
}

/**
 * @param {import('net').Socket} socket
 * @param {number} status
 * @param {string} message
 */
const rejectSocket = (socket, status, message) => {
  socket.write(`HTTP/1.1 ${status} ${message}\r\n\r\n`)
  socket.destroy()
}

server.listen(port, host, () => {
  console.log(`running at '${host}' on port ${port}`)
})