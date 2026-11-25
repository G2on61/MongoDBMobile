import { useEffect, useState } from 'react'
import type { JsonObject } from '../types.ts'
import { JsonView } from './JsonView.tsx'

interface DocumentSheetProps {
  document: JsonObject | null
  onClose: () => void
}

export function DocumentSheet({ document, onClose }: DocumentSheetProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!document) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [document, onClose])

  if (!document) {
    return null
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(document, null, 2))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <section
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Détail du document"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-handle" />
        <header className="sheet-header">
          <div>
            <p className="eyebrow">Document</p>
            <h2>{String(document._id ?? 'Sans identifiant')}</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Fermer"
            autoFocus
          >
            ✕
          </button>
        </header>
        <JsonView value={document} />
        <button type="button" className="button primary full" onClick={copy}>
          {copied ? 'Copié ✓' : 'Copier le JSON'}
        </button>
      </section>
    </div>
  )
}
