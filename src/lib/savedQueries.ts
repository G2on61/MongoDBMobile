import type { SavedQuery } from '../types.ts'

const STORAGE_KEY = 'mongodbmobile.saved-queries.v1'

export function loadSavedQueries(): SavedQuery[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter(
      (item): item is SavedQuery =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as SavedQuery).id === 'string' &&
        typeof (item as SavedQuery).name === 'string' &&
        typeof (item as SavedQuery).connectionId === 'string' &&
        typeof (item as SavedQuery).database === 'string' &&
        typeof (item as SavedQuery).collection === 'string' &&
        typeof (item as SavedQuery).query === 'object',
    )
  } catch {
    return []
  }
}

export function persistSavedQueries(queries: SavedQuery[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queries))
  } catch {
    return
  }
}
