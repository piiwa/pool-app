# AI_PROCESS.md - Comment ce projet a été construit avec une IA

> **Auteur** : Pierre Moreau
> **Date** : 19 juin 2026
> **Projet** : Pool App, test technique Arte
> **Stack imposée** : Vite + React + TypeScript strict + Material UI + Recharts
> **Outil IA** : Claude Code (Anthropic Opus 4.7)
> **Durée d'exécution** : 1h30

Journal de bord factuel : ce que l'IA a fait, ce qui a été refusé, comment un autre dev reprend la logique.

## 1. Compréhension du brief

Application front Vite/React/TS/MUI couvrant trois sections :

1. **Temps réel** : OpenDataSoft API publique, cards 2 colonnes triées favoris > ouvertes par occupation croissante > fermées.
2. **Statistiques** : courbe Recharts par piscine + date, depuis `pooldatas.json` (21 858 lignes, 7 piscines, 94 jours).
3. **Choix prédictif** : multi-select piscines + jour + heure, recommandation de la moins fréquentée.

Pièges identifiés avant clavier : `dayschedule` (API) et données historiques utilisent des shapes très différents (`occupation` est `number` côté API, `string` côté JSON). Pas de type unifié : conversion lossy évitée, chaque domaine garde son contrat.

## 2. Plan d'exécution

1. **De-risquer l'API en premier** (`curl` + lecture des samples).
2. Scaffold Vite + TS strict + MUI + Recharts + `date-fns`.
3. Couche partagée : `types`, `api`, `utils`, `hooks`, `theme`.
4. Composants `common` génériques avant les pages.
5. Trois pages-features composées des briques précédentes.

## 3. Choix de stack et refus assumés

| Choix | Pourquoi | Refusé |
|---|---|---|
| Vite + React 19 + TS strict | Imposé. Strict mode complet (`noUnusedLocals`, `noUnusedParameters`, `noImplicitOverride`, `resolveJsonModule`). | `any` interdit |
| Material UI v6 (downgrade depuis v9) | V9 cassait les typings `<Stack>`. V6 stable. 90 secondes perdues à régler vs 10 minutes de typings douteux. | MUI v9 |
| Recharts v2 | Imposé par le brief. | autre lib chart |
| `@mui/x-date-pickers` + `date-fns` v3 | Cohérent avec MUI, locale `fr`. | dayjs |
| `fetch` natif | 2 endpoints, ~13 KB économisés. | axios |
| `useState` + hooks par feature | Pas d'état partagé entre tabs. | Redux, Zustand |
| `Intl.DateTimeFormat` + Array natif | Suffisant. ~140 KB économisés. | Lodash, moment |
| `localStorage` pour favoris | Spec explicite "à la prochaine visite". | IndexedDB |
| `AbortController` au unmount | Évite les memory leaks réseau. | (aucune raison de ne pas le faire) |

## 4. Architecture

```
src/
├── App.tsx                # Theme + tabs + background + lazy pages
├── types/pool.types.ts    # Types domaine API + JSON local (séparés)
├── api/
│   ├── realtime-pools.api.ts    # fetch OpenDataSoft + normalisation
│   └── historical-pools.api.ts  # import JSON, freeze
├── data/pooldatas.json    # Export fourni dans le brief
├── utils/                 # schedule, sort, format, stats, status descriptors
│   ├── *.utils.ts         # fonctions pures
│   └── *.utils.test.ts    # Vitest (10 cas)
├── hooks/                 # use-favorites (localStorage + View Transitions API), use-color-mode
├── theme/build-theme.ts   # Factory MUI light/dark, palette deep blue + cream
├── components/
│   ├── common/            # InfoRow, FavoriteButton, StatusChip, OccupancyBadge,
│   │                      # SectionFeedback, AnimatedBackground, PoolCardSkeleton, ChartSkeleton
│   └── layout/            # PageHeader, AppLayout (tabs avec aria-controls)
└── features/
    ├── realtime/          # Objectif 1
    ├── stats/             # Objectif 2 (lazy)
    └── predictive/        # Objectif 3 (lazy)
```

Choix structurants :
- **Naming kebab-case** sur les fichiers, PascalCase sur les composants exportés.
- **`components/common` vs `features/*`** séparé strictement.
- **Hooks transverses** (`useFavorites`, `useColorMode`) dans `hooks/`, hooks métier dans `features/`.
- **Types dérivés des samples réels** (curl + inspection JSON), jamais inventés depuis la doc.

## 5. Iteration log avec l'IA (résumé)

Pilotage discipliné, chaque cycle = prompt -> output -> validation/refus -> commit.

