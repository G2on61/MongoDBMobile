# Architecture

MongoDBMobile sépare volontairement l'interface du stockage : le navigateur ne connaît jamais l'URI MongoDB.

## Vue d'ensemble

```text
┌──────────────┐        /api         ┌──────────────┐       wire protocol      ┌──────────┐
│ React (Vite) │ ──────────────────▶ │ Gateway Node │ ───────────────────────▶ │ MongoDB  │
└──────────────┘   X-Connection-Id   └──────────────┘                          └──────────┘
        │
        └── mode démo local (src/data/demoData.ts) si le gateway est absent
```

## Couches frontend

| Dossier | Responsabilité |
| --- | --- |
| `src/components` | Composants présentationnels (carte document, sheet JSON, éditeur de requête). |
| `src/data` | Jeu de données de démonstration. |
| `src/lib/query.ts` | Parse JSON, opérateurs, tri et pagination. Partagé avec le gateway. |
| `src/lib/repository.ts` | Deux implémentations de `MongoRepository` : démo et HTTP. |
| `src/lib/savedQueries.ts` | Persistance locale des favoris. |
| `src/lib/queryHistory.ts` | Persistance locale des 10 dernières exécutions. |
| `src/lib/export.ts` | Sérialisation CSV. |

`App.tsx` orchestre les effets : quand la connexion change, il recharge les bases, puis les collections, puis les documents. Chaque effet utilise un drapeau `cancelled` pour ignorer les réponses tardives.

## Gateway

`server/index.js` expose uniquement :

- `GET /api/health`
- `GET /api/version`
- `GET /api/connections`
- `GET /api/databases`
- `GET /api/collections?database=…`
- `POST /api/find`

Validation avant envoi à MongoDB :

1. `normalizeQuery` borne `limit` à 100 et `skip` à 0 minimum.
2. `parseJsonObject` refuse tout ce qui n'est pas un objet JSON.
3. `assertReadOnly` rejette `$where`, `$function` et `$accumulator`.
4. `serialize` convertit ObjectId et Date en valeurs JSON sûres.

Le client MongoDB est mis en cache par identifiant de connexion dans une `Map`.

## Ajouter une connexion

Le gateway lit `MONGODB_URI` ou `MONGODB_CONNECTIONS` au démarrage. Le navigateur reçoit seulement `{ id, name, kind }`, jamais l'URI.

## Tests

Vitest couvre le moteur de requête, la sérialisation BSON, la configuration des connexions, l'historique et l'export CSV. La CI rejette tout code qui ne passe pas lint, typecheck, tests et build.
