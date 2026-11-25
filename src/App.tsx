import { useEffect, useMemo, useState } from 'react'
import { DocumentCard } from './components/DocumentCard.tsx'
import { DocumentSheet } from './components/DocumentSheet.tsx'
import { QueryPanel } from './components/QueryPanel.tsx'
import {
  checkGateway,
  createDemoRepository,
  createGatewayRepository,
  DEMO_CONNECTION,
  fetchGatewayConnections,
} from './lib/repository.ts'
import { DEFAULT_QUERY } from './lib/query.ts'
import { loadSavedQueries, persistSavedQueries } from './lib/savedQueries.ts'
import type {
  ConnectionInfo,
  DocumentPage,
  JsonObject,
  QueryInput,
  SavedQuery,
} from './types.ts'

type Tab = 'explore' | 'query' | 'saved'

export default function App() {
  const [connections, setConnections] = useState<ConnectionInfo[]>([DEMO_CONNECTION])
  const [connectionId, setConnectionId] = useState(DEMO_CONNECTION.id)
  const [gatewayOnline, setGatewayOnline] = useState(false)
  const [databases, setDatabases] = useState<string[]>([])
  const [database, setDatabase] = useState('')
  const [collections, setCollections] = useState<string[]>([])
  const [collection, setCollection] = useState('')
  const [query, setQuery] = useState<QueryInput>({ ...DEFAULT_QUERY })
  const [submittedQuery, setSubmittedQuery] = useState<QueryInput>({ ...DEFAULT_QUERY })
  const [page, setPage] = useState<DocumentPage | null>(null)
  const [tab, setTab] = useState<Tab>('explore')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<JsonObject | null>(null)
  const [saved, setSaved] = useState<SavedQuery[]>(() => loadSavedQueries())
  const [saveName, setSaveName] = useState('')

  const repository = useMemo(
    () =>
      connectionId === DEMO_CONNECTION.id
        ? createDemoRepository()
        : createGatewayRepository(connectionId),
    [connectionId],
  )

  const currentConnection =
    connections.find((item) => item.id === connectionId) ?? DEMO_CONNECTION

  useEffect(() => {
    let cancelled = false

    const start = async () => {
      const online = await checkGateway()
      if (cancelled) {
        return
      }
      setGatewayOnline(online)
      if (!online) {
        return
      }
      const remote = await fetchGatewayConnections()
      if (!cancelled && remote.length > 0) {
        setConnections([DEMO_CONNECTION, ...remote])
      }
    }

    void start()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    repository
      .listDatabases()
      .then((items) => {
        if (cancelled) {
          return
        }
        setDatabases(items)
        setDatabase((previous) =>
          previous && items.includes(previous) ? previous : (items[0] ?? ''),
        )
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Impossible de lister les bases')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [repository])

  useEffect(() => {
    let cancelled = false
    if (!database) {
      return
    }

    repository
      .listCollections(database)
      .then((items) => {
        if (cancelled) {
          return
        }
        setCollections(items)
        setCollection((previous) =>
          previous && items.includes(previous) ? previous : (items[0] ?? ''),
        )
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Impossible de lister les collections')
        }
      })

    return () => {
      cancelled = true
    }
  }, [repository, database])

  useEffect(() => {
    let cancelled = false
    if (!database || !collection) {
      return
    }

    repository
      .findDocuments(database, collection, submittedQuery)
      .then((result) => {
        if (!cancelled) {
          setPage(result)
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Requête impossible')
          setPage(null)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [repository, database, collection, submittedQuery])

  const selectDatabase = (name: string) => {
    setDatabase(name)
    setCollection('')
    setCollections([])
    setQuery({ ...DEFAULT_QUERY })
    setSubmittedQuery({ ...DEFAULT_QUERY })
    setPage(null)
    setError(null)
    setLoading(true)
  }

  const selectCollection = (name: string) => {
    setCollection(name)
    setQuery({ ...DEFAULT_QUERY })
    setSubmittedQuery({ ...DEFAULT_QUERY })
    setPage(null)
    setError(null)
    setLoading(true)
  }

  const selectConnection = (id: string) => {
    setConnectionId(id)
    setDatabase('')
    setCollection('')
    setCollections([])
    setPage(null)
    setError(null)
    setLoading(true)
  }

  const runQuery = () => {
    setSubmittedQuery({ ...query })
    setPage(null)
    setError(null)
    setLoading(true)
  }

  const saveQuery = () => {
    if (!database || !collection) {
      return
    }

    const entry: SavedQuery = {
      id: crypto.randomUUID(),
      name: saveName.trim() || `${database}.${collection}`,
      connectionId,
      database,
      collection,
      query: { ...query },
      createdAt: Date.now(),
    }

    setSaved((previous) => {
      const next = [entry, ...previous]
      persistSavedQueries(next)
      return next
    })
    setSaveName('')
    setTab('saved')
  }

  const removeSaved = (id: string) => {
    setSaved((previous) => {
      const next = previous.filter((item) => item.id !== id)
      persistSavedQueries(next)
      return next
    })
  }

  const openSaved = (entry: SavedQuery) => {
    setConnectionId(entry.connectionId)
    setDatabase(entry.database)
    setCollection(entry.collection)
    setQuery({ ...entry.query })
    setSubmittedQuery({ ...entry.query })
    setPage(null)
    setError(null)
    setLoading(true)
    setTab('query')
  }

  const changePage = (direction: -1 | 1) => {
    if (!page) {
      return
    }
    const skip = Math.max(0, page.skip + direction * page.limit)
    setQuery((previous) => ({ ...previous, skip }))
    setSubmittedQuery((previous) => ({ ...previous, skip }))
    setPage(null)
    setError(null)
    setLoading(true)
  }

  const retry = () => {
    setSubmittedQuery({ ...submittedQuery })
    setError(null)
    setLoading(true)
  }

  const documents = page?.documents ?? []

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            ◈
          </span>
          <div>
            <h1>MongoDBMobile</h1>
            <p>Compass dans votre poche</p>
          </div>
        </div>
        <div className="connection-picker">
          <label htmlFor="connection">Connexion</label>
          <select
            id="connection"
            value={connectionId}
            onChange={(event) => selectConnection(event.target.value)}
          >
            {connections.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <span className={`status ${gatewayOnline ? 'online' : 'offline'}`}>
            {currentConnection.kind === 'demo' ? 'Mode démo' : gatewayOnline ? 'Gateway' : 'Hors ligne'}
          </span>
        </div>
      </header>

      <main>
        {error && (
          <div className="banner error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={retry}>
              Réessayer
            </button>
          </div>
        )}
        {gatewayOnline && connections.length === 1 && (
          <div className="banner info" role="status">
            Gateway connecté. Ajoutez MONGODB_URI pour vos propres données.
          </div>
        )}

        {tab === 'explore' && (
          <div className="screen explore">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Serveur</p>
                  <h2>Bases de données</h2>
                </div>
                <span className="pill">{databases.length}</span>
              </div>
              <div className="horizontal-list">
                {databases.map((name) => (
                  <button
                    type="button"
                    key={name}
                    className={`chip ${database === name ? 'active' : ''}`}
                    onClick={() => selectDatabase(name)}
                  >
                    {name}
                  </button>
                ))}
                {databases.length === 0 && !loading && (
                  <p className="empty">Aucune base disponible.</p>
                )}
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">{database || '—'}</p>
                  <h2>Collections</h2>
                </div>
                <span className="pill">{collections.length}</span>
              </div>
              <div className="collection-list">
                {collections.map((name) => (
                  <button
                    type="button"
                    key={name}
                    className={`collection-item ${collection === name ? 'active' : ''}`}
                    onClick={() => selectCollection(name)}
                  >
                    <span className="collection-icon" aria-hidden="true">
                      ▤
                    </span>
                    <span>{name}</span>
                    <span aria-hidden="true">›</span>
                  </button>
                ))}
                {collections.length === 0 && !loading && (
                  <p className="empty">Choisissez une base.</p>
                )}
              </div>
            </section>

            <section className="panel results">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">{collection || '—'}</p>
                  <h2>Documents</h2>
                </div>
                <span className="pill">
                  {page ? `${page.total} trouvé${page.total > 1 ? 's' : ''}` : '—'}
                </span>
              </div>
              {loading && <p className="empty">Chargement…</p>}
              {!loading && documents.length === 0 && (
                <p className="empty">Aucun document à afficher.</p>
              )}
              <div className="documents">
                {documents.map((document, index) => (
                  <DocumentCard
                    key={String(document._id ?? index)}
                    document={document}
                    onOpen={setSelectedDocument}
                  />
                ))}
              </div>
              {page && page.total > page.limit && (
                <div className="pagination">
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => changePage(-1)}
                    disabled={page.skip === 0}
                  >
                    ← Précédent
                  </button>
                  <span>
                    {page.skip + 1}–{Math.min(page.skip + page.limit, page.total)} / {page.total}
                  </span>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => changePage(1)}
                    disabled={page.skip + page.limit >= page.total}
                  >
                    Suivant →
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        {tab === 'query' && (
          <div className="screen query-screen">
            <QueryPanel
              query={query}
              onChange={setQuery}
              onRun={runQuery}
              onSave={saveQuery}
              canSave={Boolean(database && collection)}
              running={loading}
            />
            <section className="panel results">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Résultat</p>
                  <h2>{database && collection ? `${database}.${collection}` : 'Sélectionnez une collection'}</h2>
                </div>
                <span className="pill">{page?.total ?? 0}</span>
              </div>
              {error && <p className="empty error-text">{error}</p>}
              {!error && loading && <p className="empty">Exécution…</p>}
              {!error && !loading && documents.length === 0 && (
                <p className="empty">Aucun document ne correspond au filtre.</p>
              )}
              <div className="documents">
                {documents.map((document, index) => (
                  <DocumentCard
                    key={String(document._id ?? index)}
                    document={document}
                    onOpen={setSelectedDocument}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === 'saved' && (
          <div className="screen saved-screen">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Local au navigateur</p>
                  <h2>Requêtes enregistrées</h2>
                </div>
                <span className="pill">{saved.length}</span>
              </div>
              <label className="field">
                <span>Nom de la requête</span>
                <input
                  value={saveName}
                  onChange={(event) => setSaveName(event.target.value)}
                  placeholder="Ex. : clients pro actifs"
                />
              </label>
              {saved.length === 0 && <p className="empty">Aucune requête enregistrée.</p>}
              <div className="saved-list">
                {saved.map((entry) => (
                  <article className="saved-item" key={entry.id}>
                    <div>
                      <h3>{entry.name}</h3>
                      <p>
                        {entry.database}.{entry.collection}
                      </p>
                      <code>{entry.query.filter}</code>
                    </div>
                    <div className="saved-actions">
                      <button type="button" className="button primary" onClick={() => openSaved(entry)}>
                        Ouvrir
                      </button>
                      <button
                        type="button"
                        className="button ghost"
                        onClick={() => removeSaved(entry.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      <nav className="tabbar" aria-label="Navigation principale">
        <button
          type="button"
          className={tab === 'explore' ? 'active' : ''}
          onClick={() => setTab('explore')}
        >
          <span aria-hidden="true">▦</span> Explorer
        </button>
        <button
          type="button"
          className={tab === 'query' ? 'active' : ''}
          onClick={() => setTab('query')}
        >
          <span aria-hidden="true">⌘</span> Requête
        </button>
        <button
          type="button"
          className={tab === 'saved' ? 'active' : ''}
          onClick={() => setTab('saved')}
        >
          <span aria-hidden="true">☆</span> Favoris ({saved.length})
        </button>
      </nav>

      <DocumentSheet document={selectedDocument} onClose={() => setSelectedDocument(null)} />
    </div>
  )
}
