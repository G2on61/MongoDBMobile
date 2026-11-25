# Contribuer

Merci de contribuer à MongoDBMobile.

## Workflow

1. Fork ou branche depuis `main`.
2. Crée une branche descriptive : `feat/export-csv`, `fix/tri-null`, `docs/quickstart`.
3. Développe avec des commits atomiques.
4. Vérifie en local :

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

5. Ouvre une PR avec le template fourni et décris le problème résolu.
6. La CI doit être verte avant le merge.

## Conventions

- TypeScript strict, composants React fonctionnels.
- Fichiers de test à côté du code testé (`*.test.ts`).
- Le gateway reste en lecture seule : toute nouvelle route doit être un `GET` ou un `find()` borné.
- Les messages d'erreur visibles par l'utilisateur sont en français.

## Idées de PR

- vue arborescente des collections,
- raccourcis clavier,
- notifications pour les longues requêtes.
