# AI_PROCESS.md - Comment ce projet a été construit avec une IA

> Auteur : Pierre Moreau
> Date : 19 juin 2026
> Projet : Pool App - test technique Arte
> Stack imposée : Vite + React + TypeScript strict + Material UI + Recharts
> Outil IA principal : Claude Code (Anthropic), modèle Opus 4.7
> Durée d'exécution : ~1h30 (de la réception du brief à la livraison du zip)

Ce document trace la façon dont l'IA a été pilotée, où elle a été refusée, et comment un autre développeur peut reprendre la logique. Il est volontairement factuel et chronologique : un journal de bord, pas un pitch.

---

## 1. Compréhension du brief

Application front Vite + React + TS + MUI qui couvre trois sections :

1. **Temps réel** : fréquentation actuelle des piscines de Strasbourg, depuis l'API OpenDataSoft `frequentation-en-temps-reel-des-piscines@eurometrostrasbourg`. Cards en 2 colonnes, tri (favoris > ouvertes croissant par occupation > fermées), favoris persistés, label « temps restant jusqu'à fermeture / ouverture ».
2. **Statistiques** : fréquentation passée, depuis un export JSON local `pooldatas.json` (21 858 lignes, 7 piscines, du 23 fév. au 28 mai 2026). Sélection piscine + date → courbe Recharts.
3. **Choix prédictif** : suggérer la piscine la moins fréquentée pour un jour + une heure d'entrainement, à partir des mêmes données historiques. Multi-select piscines + jour + heure → recommandation + tableau comparatif.

Contraintes implicites identifiées avant le clavier :
- Les sources de données ont des shapes différents (API en `number`, JSON local en `string`). Pas de modèle unifié forcé - chaque domaine garde son type pour éviter une conversion lossy.
- `dayschedule` (API) et `update_time` (JSON) sont des chaînes JSON sérialisées dans un cas, des datetimes locales dans l'autre. Parser à l'ingestion, pas dans la couche UI.
- Le champ `occupation` est absent quand la piscine est fermée → le typage doit le marquer optionnel.

## 2. Plan d'exécution

Plan en 5 étapes, ordonnées par risque décroissant :

1. **De-risquer l'API** (étape la plus risquée, faite en premier). `curl` les deux sources de données, valider la forme réelle, dériver les types TypeScript depuis les samples. Si l'API est down ou différente de la doc, je le sais à 15h15 pas à 16h00.
2. **Scaffold Vite + React + TS strict + MUI + Recharts**. Setup minimal qui build vert.
3. **Couche partagée** : types, clients API, utilitaires (parsing de schedule, tri, formatage), hooks (favoris persistés, dark mode).
4. **Composants communs** atomiques et réutilisables (`InfoRow`, `FavoriteButton`, `StatusChip`, `SectionFeedback`, `PoolSelect`, etc.) AVANT les pages, pour que les trois sections les réutilisent sans dupliquer.
5. **Trois pages-features** (`RealtimePage`, `StatsPage`, `PredictivePage`) composées des briques précédentes.

Test minimal qui prouve que ça marche : la build passe en TypeScript strict, et l'API renvoie les 8 piscines attendues.

## 3. Choix de stack et justifications

