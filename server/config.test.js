import { describe, expect, it } from 'vitest'
import { publicConnections, readConnections } from './config.js'

describe('readConnections', () => {
  it('retourne une liste vide sans configuration', () => {
    expect(readConnections({})).toEqual([])
  })

  it('accepte MONGODB_URI', () => {
    expect(readConnections({ MONGODB_URI: 'mongodb://localhost:27017' })).toEqual([
      { id: 'default', name: 'MongoDB', uri: 'mongodb://localhost:27017' },
    ])
  })

  it('accepte plusieurs connexions JSON et ignore les entrées invalides', () => {
    const connections = readConnections({
      MONGODB_CONNECTIONS: JSON.stringify([
        { id: 'prod', name: 'Production', uri: 'mongodb+srv://...' },
        { id: 'bad' },
        { id: '', uri: 'mongodb://localhost' },
      ]),
    })
    expect(connections).toHaveLength(1)
    expect(connections[0].id).toBe('prod')
  })

  it('déduplique les identifiants', () => {
    const connections = readConnections({
      MONGODB_URI: 'mongodb://localhost:27017',
      MONGODB_CONNECTIONS: JSON.stringify([
        { id: 'default', uri: 'mongodb://other:27017' },
      ]),
    })
    expect(connections).toHaveLength(1)
  })

  it('expose les connexions sans URI', () => {
    expect(
      publicConnections([{ id: 'prod', name: 'Production', uri: 'secret' }]),
    ).toEqual([{ id: 'prod', name: 'Production', kind: 'gateway' }])
  })
})
