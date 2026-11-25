export function serialize(value) {
  if (value === null || value === undefined) {
    return null
  }
  if (value instanceof Date) {
    return value.toISOString()
  }
  if (typeof value !== 'object') {
    return value
  }
  if (typeof value._bsontype === 'string') {
    return value.toString()
  }
  if (Array.isArray(value)) {
    return value.map(serialize)
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, serialize(child)]),
  )
}