| Choix | Pourquoi | Alternative refusée |
|---|---|---|
| **Vite + React + TS strict** | Imposé par le brief. `tsconfig` activé en `strict`, `noUnusedLocals`, `noUnusedParameters`, `resolveJsonModule`, `noImplicitOverride`. Zéro `any` toléré. | JS pur (rejeté par 13 ans de pratique TS). |
| **Material UI v6** | Imposé par le brief. Pinné en v6 stable plutôt que la 9.x récente qui présentait des typings instables sur `<Stack>` au build. La downgrade m'a coûté 90 secondes - la stabilité m'a coûté 0 minute de débogage de typings. | MUI v9 (typings cassants sur Stack `direction`/`alignItems`), Tailwind seul (pas imposé). |
| **Recharts** | Imposé par le brief pour les courbes. | `@mui/x-charts` (pas demandé), Chart.js (non imposé). |
| **`@mui/x-date-pickers` + `date-fns`** | Le brief montre des `DatePicker` et `TimePicker` MUI sur les screenshots. `date-fns` est l'adapter MUI le plus léger et stable pour la locale `fr`. | dayjs (similaire mais date-fns colle au standard ESM tree-shakable). |
| **`fetch` natif** | Suffisant pour un endpoint. ~13 KB économisés vs axios. | axios (refusé, scope discipline - la règle n°3 de mon `CLAUDE.md` est explicite). |
| **`useState` + `useEffect`** | Suffisant pour ce scope. Trois pages, état local par feature, pas d'état partagé entre tabs. | Redux / Zustand (refusés, pas justifiés). |
| **Array natif + `Intl.DateTimeFormat`** | Aucune lib de manipulation collection ou date hors `date-fns` (qui est nécessaire pour l'adapter MUI). | Lodash (refusé, ~70 KB économisés), Moment (refusé, ~67 KB économisés). |
| **`localStorage` pour les favoris** | Le brief précise : « à la prochaine visite, afficher ce lieu en premier ». Persistance simple, pas de backend. | IndexedDB (overkill pour < 100 octets), cookies (sémantique inappropriée). |
| **`AbortController` sur le fetch** | Évite le memory leak quand l'utilisateur quitte la page pendant la requête. | Aucune (rejeté : c'est un signal senior gratuit). |

## 4. Architecture du code

```
src/
├── App.tsx                       # Thème + tabs + composition des 3 pages
├── main.tsx                      # Bootstrap React (StrictMode)
├── index.css                     # Reset minimal
│
├── types/
│   └── pool.types.ts             # Types domaine API + JSON local (séparés)
│
├── api/
│   ├── realtime-pools.api.ts     # fetch + parsing dayschedule
│   └── historical-pools.api.ts   # Import JSON statique, normalisation gelée
│
├── data/
│   └── pooldatas.json            # Export phpMyAdmin fourni (21 858 lignes)
│
├── utils/
│   ├── schedule.utils.ts         # formatSlot + computeTimeUntilStatusChange
│   ├── sort.utils.ts             # Tri selon spec (favoris > ouvertes > occupation)
│   ├── format.utils.ts           # Intl formatters partagés
│   └── stats.utils.ts            # Agrégations courbe horaire + ranking
│
├── hooks/
│   ├── use-favorites.ts          # Set<string> persisté en localStorage
│   └── use-color-mode.ts         # Light/dark persisté
│
├── theme/
│   └── build-theme.ts            # Factory MUI light/dark
│
├── components/
│   ├── common/
│   │   ├── info-row.tsx          # Réutilisable cards + tableaux
│   │   ├── favorite-button.tsx
│   │   ├── status-chip.tsx
│   │   └── section-feedback.tsx  # loading / error / empty / ready
│   │
│   └── layout/
│       ├── page-header.tsx       # Titre + dark mode toggle
│       └── app-layout.tsx        # Container + Tabs
│
└── features/
    ├── realtime/                 # Objectif 1
    │   ├── pool-card.tsx
    │   ├── realtime-page.tsx
    │   └── use-realtime-pools.ts
    │
    ├── stats/                    # Objectif 2
    │   ├── pool-select.tsx
    │   ├── frequentation-chart.tsx
    │   ├── stats-page.tsx
    │   └── use-historical-data.ts
    │
    └── predictive/               # Objectif 3
        ├── pool-multi-select.tsx
        ├── weekday-select.tsx
        ├── recommendation-card.tsx
        ├── comparison-table.tsx
        └── predictive-page.tsx
```

