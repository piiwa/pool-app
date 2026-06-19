# Fréquentation des piscines de Strasbourg

Test technique Arte. Application front Vite + React + TypeScript + Material UI + Recharts.

## Lancer le projet

```bash
npm install
npm run dev          # http://localhost:3000
```

Commandes utiles :

```bash
npm run build        # bundle de production dans dist/
npm run preview      # serveur statique local du bundle de prod
npm run type-check   # tsc --noEmit en strict
npm run lint         # ESLint
npm run check        # lint et format en un appel
```

### En cas d'erreur `npm install`

Sur certaines versions de npm 11.x, un cache corrompu peut produire l'erreur `Cannot read properties of null (reading 'matches')`. Réparation :

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Sources de données

- **Temps réel** : API publique OpenDataSoft, dataset `frequentation-en-temps-reel-des-piscines@eurometrostrasbourg`. Pas d'authentification, pas de quota côté projet.
- **Historique** : `src/data/pooldatas.json`, export fourni dans le brief (21 858 lignes, 7 piscines, 23 février au 28 mai 2026).

## Structure du projet

```
src/
├── App.tsx                # Theme provider, tabs, composition des 3 pages
├── types/                 # Types domaine API + JSON local (séparés volontairement)
├── api/                   # Clients HTTP + import JSON historique
├── data/pooldatas.json    # Export fourni dans le brief
├── utils/                 # schedule, sort, format, stats, status descriptors
├── hooks/                 # use-favorites (localStorage), use-color-mode
├── theme/                 # Factory MUI light/dark (palette deep blue et cream)
├── components/
│   ├── common/            # InfoRow, FavoriteButton, StatusChip, OccupancyBadge, SectionFeedback
│   └── layout/            # PageHeader, AppLayout (tabs)
└── features/
    ├── realtime/          # Objectif 1, temps réel
    ├── stats/             # Objectif 2, statistiques historiques
    └── predictive/        # Objectif 3, choix prédictif
```

## Les trois objectifs

- **Temps réel** : cards 2 colonnes (1 colonne mobile), tri (favoris d'abord, puis ouvertes par occupation croissante, puis fermées), favoris persistés en `localStorage` avec reclassement instantané au clic sur le coeur. Label `temps restant jusqu'à fermeture / ouverture`.
- **Statistiques** : sélection piscine + date, courbe Recharts agrégée à l'heure (axes 0h à 23h).
- **Choix prédictif** : multi-select piscines + jour + heure, recommandation de la piscine la moins fréquentée et tableau comparatif (moyenne, min, max, échantillons).

## Conventions

- Naming `kebab-case` sur les fichiers, `PascalCase` sur les composants exportés.
- TypeScript strict : `strict`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitOverride`, `resolveJsonModule`.
- Composants découpés entre `components/common` (génériques, réutilisables) et `features/*` (métier).
- Pas de state global, `useState` et hooks par feature suffisent à ce scope.
- Pas de dépendances superflues : pas de Lodash, pas de Moment, pas d'axios. `fetch` natif, `Intl.DateTimeFormat`, méthodes natives d'Array.

## Process de développement

Le cheminement complet avec l'IA, les choix de stack, les refus assumés, les tradeoffs et les directives reçues en cours d'exécution sont documentés dans `AI_PROCESS.md`. C'est le document à lire pour comprendre la logique du projet en tant qu'autre développeur.

## Déploiement

Le projet est un build statique standard Vite.

### GitHub

```bash
git remote add origin git@github.com:piiwa/pool-app.git
git branch -M main
git push -u origin main
```

### Render (static site, free tier)

1. Dashboard Render, "New +" puis "Static Site".
2. Connecter le repo GitHub `piiwa/pool-app`.
3. Settings :
   - Branch `main`
   - Build Command `npm install && npm run build`
   - Publish Directory `dist`
4. Create Static Site. URL publique de la forme `https://pool-app-arte.onrender.com`.
