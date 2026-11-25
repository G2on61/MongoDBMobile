import type { JsonObject, JsonValue } from '../types.ts'

interface DocumentCardProps {
  document: JsonObject
  onOpen: (document: JsonObject) => void
}

function displayValue(value: JsonValue): string {
  if (typeof value === 'object' && value !== null) {
    const text = JSON.stringify(value)
    return text.length > 42 ? `${text.slice(0, 42)}…` : text
  }
  return String(value)
}

export function DocumentCard({ document, onOpen }: DocumentCardProps) {
  const fields = Object.keys(document)
    .filter((key) => key !== '_id')
    .slice(0, 3)

  return (
    <button
      type="button"
      className="doc-card"
      onClick={() => onOpen(document)}
      aria-label={`Ouvrir le document ${String(document._id ?? 'sans identifiant')}`}
    >
      <span className="doc-id">{String(document._id ?? '—')}</span>
      <span className="doc-fields">
        {fields.map((key) => (
          <span className="doc-field" key={key}>
            <span className="doc-key">{key}</span>
            <span className="doc-value">{displayValue(document[key])}</span>
          </span>
        ))}
      </span>
      <span className="doc-arrow" aria-hidden="true">
        ›
      </span>
    </button>
  )
}
