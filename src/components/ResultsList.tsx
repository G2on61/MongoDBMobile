import type { ReactNode } from 'react'
import { downloadCsv } from '../lib/export.ts'
import type { JsonObject } from '../types.ts'
import { DocumentCard } from './DocumentCard.tsx'

interface ResultsListProps {
  eyebrow: string
  title: string
  countLabel: string
  durationMs?: number | null
  documents: JsonObject[]
  loading: boolean
  error?: string | null
  emptyMessage: string
  database: string
  collection: string
  onOpen: (document: JsonObject) => void
  footer?: ReactNode
}

export function ResultsList({
  eyebrow,
  title,
  countLabel,
  durationMs,
  documents,
  loading,
  error,
  emptyMessage,
  database,
  collection,
  onOpen,
  footer,
}: ResultsListProps) {
  return (
    <section className="panel results">
      <div className="panel-header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <div className="header-actions">
          <span className="pill">{countLabel}</span>
          {durationMs !== undefined && durationMs !== null && (
            <span className="pill">{durationMs} ms</span>
          )}
          <button
            type="button"
            className="button secondary compact"
            onClick={() => downloadCsv(documents, `${database}-${collection}`)}
            disabled={documents.length === 0}
          >
            CSV ↓
          </button>
        </div>
      </div>
      {error && <p className="empty error-text">{error}</p>}
      {!error && loading && (
        <p className="empty" role="status" aria-live="polite">
          Chargement…
        </p>
      )}
      {!error && !loading && documents.length === 0 && (
        <p className="empty">{emptyMessage}</p>
      )}
      <div className="documents">
        {documents.map((document, index) => (
          <DocumentCard
            key={String(document._id ?? index)}
            document={document}
            onOpen={onOpen}
          />
        ))}
      </div>
      {footer}
    </section>
  )
}