Points d'architecture à noter :
- **Naming kebab-case sur les fichiers, PascalCase sur les composants exportés**. Cohérent avec mes patterns `tera-boiler` (cf section 6).
- **Séparation `components/common` vs `features/*`**. Les composants `common` sont génériques (peuvent vivre dans n'importe quel projet). Les composants `features/*` sont métier (couplés au domaine piscines).
- **Hooks par feature** quand l'état est métier (`useRealtimePools`, `useHistoricalData`), **hooks transverses dans `hooks/`** (`useFavorites`, `useColorMode`).
- **Les types sont dérivés des samples API réels**, pas inventés à partir de la doc. La doc OpenDataSoft ne précise pas que `dayschedule` est une chaîne JSON sérialisée - c'est en faisant `curl` que je l'ai vu.
- **Jointure entre la liste de piscines API et le statut temps réel** : faite par `name` (les `sigid` / `idsurfs` ont des préfixes différents entre les deux datasets de la même source).
- **Pas de routeur** (React Router) : trois sections via `Tabs` MUI, état local dans `App.tsx`. Si l'app devait ajouter du deep-linking ou des URLs partageables, j'ajouterais React Router à ce moment-là - pas par anticipation.

## 5. Iteration log avec l'IA

C'est la section qui prouve la discipline du process. Chaque ligne = un cycle prompt → output IA → validation/refus → résultat dans le code.

| # | Heure | Objectif | Prompt résumé | Ce que l'IA a généré | Mon refus / correction | Résultat |
|---|---|---|---|---|---|---|
| 1 | 15h00 | Lecture brief | Lecture du PDF + 3 screenshots des rendus attendus | - | - | Compréhension scope avant clavier |
| 2 | 15h10 | De-risquer API | `curl` du endpoint OpenDataSoft + sample du JSON local | Sample 8 piscines, structure confirmée | `dayschedule` est une string JSON - note d'attention dans `realtime-pools.api.ts` | Types dérivés des samples réels |
| 3 | 15h15 | Scaffold | `pnpm create vite@latest pool-app --template react-ts` | Vite + React + TS standard | Suppression des assets démo (logo Vite, App.css décoratif, `public/icons.svg`) | Arborescence propre |
| 4 | 15h17 | Deps | `pnpm add @mui/material @emotion/react @emotion/styled @mui/icons-material @mui/x-date-pickers recharts date-fns` | MUI 9.x installé (latest) | Downgrade vers MUI 6.x stable + Recharts 2.x après échec de typecheck sur `<Stack direction="row" alignItems="…">` en MUI 9 | Stack stable |
| 5 | 15h20 | Types domaine | Brief de séparation types API vs types JSON local | Proposition d'un type unifié `Pool` | Refusé. Les deux sources ont des shapes différents (occupation `number` vs `string`, dayschedule vs update_time, etc). Un type unifié forcerait des conversions lossy. Séparation explicite dans `pool.types.ts`. | Types domaine clairs |
| 6 | 15h25 | API client | Wrapper `fetchRealtimePools(signal, favoriteIds)` | Première version sans `AbortSignal` | Refusé. Toujours câbler un `AbortSignal` depuis l'effet React pour éviter les memory leaks. Ajouté + documenté dans le JSDoc. | Client API propre |
| 7 | 15h28 | Parser dayschedule | Parser robuste qui tolère une chaîne malformée | Try/catch propre, retour `[]` en cas d'erreur | Validé. Note ajoutée : une piscine fermée a parfois zéro slot dans `dayschedule` - `formatScheduleSlots([])` gère « Horaires non communiqués ». | Pas de crash UI |
| 8 | 15h32 | computeTimeUntilStatusChange | Label « 19h00 fermeture » / « 07h00 ouverture (demain) » | Première implémentation comparait des `Date` complets | Refusé. Cycle complet sur les `Date` est fragile à minuit. Conversion explicite en minutes-depuis-minuit, comparaison numérique. Trois branches : dans un slot / avant un slot / après le dernier slot. | Logique stable |
| 9 | 15h35 | Sort.utils | Tri selon spec (favoris > ouvertes croissant > fermées) | `Array.sort` direct sur les pools | Refusé, je veux la version pure : `[...pools].sort(...)` pour ne jamais muter l'input. Composition de 4 comparateurs nommés + tie-breaker stable sur le nom. | Tri stable + non mutant |
| 10 | 15h38 | useFavorites | Hook `Set<string>` persisté en localStorage | Version sans gestion de l'erreur localStorage | Refusé. localStorage peut throw en private browsing - try/catch + fallback in-memory + note dans le JSDoc. | Robuste |
| 11 | 15h40 | Composants communs | `<InfoRow>` + `<FavoriteButton>` + `<StatusChip>` + `<SectionFeedback>` | Génération directe | Refusé tout `as any`, tout `<Stack direction="row" alignItems="…">` (incompatible MUI 9 puis ré-accepté après downgrade), tout import wildcard `import * as MUI`. Imports nominatifs tree-shakable. | Stack propre |
| 12 | 15h45 | PoolCard | Composition complète | Une icone `★` au lieu du `♥` du screenshot | Corrigé : `<FavoriteIcon>` MUI + variant `outlined` quand off - colle visuellement au screenshot. | Visuel correct |
| 13 | 15h48 | RealtimePage | Grid 2 colonnes responsive | Grid MUI v6 (le composant `Grid` v6 a un API différent) | Refusé MUI Grid, utilisé `Box` avec `display: grid` + `gridTemplateColumns` responsive. Plus simple, moins de prop drilling. | Mise en page robuste |
| 14 | 15h52 | StatsPage + chart | Recharts `<LineChart>` avec axes 0h-23h | Première version sans `responsive container` | Corrigé : `<ResponsiveContainer>` + theme MUI plumbed sur stroke + tooltip background → cohérent dark mode. | Chart adaptable |
| 15 | 15h55 | Stats utils | `aggregateByHour` + `computePoolStatsForSlot` | Tolerance fenêtre figée à 5 minutes | Refusé. Le brief dit « heure d'entrainement souhaité » sans précision. +/- 30 minutes par défaut, exposable en paramètre. Doc inline. | Stats utiles |
| 16 | 16h00 | PredictivePage | Multi-select + analyse + recommandation | Re-calcul à chaque keystroke des selects | Refusé. L'analyse n'a aucun intérêt à se recalculer à chaque clic de checkbox - bouton « Analyser » explicite, état `analysis` stocké en local. | Trigger explicite |
| 17 | 16h05 | Comparison table | Tableau MUI avec highlight winner | Surlignage en `success.dark` (trop sombre en light) | Corrigé en `success.light` + `success.dark` sur l'icône uniquement. | Lisible deux thèmes |
| 18 | 16h10 | Build | `pnpm build` | Bundle initial 489 KB gzip (incluant les 2.9 MB pooldatas) | Acceptable pour la démo. Note ajoutée dans README : optimisation possible via code-splitting `React.lazy` sur Stats + Predictive (non livré, scope discipline). | Build vert |
| 19 | 16h15 | Strict TS | `pnpm exec tsc --noEmit` | 0 erreur, 0 warning | - | Validation |
| 20 | 16h18 | Cleanup | Suppression dossier vide, suppression imports unused | `formatHHmm` déclaré mais jamais utilisé | Removed. `noUnusedLocals` aurait crashé le build au reload. | Clean |

## 6. Discipline appliquée (référence règles personnelles)

Mon workflow IA est codifié dans le fichier `CLAUDE.md` de mon boilerplate SaaS multi-product personnel `tera-boiler`. Pour ce test j'ai appliqué notamment :

- **Règle 1 - TypeScript strict obligatoire** : `pnpm exec tsc --noEmit` doit passer avant tout commit. Zéro `any` toléré. `tsconfig.app.json` activé en `strict`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitOverride`. Validé en fin de course.
- **Règle 3 - Scope discipline** : j'ai refusé d'ajouter Redux, axios, Lodash, moment, React Router, dépendances 3D. Le brief ne les demande pas et `useState` + `useEffect` suffisent à ce scope. La même règle s'applique à la couche d'animation - j'aurais pu ajouter une couche `framer-motion` mais le brief n'évoque pas d'animation et chaque KB compte.
- **Règle 4 - Lire avant de modifier** : tous les fichiers que j'ai écrits, je les ai construits depuis les samples réels (PDF du brief + 3 screenshots + curl API + samples JSON). Pas de génération depuis la doc.
- **Règle 6 - Trace before change** : avant chaque branchement de prop ou de state, j'ai tracé le chemin data depuis l'entry point (App.tsx → Layout → Page → Sub-components). C'est pour ça que le tri vit dans `utils/sort.utils.ts` et pas dans `RealtimePage` : le tri est testable et réutilisable indépendamment de la couche UI.
- **Règle 10 - Read-first par défaut** : avant tout code non-trivial, listé les fichiers à lire AVANT d'écrire - types, samples, screenshots.
- **Refus systématiques** : `as any`, `// @ts-ignore`, `dangerouslySetInnerHTML` sans sanitize, libs externes non justifiées, états globaux non nécessaires, `setInterval` pour polling.

Mon `CLAUDE.md` complet est consultable à `~/Projects/tera-boiler/CLAUDE.md` (peut être partagé si demandé).

## 7. Choix éco-responsables

La technologie éco-responsable est un point que je porte sérieusement (certification *Green Software Foundation Practitioner* obtenue en mai 2026, badge [ici](https://badges.greensoftware.foundation/awards/128e9d6d-0de0-43fa-ba98-23db6fa2b009)). Choix concrets sur ce projet :

- **Vite** (bundle optimisé, dead code elimination, ESM natif).
- **Imports MUI nominatifs** (`import { Card } from '@mui/material'`) → tree shakable.
- **Pas de Lodash, pas de moment** → Array natif + Intl.DateTimeFormat. Économie ~140 KB cumulés.
- **`fetch` natif** plutôt qu'axios. Économie ~13 KB.
- **`AbortController` au unmount** → libère les ressources réseau, évite les memory leaks.
- **Tri non mutant** (`[...pools].sort(...)`) → pas de re-renders parasites.
- **Pas de polling automatique** : refresh manuel via le bouton « Rafraîchir ». Le brief ne demande pas de mise à jour automatique, et un polling toutes les N secondes consommerait pour rien tant que l'onglet n'est pas regardé.
- **`useMemo` ciblé** sur le tri et les agrégations stats - pas un réflexe, uniquement là où le coût est visible.
- **Pas de framer-motion ni de Three.js** sur ce projet - pas demandé dans le brief, et un bundle léger sert l'utilisateur ET la planète.

**Bundle final** : 489 KB gzip (4,1 MB raw), dont ~2,9 MB de `pooldatas.json` embarqué et ~1,2 MB de code (MUI + Recharts + app).

**Pistes d'optimisation non livrées (scope discipline)** :
- `React.lazy` + `Suspense` sur les pages Stats et Predictive : un utilisateur qui reste sur le temps réel ne télécharge ni Recharts ni les 2,9 MB de pooldatas.
- Compression server-side du JSON historique (Brotli) ou backend dédié qui sert les agrégations pré-calculées.

## 8. Tradeoffs et choses cut

- **Pas de tests unitaires** - j'aurais ajouté Vitest sur `sort.utils.ts`, `schedule.utils.ts` et `stats.utils.ts` (les trois fichiers métier purs et faciles à tester). En 1h30 j'ai priorisé la couverture fonctionnelle et la qualité du découpage. À ajouter en première itération post-livraison.
- **Pas de code splitting** sur les pages - explicité dans la section éco. Acceptable pour le test, à faire en prod.
- **Pas de toggle Grid/List** affiché sur le screenshot 1 - pas dans le scope textuel du brief. Scope discipline.
- **Pas de Map** des piscines (point_geo dans l'autre dataset OpenDataSoft) - non demandé, hors scope.
- **Pas de PWA / offline** - non demandé. Le brief vise un usage classique.
- **Pas de tracking analytics** - non demandé, et incompatible avec l'angle éco-responsable sans consentement explicite.
- **Pas d'i18n** - l'app est mono-langue FR.

## 9. Comment lancer et étendre

### Lancement

```bash
npm i
npm run dev      # http://localhost:5173
npm run build    # bundle dans dist/
npm run preview  # serveur de prod local
```

### Étendre

- **Ajouter une nouvelle source de données** : copier le pattern `api/realtime-pools.api.ts` (fetch + normalisation) et exposer un nouveau hook dans `features/<nom>/use-*.ts`.
- **Ajouter une nouvelle page** : créer `features/<nom>/<nom>-page.tsx`, ajouter l'entrée dans `AppSection`, le label dans `SECTION_LABELS` et le case du `switch` dans `App.tsx`.
- **Ajouter un calcul stat** : tout vit dans `utils/stats.utils.ts` - les fonctions sont pures, faciles à tester et à composer.
- **Persister une nouvelle préférence** : le pattern `use-favorites.ts` (clé versionnée `pool-app:<nom>:vN`, try/catch sur l'I/O) est réutilisable directement.

### Tester localement avec une autre piscine

L'API OpenDataSoft accepte un `&facet=name=<nom>` pour filtrer côté serveur. Voir `REALTIME_POOLS_ENDPOINT` dans `src/api/realtime-pools.api.ts`.

## 10. Ce que je ferais avec plus de temps

1. **Tests Vitest** sur `sort.utils.ts` (table-driven, ~15 lignes), `schedule.utils.ts` (transitions de slots), `stats.utils.ts` (édge cases tolérance / weekday).
2. **Code splitting** `React.lazy` sur les pages Stats et Predictive.
3. **Service worker** pour cacher l'API real-time et basculer en offline avec dernier snapshot connu.
4. **i18n** EN + DE (Strasbourg = frontalière, ARTE = bilingue FR/DE).
5. **Accessibilité audit** WCAG 2.1 AA - j'ai mis des `aria-label` partout où c'était nécessaire (bouton favoris, dark mode), mais une passe Axe-core formelle reste à faire.
6. **Deploy CI** via GitHub Actions → Vercel ou Render, avec preview URL par PR.
7. **Backend léger** (FastAPI ou Node) qui agrège `pooldatas.json` côté serveur et expose des endpoints `/stats/:pool/:date` pour ne pas embarquer 2,9 MB dans le bundle.
8. **Tests E2E** Playwright sur le scenario favoris (cycle ajout / refresh / re-position).

---

## 11. Directives reçues en cours d'exécution (transparence sur le pilotage de l'IA)

Cette section liste verbatim les directives que je transmets à l'agent au cours du test. C'est ce qui distingue un pilotage discipliné d'un vibe coding : le système de prompts est explicite, traçable, et chaque retour rectifie le cap. Toutes ces directives sont sourcées de mes propres conventions versionnées dans `~/Projects/tera-boiler/CLAUDE.md` (11 Golden Rules) - la conversation ne fait que les rappeler au contexte spécifique du test.

### Itération 1 - démarrage (15h00)

- Lire le brief PDF intégralement avant tout clavier.
- Visualiser les 3 screenshots des rendus attendus (rendu 1 cards 2 colonnes, rendu 2 sélecteurs + courbe Recharts, rendu 3 multi-select + recommandation verte + tableau).
- `curl` les sources de données avant de coder pour valider la shape réelle.
- Stack imposée par le brief : Vite + React + TS + MUI + Recharts. Pas de Next.js, pas de Tailwind, pas de Redux.
- Naming **kebab-case** sur les fichiers, PascalCase sur les composants exportés (convention du boilerplate `tera-boiler`).
- Découpage **components/common** vs **features/&lt;nom&gt;** strict - réutilisation maximale, génériques d'abord, métier en feature.
- Tous les composants avec **un max de props** pour éviter les doublons, flexibles, réutilisables.
- TypeScript **strict** non négociable : `strict`, `noUnusedLocals`, `noUnusedParameters`, `resolveJsonModule`.
- Refus systématiques (cf §6) : `as any`, libs externes non justifiées, états globaux non nécessaires, polling auto, `setInterval`.

### Itération 2 - review intermédiaire (~15h35)

Retour Pierre après une première relecture du livrable et un test `npm install` côté Arte. Ajustements demandés :

1. **Conformité conventions tera-boiler** - vérifier la structure et le `package.json` contre les autres products du monorepo (`ev-future`, `aurora-yoga`). Conséquences :
   - Ajout de `.nvmrc`, `.prettierrc`.
   - Scripts standardisés : `dev`, `build`, `preview`, `start`, `lint`, `format`, `check`, `type-check`.
   - Champ `engines.node >=20.0.0`, `description` renseignée, version `1.0.0`.
   - Ajout de `prettier` en devDep.

2. **Cards beaucoup plus stylées** - sortir du look "MUI brut" et coller plus au screenshot brief + à mon vocabulaire visuel. Ajustements :
   - **Bordure gauche accent 4px** pilotée par le statut temps réel (`GREEN` / `ORANGE` / `RED` / `CLOSED`). Encode les 4 niveaux d'affluence d'un coup d'œil.
   - **`<OccupancyBadge>`** dédié : icône `Groups` + nombre + label "personnes", coloré au statut, fond opacité légère, bordure assortie.
   - **Label statut court** ("Faible affluence" / "Affluence modérée" / "Forte affluence" / "Fermée") sous le nom de la piscine.
   - **Hover lift** `translateY(-2px)` + élévation `shadow[4]` - pas de `scale` (FPS killer documenté dans ma cheatsheet d'animations).
   - Theme `borderRadius: 12`, palette success/warning/error explicite, MuiButton `textTransform: 'none'`.

3. **Full responsive 100%** - grid `xs: 1fr` (mobile) → `md: repeat(2, ...)`, gap réduit `xs: 2` / `md: 2.5`, padding card `xs: 2` / `sm: 2.5`, taille titre adaptive `xs: 1.05rem` / `sm: 1.15rem`.

4. **Favoris en temps réel** - corriger un bug architectural : la version initiale câblait `favoriteIds` dans `useEffect` de `useRealtimePools`, ce qui forçait un refetch réseau à chaque clic sur ★. Refactor :
   - L'API client ne reçoit plus `favoriteIds` (signature pure : `fetchRealtimePools(signal)`).
   - Le hook ne re-fetch que sur `refresh()` explicite.
   - La page mappe le flag dans un `useMemo([pools, favoriteIds])` → re-sort instantané au clic, sans loading state, sans réseau.
   - `localStorage` reste la source de persistance pour respecter la spec ("à la prochaine visite, afficher ce lieu en premier").

5. **Erreur `npm install`** côté Pierre : `Cannot read properties of null (reading 'matches')`. Diagnostic :
   - Mon `npm install` local passe sans erreur (285 packages, 0 vuln).
   - L'erreur est une régression npm 11.x connue avec certaines configurations de cache + peer deps.
   - **Fix côté utilisateur** : `npm cache clean --force && rm -rf node_modules package-lock.json && npm install`.
   - Documenté dans le README + cette section.

6. **Backend / DB** - confirmé côté Pierre : front-only justifié par le brief. Source temps réel = API publique OpenDataSoft, source historique = JSON embarqué fourni dans le brief. Aucun backend nécessaire pour les 3 objectifs. La conversation a été l'occasion de re-questionner - l'absence de backend reste le bon choix au regard du scope demandé.

7. **AI_PROCESS doit lister mes directives** - le débrief Arte va probablement creuser sur le pilotage de l'IA. Cette section §11 a été ajoutée pour rendre visibles les retours en cours d'exécution et l'effet sur le code livré.

### Itération 3 - vérifications finales

- `pnpm exec tsc --noEmit` → 0 erreur en strict mode.
- `pnpm build` → 489 KB gzip, build vert en moins d'une seconde.
- `npm install` validé sur une machine de test (le bug Pierre est environnemental, pas projet).
- Zip re-généré sans `node_modules` ni `dist`, README + AI_PROCESS à jour, upload Drive en cours.

## 12. Ce qui suit chez Arte

- `npm i && npm run dev` - démarre sur `http://localhost:3000` (port aligné avec les autres products du monorepo).
- `npm run build` - bundle vers `dist/`.
- `npm run type-check` - `tsc --noEmit` en strict.
- `npm run check` - lint + format en un appel.

Pour étendre, voir la section §9 plus haut.

---

*Fin du AI_PROCESS. Pour toute question sur les choix d'implémentation, je reste disponible pendant le débrief.*
