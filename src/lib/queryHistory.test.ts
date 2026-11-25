import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { QueryEntry } from '../types.ts'
import { loadHistory, pushHistory } from './queryHistory.ts'

const store = new Map<string, string>()

const query = { filter: '{"plan":"pro"}', sort: '{}', limit: 25, skip: 0 }

function entry(id: string): QueryEntry {
  return {
    id,
    connectionId: 'demo',
    database: 'shop',
    collection: 'users',
    query: { ...query, skip: Number(id.slice(1)) },
    createdAt: Date.parse('2026-04-01T00:00:00.000Z'),
  }
}

beforeEach(() => {
  store.clear()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
  })
})

describe('queryHistory', () => {
  it('retourne une liste vide sans historique', () => {
    expect(loadHistory()).toEqual([])
  })

  it('conserve au maximum 10 entrées', () => {
    let entries: QueryEntry[] = []
    for (let index = 0; index < 14; index += 1) {
      entries = pushHistory(entries, entry(`e${index}`))
    }
    expect(entries).toHaveLength(10)
    expect(entries[0].id).toBe('e13')
    expect(loadHistory()[0].id).toBe('e13')
  })

  it('remplace une entrée identique sans doublon', () => {
    const first = pushHistory([], entry('a'))
    const second = pushHistory(first, entry('b'))
    expect(second).toHaveLength(1)
    expect(second[0].id).toBe('b')
  })

  it('ignore les entrées corrompues', () => {
    store.set('mongodbmobile.query-history.v1', '[{"id":"x"},42]')
    expect(loadHistory()).toEqual([])
  })
})