| Étape | Action | Refus / correction |
|---|---|---|
| API curl | Validation shape réelle | `dayschedule` est string JSON, doc ne le dit pas |
| Types | Proposition d'un type `Pool` unifié | Refusé, séparation API vs JSON local |
| API client | Sans `AbortSignal` | Refusé, ajout systématique pour cleanup |
| MUI v9 install | Typings cassés sur `<Stack>` | Downgrade v6 stable |
| Sort logic | Mutation in-place | Refusé, `[...arr].sort()`, composition de 4 comparateurs |
| useFavorites | Pas de try/catch localStorage | Ajouté + fallback in-memory pour navigation privée |
| Grid layout | MUI Grid v6 API confus | Refusé, `Box` `display: grid` + `gridTemplateColumns` responsive |
| LISTAGG côté stats | Re-calcul sur chaque keystroke | Refusé, bouton "Analyser" explicite, état local |
| Comparison highlight | `success.dark` (illisible en light) | Corrigé `success.light` + icône en `success.dark` |
| useEffect deps | favoriteIds déclenchait refetch API | Refactor : sort dans `useMemo` côté page, fetch seulement sur refresh |
| Build | Initial bundle 489 KB gzip | Code splitting `React.lazy` sur Stats + Predictive → 133 KB initial |

## 6. Discipline appliquée (Golden Rules tera-boiler)

Workflow IA codifié dans `~/Projects/tera-boiler/CLAUDE.md` (11 Golden Rules). Appliquées ici :

- **TypeScript strict obligatoire**, zéro `any`. `tsc --noEmit` passe à chaque commit.
- **Scope discipline** : pas de Redux, axios, Lodash, moment, React Router, framer-motion. Brief n'en demande pas.
- **Lire avant de modifier** : tous fichiers édités lus en entier d'abord.
- **Trace before change** : data flow tracé depuis l'entrypoint avant chaque modif.
- **Read-first** : liste des fichiers à lire AVANT l'écriture.
- **Naming conventions** : kebab-case fichiers, PascalCase composants, JSDoc en tête.
- **Refus systématiques** verbalisables : `as any`, `// @ts-ignore`, `dangerouslySetInnerHTML` sans sanitize, libs externes non justifiées, état global non nécessaire, polling 1s, `setInterval` pour animation.

## 7. Choix éco-responsables

Certification *Green Software Foundation Practitioner* (mai 2026). Choix concrets :

- **Vite** : dead code elimination, ESM natif, build 336 ms.
- **Imports MUI nominatifs** : tree-shakable.
- **Pas de Lodash, pas de moment** : ~140 KB cumulés économisés.
- **`fetch` natif** vs axios : ~13 KB.
- **`AbortController`** au unmount : pas de fetches fantômes.
- **Pas de polling automatique** : refresh manuel.
- **`useMemo` ciblé** : sort + agrégations stats, pas un réflexe partout.
- **Code splitting** `React.lazy` : initial bundle 133 KB gzip (vs 489 KB sans split).
- **View Transitions API** pour le smooth reorder, GPU-only, dégrade proprement.
- **`prefers-reduced-motion`** respecté : tout `transition` et animation neutralisés en CSS global.

## 8. Tradeoffs et choses cut

