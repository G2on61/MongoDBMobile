import { getDemoCollections, getDemoDocuments, demoDatabases } from '../data/demoData.ts'
import { applyQuery, normalizeQuery } from './query.ts'
import type {
  ConnectionInfo,
  DocumentPage,
  MongoRepository,
  QueryInput,
} from '../types.ts'

export const DEMO_CONNECTION: ConnectionInfo = {
  id: 'demo',
  name: 'Démo · données d’exemple',
  kind: 'demo',
}

export function createDemoRepository(): MongoRepository {
  return {
    async listDatabases() {
      return demoDatabases
    },
    async listCollections(database: string) {
      return getDemoCollections(database)
    },
    async findDocuments(
      database: string,
      collection: string,
      query: QueryInput,
    ): Promise<DocumentPage> {
      return applyQuery(getDemoDocuments(database, collection), query)
    },
  }
}

async function request<T>(
  path: string,
  connectionId: string,
  init?: RequestInit,
  baseUrl = '/api',
): Promise<T> {
  const headers = new Headers(init?.headers)
  headers.set('X-Connection-Id', connectionId)
  headers.set('Content-Type', 'application/json')

  const response = await fetch(`${baseUrl}${path}`, { ...init, headers })

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null)
    const message =
      typeof payload === 'object' && payload !== null && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : `Erreur HTTP ${response.status}`
    throw new Error(message)
  }

  return (await response.json()) as T
}

export function createGatewayRepository(
  connectionId: string,
  baseUrl = '/api',
): MongoRepository {
  return {
    listDatabases: () => request<string[]>('/databases', connectionId, undefined, baseUrl),
    listCollections: (database: string) =>
      request<string[]>(
        `/collections?database=${encodeURIComponent(database)}`,
        connectionId,
        undefined,
        baseUrl,
      ),
    findDocuments: (
      database: string,
      collection: string,
      query: QueryInput,
    ): Promise<DocumentPage> =>
      request<DocumentPage>(
        '/find',
        connectionId,
        {
          method: 'POST',
          body: JSON.stringify({
            database,
            collection,
            ...normalizeQuery(query),
          }),
        },
        baseUrl,
      ),
  }
}

export async function checkGateway(baseUrl = '/api'): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/health`)
    return response.ok
  } catch {
    return false
  }
}

export async function fetchGatewayVersion(baseUrl = '/api'): Promise<string | null> {
  try {
    const response = await fetch(`${baseUrl}/version`)
    if (!response.ok) {
      return null
    }
    const payload: unknown = await response.json()
    if (typeof payload !== 'object' || payload === null || !('version' in payload)) {
      return null
    }
    const version = (payload as { version: unknown }).version
    return typeof version === 'string' ? version : null
  } catch {
    return null
  }
}

export async function fetchGatewayConnections(baseUrl = '/api'): Promise<ConnectionInfo[]> {
  try {
    const response = await fetch(`${baseUrl}/connections`)
    if (!response.ok) {
      return []
    }
    const payload: unknown = await response.json()
    if (!Array.isArray(payload)) {
      return []
    }
    return payload.filter(
      (item): item is ConnectionInfo =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as ConnectionInfo).id === 'string' &&
        typeof (item as ConnectionInfo).name === 'string' &&
        (item as ConnectionInfo).kind === 'gateway',
    )
  } catch {
    return []
  }
}
