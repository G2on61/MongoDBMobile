import type { QueryEntry } from '../types.ts'

const STORAGE_KEY = 'mongodbmobile.query-history.v1'
const MAX_ENTRIES = 10

function isQueryEntry(value: unknown): value is QueryEntry {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const entry = value as Partial<QueryEntry>
  return (
    typeof entry.id === 'string' &&
    typeof entry.connectionId === 'string' &&
    typeof entry.database === 'string' &&
    typeof entry.collection === 'string' &&
    typeof entry.query === 'object' &&
    entry.query !== null &&
    typeof entry.createdAt === 'number'
  )
}

export function loadHistory(): QueryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isQueryEntry).slice(0, MAX_ENTRIES) : []
  } catch {
    return []
  }
}

export function pushHistory(entries: QueryEntry[], entry: QueryEntry): QueryEntry[] {
  const signature = JSON.stringify({
    connectionId: entry.connectionId,
    database: entry.database,
    collection: entry.collection,
    query: entry.query,
  })

  const next = [
    entry,
    ...entries.filter((previous) => {
      const previousSignature = JSON.stringify({
        connectionId: previous.connectionId,
        database: previous.database,
        collection: previous.collection,
        query: previous.query,
      })
      return previousSignature !== signature
    }),
  ].slice(0, MAX_ENTRIES)

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    return next
  }

  return next
}
