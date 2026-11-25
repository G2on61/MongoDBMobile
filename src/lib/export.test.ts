import { describe, expect, it } from 'vitest'
import { toCsv } from './export.ts'

describe('toCsv', () => {
  it('génère un en-tête union des clés', () => {
    const csv = toCsv([
      { _id: 'a', name: 'Amina' },
      { _id: 'b', score: 42 },
    ])
    const [header, first, second] = csv.split('\r\n')
    expect(header).toBe('"_id","name","score"')
    expect(first).toBe('"a","Amina",""')
    expect(second).toBe('"b","","42"')
  })

  it('échappe les guillemets et sérialise les objets', () => {
    const csv = toCsv([{ _id: 'c', note: 'il a dit "salut"', meta: { vip: true } }])
    expect(csv).toContain('"il a dit ""salut"""')
    expect(csv).toContain('"{""vip"":true}"')
  })

  it('retourne une chaîne vide sans document', () => {
    expect(toCsv([])).toBe('')
  })
})
