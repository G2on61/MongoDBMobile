# FAQ

## Pourquoi le navigateur ne se connecte pas directement à MongoDB ?

Le protocole MongoDB nécessite un accès réseau à votre cluster et des identifiants. Les mettre dans une application web exposerait ces secrets à chaque visiteur. Le gateway détient l'URI côté serveur ; le navigateur ne voit qu'un identifiant de connexion.

## Le mode démo suffit-il pour essayer l'interface ?

Oui. Sans gateway, l'application utilise `src/data/demoData.ts` : deux bases, cinq collections et des documents réalistes. Aucune configuration n'est nécessaire.

## Comment brancher MongoDB Atlas ?

Démarrez le gateway avec `MONGODB_URI="mongodb+srv://..."`. Autorisez l'IP de la machine qui exécute le gateway dans les réseaux Atlas. Le navigateur peut être sur un téléphone, seul le gateway doit être autorisé.

## Puis-je modifier des documents ?

Non, et c'est volontaire. MongoDBMobile est un outil d'observation : seules les routes de lecture existent. Les opérateurs JS (`$where`, `$function`, `$accumulator`) sont également refusés.

## Quels filtres puis-je écrire ?

`$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`, `$exists`, `$regex`, `$contains`, `$or` et `$and`. Les chemins imbriqués fonctionnent avec la notation pointée, par exemple `{"user.email":{"$regex":"@example.com"}}`.

## Pourquoi la limite est-elle plafonnée à 100 ?

Pour éviter qu'une requête mal écrite ne télécharge une collection entière sur un réseau mobile. Utilisez `skip` pour paginer.

## Où sont stockées mes requêtes ?

Les favoris et l'historique restent dans `localStorage` du navigateur. Aucune donnée n'est envoyée à un service tiers.

## La CI échoue, que vérifier ?

Exécutez `npm ci`, `npm run lint`, `npm run typecheck`, `npm test` et `npm run build` dans cet ordre. Le node de CI utilise Node 24.