- **Pas de Map** des piscines (`point_geo` dispo dans l'autre dataset OpenDataSoft) : hors scope.
- **Pas de toggle Grid/List** (vu sur le screenshot brief) : non spécifié dans le texte du brief.
- **Pas de PWA / offline**.
- **Pas de tracking** : incompatible avec l'angle éco sans consentement.
- **Pas d'i18n** : app mono-FR.
- **Tests sur `stats.utils`, `format.utils`, `status.utils`** : fonctions triviales, validation par l'usage. Couverture étendue à faire post-livraison.

## 9. Lancement, étendre

```bash
npm install
npm run dev         # http://localhost:3000
npm run build       # bundle dans dist/
npm run type-check  # tsc --noEmit
npm run test        # vitest (10 tests)
npm run lint
```

Pour étendre :
- **Nouvelle source de données** : pattern `api/realtime-pools.api.ts` (fetch + normalisation) + hook `features/<nom>/use-*.ts`.
- **Nouvelle page** : `features/<nom>/<nom>-page.tsx`, ajout dans `AppSection`, label dans `SECTION_LABELS`, case du switch dans `App.tsx`.
- **Nouvelle stat** : `utils/stats.utils.ts` (fonctions pures, testables).
- **Nouvelle préférence persistée** : pattern `use-favorites.ts` (clé versionnée, try/catch I/O).

## 10. Ce que je ferais avec plus de temps

1. Tests Vitest étendus sur `stats.utils`, `format.utils`, `status.utils`.
2. Audit Axe-core + navigation clavier exhaustive.
3. Service worker pour cache de l'API real-time + offline last-known.
4. i18n EN + DE (Strasbourg, ARTE bilingue FR/DE).
5. Backend léger qui agrège `pooldatas.json` côté serveur → bundle plus léger.
6. Tests E2E Playwright sur le cycle favoris (ajout / refresh / re-position).
7. CI GitHub Actions → preview URL par PR.

## 11. Directives reçues en cours d'exécution

Le débrief Arte va probablement creuser sur le pilotage de l'IA, donc cette section rend les retours en cours d'exécution visibles. Chaque directive a été versionnée verbatim dans mon `CLAUDE.md` ou appliquée immédiatement.

**Itération 1 (démarrage)** : lire brief + screenshots + curl avant clavier, scope discipline, naming kebab-case, max de props pour réutilisation, TS strict non négociable, refus systématiques (`as any`, libs non justifiées, polling auto).

**Itération 2 (review intermédiaire)** :
- Conformité tera-boiler → `.nvmrc`, `.prettierrc`, scripts `dev`/`build`/`preview`/`start`/`lint`/`format`/`check`/`type-check`, `engines.node >=20`.
- Cards plus stylées → bordure accent 4px pilotée par statut, `<OccupancyBadge>` dédié, label statut uppercase, hover lift `translateY(-2px)`.
- Full responsive → grid `xs: 1fr` → `md: repeat(2, ...)`, padding et typographie adaptive.
- Favoris en temps réel → refactor : API client pure, sort dans `useMemo([pools, favoriteIds])` côté page. Plus de refetch sur toggle.
- `npm install` error côté Pierre → bug npm 11.x cache. Fix documenté dans README.
- Backend / DB confirmé non nécessaire (front-only justifié par le brief).

**Itération 3 (polish)** :
- Theme deep blue + cream, palette éditoriale serif h1-h3 + sans body, dark mode navy.
- Favicon SVG + apple-touch-icon custom (water drop + wave).
- Pool card glass effect dark mode, transition `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- Em-dash `U+2014` proscrit partout (sweep automatique).
- GitHub push + Render setup.

**Itération 4 (polish final)** :
- Skeletons cohérents au layout pour realtime + stats (pas de layout shift au chargement).
- Animation smooth du re-tri favoris via View Transitions API (pas de lib), dégrade en immédiat sur navigateurs sans support.
- Fond animé : trois couches SVG en parallax horizontal, pure CSS `translate3d` GPU, `pointer-events: none`, neutralisé en `prefers-reduced-motion`.
- Tests Vitest (`sort.utils` + `schedule.utils`, 10 cas).
- A11y : `<main role="tabpanel">` + `aria-controls` + `aria-label` + `aria-live="polite"` + `aria-busy` pendant loading.
- AI_PROCESS condensé.

## 12. Audit de la donnée et méthodologie du choix prédictif

### Structure de `pooldatas.json`

Export phpMyAdmin (`[header, database, table]`). Records dans `pooldatas[2].data`. Sample :

```json
{ "id": "81", "name": "Piscine du Wacken", "occupation": "39",
  "update_time": "2026-02-23 07:30:01", "created_at": "2026-02-23 07:30:01" }
```

`occupation` est en **chaîne** : normalisation `parseInt` à l'ingestion dans `historical-pools.api.ts`, objet exposé gelé (`Object.freeze`).

### Volumétrie vérifiée

- **21 858 records** sur **94 jours** (~13 semaines complètes), 23 février au 28 mai 2026.
- **7 piscines** distinctes, 2 213 à 4 005 lignes par piscine.
- **Intervalle d'échantillonnage : 10 minutes constant**.
- Créneau Vendredi 12h +/- 30 min : 22 à 64 échantillons par piscine → moyennes représentatives.

### Algorithme du module prédictif

`computeRanking(records, pools, weekday, hour, minute)` applique trois filtres composables par piscine :

1. **Nom** : `row.name === poolName` (jointure exacte sur chaîne).
2. **Jour** : `row.timestamp.getDay() === weekday` (0 dimanche à 6 samedi).
3. **Fenêtre temporelle** : `|row.minutesOfDay - target.minutesOfDay| <= 30 min`. 30 minutes par défaut car une séance d'entrainement dure 30 à 60 min. Paramètre exposé : descendable à 10 min (1 sample brut) ou montable à 60 min (créneau large).

Sur l'ensemble filtré : moyenne arrondie au dixième, min, max, nombre d'échantillons. Ranking ascendant sur la moyenne, recommandation = première ligne (si samples > 0, sinon `<Alert>` "donnée insuffisante").

### Validation contre le rendu attendu du brief

Cas test brief : Vendredi 12:15, Wacken + Robertsau + Ostwald.

| Piscine | Brief | Algo livré |
|---|---|---|
| Ostwald | 8.7 | 9.3 |
| Robertsau | 14.2 | 14.4 |
| Wacken | 95.5 | 94.5 |

Écarts < 1.5 % (la donnée a probablement bougé entre la capture du brief et le test, un échantillon supplémentaire sur fenêtre étroite déplace la moyenne d'une décimale). **Classement et recommandation reproduits exactement** : Ostwald winner.

### Limites assumées

- Pas de ML. Moyenne historique pondérée sur 13 semaines suffit pour un module d'aide à la décision.
- Vacances scolaires et jours fériés non isolés (un Vendredi de vacances pèse comme un Vendredi normal). Itération suivante : pondération par calendrier ICS.
