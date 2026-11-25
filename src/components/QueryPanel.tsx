import { useState } from 'react'
import { copyText } from '../lib/clipboard.ts'
import type { QueryInput } from '../types.ts'

interface QueryPanelProps {
  query: QueryInput
  onChange: (query: QueryInput) => void
  onRun: () => void
  onSave: () => void
  canSave: boolean
  running: boolean
}

const FILTER_EXAMPLES = ['{"plan":"pro"}', '{"score":{"$gte":70}}', '{"city":{"$regex":"da"}}']
const SORT_EXAMPLES = ['{"score":-1}', '{"name":1}']

export function QueryPanel({
  query,
  onChange,
  onRun,
  onSave,
  canSave,
  running,
}: QueryPanelProps) {
  const [copied, setCopied] = useState(false)

  const copyFilter = async () => {
    const ok = await copyText(query.filter.trim() || '{}')
    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <section className="panel query-panel" aria-label="Éditeur de requête">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Lecture seule</p>
          <h2>Requête</h2>
        </div>
        <span className="pill green">find()</span>
      </div>

      <label className="field">
        <span>Filtre (JSON)</span>
        <textarea
          value={query.filter}
          onChange={(event) => onChange({ ...query, filter: event.target.value })}
          rows={3}
          spellCheck={false}
          aria-label="Filtre JSON"
        />
      </label>
      <div className="chips">
        {FILTER_EXAMPLES.map((example) => (
          <button
            type="button"
            key={example}
            className="chip small"
            onClick={() => onChange({ ...query, filter: example })}
          >
            {example}
          </button>
        ))}
        <button type="button" className="chip small" onClick={copyFilter}>
          {copied ? 'Copié ✓' : 'Copier'}
        </button>
      </div>

      <label className="field">
        <span>Tri (JSON)</span>
        <textarea
          value={query.sort}
          onChange={(event) => onChange({ ...query, sort: event.target.value })}
          rows={2}
          spellCheck={false}
          aria-label="Tri JSON"
        />
      </label>
      <div className="chips">
        {SORT_EXAMPLES.map((example) => (
          <button
            type="button"
            key={example}
            className="chip small"
            onClick={() => onChange({ ...query, sort: example })}
          >
            {example}
          </button>
        ))}
      </div>

      <div className="field-row">
        <label className="field">
          <span>Limite</span>
          <input
            type="number"
            min={1}
            max={100}
            value={query.limit}
            onChange={(event) => onChange({ ...query, limit: Number(event.target.value) })}
          />
        </label>
        <label className="field">
          <span>Décalage</span>
          <input
            type="number"
            min={0}
            value={query.skip}
            onChange={(event) => onChange({ ...query, skip: Number(event.target.value) })}
          />
        </label>
      </div>

      <div className="actions">
        <button type="button" className="button primary" onClick={onRun} disabled={running}>
          {running ? 'Exécution…' : 'Exécuter'}
        </button>
        <button type="button" className="button secondary" onClick={onSave} disabled={!canSave}>
          Enregistrer
        </button>
      </div>
      <p className="hint">
        Opérateurs : $eq, $ne, $gt, $gte, $lt, $lte, $in, $nin, $exists, $regex, $contains, $or,
        $and.
      </p>
    </section>
  )
}
