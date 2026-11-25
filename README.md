# MongoDBMobile

[![CI](https://github.com/G2on61/MongoDBMobile/actions/workflows/ci.yml/badge.svg)](https://github.com/G2on61/MongoDBMobile/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![stack](https://img.shields.io/badge/stack-React%20%2B%20Vite%20%2B%20TypeScript-61dafb.svg)](package.json)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

Un explorateur MongoDB **mobile-first**, inspiré de MongoDB Compass, qui tient dans une poche et ne sait que lire.

Le vrai besoin : consulter une base en déplacement (debug d'une issue en production, vérification d'un document, contrôle d'un filtre) sans ouvrir un laptop et sans exposer les identifiants MongoDB dans le navigateur.

## Fonctionnalités

- Connexions côté serveur : l'URI MongoDB ne quitte jamais le gateway.
- Navigation bases → collections → documents, avec pagination.
- Éditeur de requête `find()` en lecture seule : filtres, tri, limite, décalage.
- Opérateurs supportés : `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`, `$exists`, `$regex`, `$contains`, `$or`, `$and`.
- Opérateurs JS interdits côté gateway (`$where`, `$function`, `$accumulator`).
- Requêtes enregistrées dans le navigateur (`localStorage`).
- Export CSV des documents affichés.
- Historique des 10 dernières requêtes, rejouables en un tap.
- Mode démo intégré : fonctionne sans MongoDB et sans gateway.
- Interface responsive : barre d'onglets en bas sur mobile, en haut sur desktop, dark mode.

## Démarrage

```bash
npm install
npm run dev
```

Ouvre `http://localhost:5173`. Le mode démo est actif immédiatement.

Pour utiliser un vrai MongoDB, lance le gateway dans un second terminal :

```bash
MONGODB_URI="mongodb://localhost:27017" npm run server
```

Le gateway écoute sur `http://localhost:8787` et le dev server proxyifie `/api` vers celui-ci.

Plusieurs connexions :

```bash
MONGODB_CONNECTIONS='[{"id":"prod","name":"Production","uri":"mongodb+srv://..."},{"id":"preprod","name":"Préprod","uri":"mongodb://..."}]' npm run server
```

## Scripts

| Script | Rôle |
| --- | --- |
| `npm run dev` | Interface Vite |
| `npm run server` | Gateway MongoDB en lecture seule |
| `npm run test` | Tests unitaires Vitest |
| `npm run lint` | Oxlint |
| `npm run typecheck` | TypeScript |
| `npm run build` | Build de production |

## Architecture

```text
src/            interface React, moteur de requête, dépôts (démo / HTTP)
server/         gateway Node : validation, liste des bases, find() en lecture seule
```

Le dépôt HTTP envoie l'en-tête `X-Connection-Id` au gateway. Celui-ci choisit le client MongoDB correspondant, borne la limite à 100 documents et sérialise les ObjectId en chaînes. Voir [ARCHITECTURE.md](ARCHITECTURE.md).

## Sécurité

- Aucun endpoint d'écriture : pas de `insert`, `update`, `delete` ni `drop`.
- L'URI MongoDB est lue uniquement depuis les variables d'environnement du serveur.
- `$where`, `$function` et `$accumulator` sont rejetés avant envoi à MongoDB.
- Limite maximale de 100 documents par requête.

## Contribuer

Les PRs sont bienvenues : chaque changement passe par une branche, une PR et la CI. Voir [CONTRIBUTING.md](CONTRIBUTING.md).
