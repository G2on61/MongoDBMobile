import { prettyJson } from '../lib/query.ts'
import type { JsonValue } from '../types.ts'

interface JsonViewProps {
  value: JsonValue
}

export function JsonView({ value }: JsonViewProps) {
  return (
    <pre className="json-view">
      <code>{prettyJson(value)}</code>
    </pre>
  )
}
