import { describe, expect, it } from 'vitest'
import type { JsonObject } from '../types.ts'
import { applyQuery, normalizeQuery, parseJsonObject, sortDocuments } from './query.ts'

const documents: JsonObject[] = [
  { _id: 'a', name: 'Amina', score: 92, city: 'Dakar', tags: ['vip'] },
  { _id: 'b', name: 'Lucas', score: 41, city: 'Lyon', tags: [] },
  { _id: 'c', name: 'Sofia', score: 78, city: 'Casablanca', tags: ['vip', 'beta'] },
]

const baseQuery = { filter: '{}', sort: '{}', limit: 25, skip: 0 }

describe('parseJsonObject', () => {
  it('accepte un objet JSON', () => {
    expect(parseJsonObject('{"score": 10}', 'Filtre')).toEqual({ score: 10 })
  })

  it('considère une entrée vide comme un filtre vide', () => {
    expect(parseJsonObject('  ', 'Tri')).toEqual({})
  })

  it('rejette un tableau et un JSON invalide', () => {
    expect(() => parseJsonObject('[1,2]', 'Filtre')).toThrow('objet JSON')
    expect(() => parseJsonObject('{oops', 'Filtre')).toThrow('JSON invalide')
  })
})

describe('applyQuery', () => {
  it('filtre avec les comparateurs', () => {
    const result = applyQuery(documents, {
      ...baseQuery,
      filter: '{"score":{"$gte":70}}',
    })
    expect(result.total).toBe(2)
    expect(result.documents.map((doc) => doc._id)).toEqual(['a', 'c'])
  })

  it('gère $in, $contains et $or', () => {
    expect(
      applyQuery(documents, {
        ...baseQuery,
        filter: '{"$or":[{"city":{"$in":["Lyon"]}},{"tags":{"$contains":"vip"}}]}',
      }).total,
    ).toBe(3)
  })

  it('trie et pagine', () => {
    const result = applyQuery(documents, {
      ...baseQuery,
      filter: '{}',
      sort: '{"score":-1}',
      limit: 2,
      skip: 1,
    })
    expect(result.documents.map((doc) => doc._id)).toEqual(['c', 'b'])
    expect(result.total).toBe(3)
  })

  it('rejette un tri invalide', () => {
    expect(() => sortDocuments(documents, { score: 1 as never })).not.toThrow()
    expect(() =>
      applyQuery(documents, { ...baseQuery, sort: '{"score":"desc"}' }),
    ).toThrow('1 (ascendant)')
  })
})

describe('opérateurs avancés', () => {
  it('gère $ne et $lt', () => {
    const result = applyQuery(documents, {
      ...baseQuery,
      filter: '{"city":{"$ne":"Lyon"},"score":{"$lt":80}}',
    })
    expect(result.documents.map((doc) => doc._id)).toEqual(['c'])
  })

  it('gère $nin et $exists', () => {
    expect(
      applyQuery(documents, { ...baseQuery, filter: '{"tags":{"$nin":["vip"]}}' }).total,
    ).toBe(1)
    expect(
      applyQuery(documents, { ...baseQuery, filter: '{"city":{"$exists":true}}' }).total,
    ).toBe(3)
  })

  it('gère $regex et $and', () => {
    const result = applyQuery(documents, {
      ...baseQuery,
      filter: '{"$and":[{"name":{"$regex":"^A"}},{"score":{"$gt":80}}]}',
    })
    expect(result.documents.map((doc) => doc._id)).toEqual(['a'])
  })

  it('rejette un opérateur inconnu', () => {
    expect(() =>
      applyQuery(documents, { ...baseQuery, filter: '{"score":{"$unknown":1}}' }),
    ).toThrow('Opérateur non pris en charge')
  })
})

describe('normalizeQuery', () => {
  it('borne la limite et le décalage', () => {
    expect(normalizeQuery({ ...baseQuery, limit: 500, skip: -4 })).toMatchObject({
      limit: 100,
      skip: 0,
    })
  })
})
