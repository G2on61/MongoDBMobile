import { describe, expect, it } from 'vitest'
import { serialize } from './serialize.js'

describe('serialize', () => {
  it('convertit les dates en ISO', () => {
    expect(serialize({ at: new Date('2026-04-01T00:00:00.000Z') })).toEqual({
      at: '2026-04-01T00:00:00.000Z',
    })
  })

  it('convertit les types BSON en chaînes', () => {
    const objectId = { _bsontype: 'ObjectId', toString: () => '64b7f0000000000000000001' }
    expect(serialize({ _id: objectId })).toEqual({ _id: '64b7f0000000000000000001' })
  })

  it('gère récursivement tableaux et objets', () => {
    const value = { list: [{ n: 1 }, new Date('2026-01-01T00:00:00.000Z')] }
    expect(serialize(value)).toEqual({ list: [{ n: 1 }, '2026-01-01T00:00:00.000Z'] })
  })

  it('transforme undefined en null', () => {
    expect(serialize({ x: undefined })).toEqual({ x: null })
  })
})
