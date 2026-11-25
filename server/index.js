import { createServer } from 'node:http'
import { demoDatabases, getDemoCollections, getDemoDocuments } from '../src/data/demoData.ts'
import { applyQuery, normalizeQuery, parseJsonObject } from '../src/lib/query.ts'
import { publicConnections, readConnections } from './config.js'
import { serialize } from './serialize.js'

const PORT = Number(process.env.PORT ?? 8787)
const connections = readConnections()
const clients = new Map()
const FORBIDDEN_OPERATORS = new Set(['$where', '$function', '$accumulator'])

function send(response, status, payload) {
  const body = JSON.stringify(payload)
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'content-type, x-connection-id',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  })
  response.end(body)
}

function assertReadOnly(value) {
  if (Array.isArray(value)) {
    for (const item of value) {
      assertReadOnly(item)
    }
    return
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (FORBIDDEN_OPERATORS.has(key)) {
        throw new Error(`Opérateur interdit : ${key}`)
      }
      assertReadOnly(child)
    }
  }
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''
    request.on('data', (chunk) => {
      body += chunk
      if (body.length > 64_000) {
        reject(new Error('Requête trop volumineuse'))
        request.destroy()
      }
    })
    request.on('end', () => resolve(body))
    request.on('error', reject)
  })
}

async function getClient(connectionId) {
  const connection =
    connections.find((item) => item.id === connectionId) ?? connections[0]

  if (!connection) {
    return null
  }

  if (!clients.has(connection.id)) {
    const { MongoClient } = await import('mongodb')
    clients.set(connection.id, new MongoClient(connection.uri).connect())
  }

  return clients.get(connection.id)
}

async function listDatabases(connectionId) {
  const client = await getClient(connectionId)
  if (!client) {
    return demoDatabases
  }
  const result = await client.db().admin().listDatabases()
  return result.databases
    .map((item) => item.name)
    .filter((name) => !['admin', 'config', 'local'].includes(name))
    .sort()
}

async function listCollections(database, connectionId) {
  const client = await getClient(connectionId)
  if (!client) {
    return getDemoCollections(database)
  }
  const result = await client.db(database).listCollections().toArray()
  return result.map((item) => item.name).sort()
}

async function findDocuments(payload) {
  const { database, collection } = payload
  const query = normalizeQuery(payload)
  const filter = parseJsonObject(query.filter, 'Filtre')
  const sort = parseJsonObject(query.sort, 'Tri')
  assertReadOnly({ filter, sort })

  const client = await getClient(payload.connectionId ?? '')
  if (!client) {
    return applyQuery(getDemoDocuments(database, collection), query)
  }

  const documents = await client
    .db(database)
    .collection(collection)
    .find(filter)
    .sort(sort)
    .skip(query.skip)
    .limit(query.limit)
    .toArray()

  return {
    documents: serialize(documents),
    total: await client.db(database).collection(collection).countDocuments(filter),
    skip: query.skip,
    limit: query.limit,
  }
}

const server = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    send(response, 204, {})
    return
  }

  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`)

  try {
    if (request.method === 'GET' && url.pathname === '/api/health') {
      send(response, 200, {
        ok: true,
        mode: connections.length > 0 ? 'mongodb' : 'demo',
      })
      return
    }

    if (request.method === 'GET' && url.pathname === '/api/connections') {
      send(response, 200, publicConnections(connections))
      return
    }

    if (request.method === 'GET' && url.pathname === '/api/databases') {
      send(response, 200, await listDatabases(request.headers['x-connection-id']))
      return
    }

    if (request.method === 'GET' && url.pathname === '/api/collections') {
      const database = url.searchParams.get('database') ?? ''
      if (!database) {
        send(response, 400, { error: 'Paramètre database manquant' })
        return
      }
      send(response, 200, await listCollections(database, request.headers['x-connection-id']))
      return
    }

    if (request.method === 'POST' && url.pathname === '/api/find') {
      const raw = await readBody(request)
      const payload = JSON.parse(raw)
      if (
        !payload ||
        typeof payload.database !== 'string' ||
        typeof payload.collection !== 'string' ||
        !payload.database ||
        !payload.collection
      ) {
        send(response, 400, { error: 'database et collection sont requis' })
        return
      }
      const header = request.headers['x-connection-id']
      payload.connectionId = Array.isArray(header) ? header[0] : header
      send(response, 200, await findDocuments(payload))
      return
    }

    send(response, 404, { error: 'Route inconnue' })
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Erreur inconnue'
    const status = message.includes('JSON') || message.includes('interdit') ? 400 : 500
    send(response, status, { error: status === 500 ? 'Erreur interne du gateway' : message })
  }
})

server.listen(PORT, () => {
  const mode = connections.length > 0 ? 'mongodb' : 'demo'
  console.log(`MongoDBMobile gateway sur http://localhost:${PORT} (mode ${mode})`)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    server.close()
    await Promise.all([...clients.values()].map((promise) => promise.then((client) => client.close())))
    process.exit(0)
  })
}
