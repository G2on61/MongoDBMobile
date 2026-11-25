export function readConnections(env = process.env) {
  const connections = []

  if (env.MONGODB_CONNECTIONS) {
    try {
      const parsed = JSON.parse(env.MONGODB_CONNECTIONS)
      const items = Array.isArray(parsed) ? parsed : [parsed]
      for (const item of items) {
        if (
          item &&
          typeof item === 'object' &&
          typeof item.id === 'string' &&
          item.id.length > 0 &&
          typeof item.uri === 'string' &&
          item.uri.length > 0
        ) {
          connections.push({
            id: item.id,
            name: typeof item.name === 'string' ? item.name : item.id,
            uri: item.uri,
          })
        }
      }
    } catch {
      console.warn('MONGODB_CONNECTIONS n’est pas un JSON valide')
    }
  }

  if (env.MONGODB_URI) {
    connections.unshift({
      id: 'default',
      name: 'MongoDB',
      uri: env.MONGODB_URI,
    })
  }

  const seen = new Set()
  return connections.filter((connection) => {
    if (seen.has(connection.id)) {
      return false
    }
    seen.add(connection.id)
    return true
  })
}

export function publicConnections(connections) {
  return connections.map(({ id, name }) => ({ id, name, kind: 'gateway' }))
}
