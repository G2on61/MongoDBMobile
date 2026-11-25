import type { DocumentPage, JsonObject, JsonValue, QueryInput } from '../types.ts'

export const DEFAULT_QUERY: QueryInput = {
  filter: '{}',
  sort: '{}',
  limit: 25,
  skip: 0,
}

export function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseJsonObject(input: string, label: string): JsonObject {
  const trimmed = input.trim()
  if (!trimmed) {
    return {}
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    throw new Error(`${label} : JSON invalide`)
  }

  if (!isJsonObject(parsed)) {
    throw new Error(`${label} doit être un objet JSON`)
  }

  return parsed
}

export function normalizeQuery(input: QueryInput): QueryInput {
  const limit = Number.isFinite(input.limit) ? Math.trunc(input.limit) : 25
  const skip = Number.isFinite(input.skip) ? Math.trunc(input.skip) : 0

  return {
    filter: input.filter.trim() || '{}',
    sort: input.sort.trim() || '{}',
    limit: Math.min(Math.max(limit, 1), 100),
    skip: Math.max(skip, 0),
  }
}

function getPath(document: JsonObject, path: string): JsonValue | undefined {
  let current: JsonValue | undefined = document

  for (const key of path.split('.')) {
    if (!isJsonObject(current)) {
      return undefined
    }
    current = current[key]
  }

  return current
}

function matchesCondition(value: JsonValue | undefined, condition: JsonValue): boolean {
  if (!isJsonObject(condition)) {
    return value === condition
  }

  return Object.entries(condition).every(([operator, expected]) => {
    switch (operator) {
      case '$eq':
        return value === expected
      case '$ne':
        return value !== expected
      case '$gt':
        return typeof value === 'number' && typeof expected === 'number' && value > expected
      case '$gte':
        return typeof value === 'number' && typeof expected === 'number' && value >= expected
      case '$lt':
        return typeof value === 'number' && typeof expected === 'number' && value < expected
      case '$lte':
        return typeof value === 'number' && typeof expected === 'number' && value <= expected
      case '$in':
        return Array.isArray(expected) && expected.some((item) => item === value)
      case '$nin':
        return Array.isArray(expected) && expected.every((item) => item !== value)
      case '$exists':
        return (value !== undefined) === Boolean(expected)
      case '$contains':
        return Array.isArray(value) && value.some((item) => item === expected)
      case '$regex': {
        if (typeof expected !== 'string' || typeof value !== 'string') {
          return false
        }
        try {
          return new RegExp(expected, 'i').test(value)
        } catch {
          throw new Error(`Regex invalide : ${expected}`)
        }
      }
      default:
        throw new Error(`Opérateur non pris en charge : ${operator}`)
    }
  })
}

export function matchesDocument(document: JsonObject, filter: JsonObject): boolean {
  return Object.entries(filter).every(([key, condition]) => {
    if (key === '$or' && Array.isArray(condition)) {
      return condition.some((item) => isJsonObject(item) && matchesDocument(document, item))
    }
    if (key === '$and' && Array.isArray(condition)) {
      return condition.every((item) => isJsonObject(item) && matchesDocument(document, item))
    }
    return matchesCondition(getPath(document, key), condition)
  })
}

function compareValues(left: JsonValue | undefined, right: JsonValue | undefined): number {
  if (left === undefined && right === undefined) {
    return 0
  }
  if (left === undefined) {
    return 1
  }
  if (right === undefined) {
    return -1
  }
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right
  }
  return String(left).localeCompare(String(right))
}

export function sortDocuments(documents: JsonObject[], sort: JsonObject): JsonObject[] {
  const entries = Object.entries(sort)

  for (const [, direction] of entries) {
    if (direction !== 1 && direction !== -1) {
      throw new Error('Le tri accepte uniquement les valeurs 1 (ascendant) ou -1 (descendant)')
    }
  }

  if (entries.length === 0) {
    return documents
  }

  return [...documents].sort((left, right) => {
    for (const [path, direction] of entries) {
      const result = compareValues(getPath(left, path), getPath(right, path))
      if (result !== 0) {
        return direction === 1 ? result : -result
      }
    }
    return 0
  })
}

export function applyQuery(documents: JsonObject[], input: QueryInput): DocumentPage {
  const query = normalizeQuery(input)
  const filter = parseJsonObject(query.filter, 'Filtre')
  const sort = parseJsonObject(query.sort, 'Tri')

  const filtered = documents.filter((document) => matchesDocument(document, filter))
  const sorted = sortDocuments(filtered, sort)

  return {
    documents: sorted.slice(query.skip, query.skip + query.limit),
    total: filtered.length,
    skip: query.skip,
    limit: query.limit,
  }
}

export function prettyJson(value: JsonValue): string {
  return JSON.stringify(value, null, 2)
}
