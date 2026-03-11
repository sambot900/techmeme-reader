# Techmeme Reader — Copilot Instructions

## Code Quality

- Write extensible, maintainable, readable code. No band-aid fixes. If a fix doesn't fit the existing architecture, refactor the architecture.
- Prefer the simplest correct solution. Do not over-engineer or add abstractions for hypothetical future needs.
- After completing an implementation, review it for: redundancy, compatibility with existing structures, reliability edge cases, and performance.
- Never duplicate logic that already exists elsewhere in the codebase — find and reuse it.

## Development Practice

- Consider user experience at every implementation decision — loading states, error states, empty states, and fallbacks are not afterthoughts.
- Anticipate and mitigate performance problems: avoid unnecessary re-renders, avoid fetching data that's already cached, avoid blocking the main thread.
- New implementations must maximally reuse existing store shape, types, and utility patterns before introducing new ones.

## Stack

| Layer | Choice |
|---|---|
| Framework | Expo SDK 52 (managed), TypeScript |
| Navigation | React Navigation — Drawer (7 sections) + Stack (article detail) |
| State | Zustand (no persist on feed cache; persist settings + saved) |
| Persistence | AsyncStorage via Zustand persist middleware |
| HTTP | axios |
| HTML parsing | node-html-parser |
| Article extraction | Mozilla Readability.js via hidden WebView |
| In-app browser | react-native-webview |

## Project Structure

```
src/
  api/          techmeme.ts — feed fetching (verified selectors)
                extractor.ts — ExtractionResult type definition
                readabilitySource.ts — Readability.js source inlined for WebView injection
  components/   ArticleCard, ArticleList, ReadabilityExtractor
  navigation/   AppNavigator (drawer + stack), DrawerContent
  screens/      TopNews, Newest, MoreNews, River, Events, Saved, Settings, Article,
                ClusterSources
  store/        articlesStore — feed cache per section (not persisted)
                contentStore — extraction queue + reader content keyed by article ID (not persisted)
                savedStore — bookmark records (persisted)
                settingsStore — user preferences (persisted)
  theme/        colors (light/dark), text size scale, accent palettes, font families
  types/        all shared types
```

## Key Types

- `TechmemeSection` — `'top' | 'newest' | 'more' | 'river' | 'events'`
- `TextSize` — `'small' | 'medium' | 'large' | 'xlarge' | 'huge'`
- `AccentColor` — `'blue' | 'purple' | 'green' | 'amber' | 'red' | 'teal'` — user-selectable primary accent; each value has its own secondary and tertiary in `ACCENTS` (theme/index.ts)
- `FontFamily` — `'system' | 'serif' | 'monospace' | 'condensed'` — maps to platform font strings in `FONT_FAMILIES` (theme/index.ts)
- `ArticleView` — `'reader' | 'browser'`
- `ExtractionStatus` — `'pending' | 'loading' | 'success' | 'failed' | 'restricted'`
- `ArticleSummary` — what the feed list renders (title, url, source, timestamp, relatedLinks)
- `RelatedLink` — one source's coverage of the same story: `{ title, url, source }`. Each entry in `ArticleSummary.relatedLinks` is a different news outlet's headline for the same cluster.
- `ArticleContent` — extracted reader text, keyed by article ID, fetched on demand
- `SavedArticle` — minimal bookmark record (id, title, url, source, savedAt); never a full snapshot

## Key Methodology

**Article identity:** IDs are derived from the article URL only — never the section. The same story appearing in multiple sections resolves to the same ID so content cache and saved state are consistent.

**Separation of concerns:** Feed data (`ArticleSummary`) and reader content (`ArticleContent`) are separate types stored in separate stores. The feed list never carries extraction state.

**Store reads:** Use Zustand selectors at the call site (`useArticlesStore(s => s.articles[section])`). Do not add read methods to stores — that bypasses selector memoization.

**Saved articles:** `savedStore` holds `SavedArticle` — a lightweight reference. It does not snapshot `ArticleSummary` or `ArticleContent`. This prevents stale data.

**Techmeme parsing:** Selectors are verified against live HTML (last checked 2026-03-10). Data sources per section:

| Section | URL | UA | Key selectors |
|---|---|---|---|
| top | `/m` (mobile) | mobile | `ul#top_items` → `a.item.wide` (primary), `a.indented_item.wide` (cluster sources) |
| newest | `/m` (mobile) | mobile | `ul#new_items` → `a.item.wide`; timestamps in `span.ago` |
| more | `/` (desktop) | desktop | `div#botcol1 .itc1` → `a.ourh` for title, `cite` for source, `.di` for cluster sources |
| river | `/river` | mobile | `tr.ritem` → td[0] time, td[1] cite + link |
| events | `/events` | desktop | `.rhov a` → child divs: date / name / location |

Desktop UA is required for More News — the mobile layout doesn't render `#botcol1`. Techmeme serves full server-rendered HTML to both UAs with no bot gate (verified: 200 OK, no Cloudflare/CAPTCHA).

The More News AJAX endpoint (`/m/moreitems.jsp`) requires JSP session state and is not usable from the app.

## Multi-Source Cluster UX

Techmeme displays news in clusters: one primary headline per story, with multiple other outlets' headlines grouped beneath it. This maps to `ArticleSummary.relatedLinks`.

**Feed card:** Each `ArticleCard` shows the primary headline. If `relatedLinks` is non-empty, it renders a "sources" button (e.g. "4 sources") that navigates to `ClusterSources`.

**ClusterSources screen** (`RootStackParamList.ClusterSources: { articleId, section }`):
- Looks up the `ArticleSummary` from `articlesStore(s => s.articles[section])`
- Renders a scrollable list: primary source at top, then each `relatedLinks` entry
- Each row: source name + headline. Tapping navigates to the `Article` screen
- Primary source: `Article({ articleId: summary.id, section })`
- Related source: `Article({ articleId: link.url, section, inlineTitle: link.title, inlineSource: link.source })`
  - `inlineTitle`/`inlineSource` are used by `ArticleScreen` when the article isn't in the feed store

## Article Extraction Architecture

Articles are extracted using Mozilla's Readability.js running inside a hidden off-screen WebView. This approach handles JS-rendered sites (React apps, SPAs) that CSS selectors on raw HTML cannot.

**Flow:**
1. `ArticleScreen` calls `contentStore.fetchContent(id, url)` — synchronous, just enqueues
2. `contentStore` adds to `pendingExtractions: Record<string, string>` (id → url)
3. `ReadabilityExtractor` (mounted in App.tsx root) watches `pendingExtractions`, processes one at a time
4. Hidden WebView loads the URL with full JS execution
5. `injectedJavaScript` runs paywall detection (Schema.org LD+JSON + CSS gate selectors), then Readability.parse()
6. Result posted back via `postMessage` → `completeExtraction(id, result)` updates content store
7. `ArticleScreen` reactively re-renders with extracted text

**Key files:**
- `readabilitySource.ts` — Readability.js source as a string constant (~90KB). Auto-generated from `node_modules/@mozilla/readability/Readability.js`
- `ReadabilityExtractor.tsx` — hidden WebView component, processes queue sequentially
- `contentStore.ts` — manages `pendingExtractions` queue and `content` cache
- `extractor.ts` — defines `ExtractionResult` type (legacy CSS extraction code present but unused)

**Article screen navigation rule:** Every article — whether primary or a cluster source — is opened in the same `Article` screen. It attempts reader extraction first. If extraction fails or is paywalled, it auto-falls back to the in-app WebView. Never navigate to an external browser app — all article URLs open inside the app.

## Visual Display Strategy

- Light and dark theme controlled by `settingsStore.nightMode`; app defaults to **dark mode**
- All colors come from `theme/index.ts` via `useTheme()` — never hardcode colors in components
- Accent color is user-selectable (`settingsStore.accentColor`). Each accent has `primary`, `secondary` (pressed/deep), and `tertiary` (tinted chip/badge backgrounds) in `ACCENTS`
- Font is user-selectable (`settingsStore.fontFamily`): system default, serif, monospace, condensed. Applied via `theme.fontFamily` (a `string | undefined` mapping to platform font strings)
- Font scale controlled by `settingsStore.textSize` (5 levels). `theme.fontSize` exposes: `small`, `body`, `title`, `header`, `large`
- **Header layout:** minimalist bar. Hamburger icon (drawer toggle) at top-left; current page title to its right. No logo, no app name. Header font size is `theme.fontSize.header` — weight and styling at design discretion per font choice
- Article screen has a Reader/Browser toggle; default is controlled by `settingsStore.defaultArticleView`
- Restricted/paywalled articles prompt the user to open in the in-app WebView — never silently fail, never open the system browser
- Loading, error, and empty states are required for every list and async operation
- Settings: feedback → `techmemereader@proton.me`; privacy policy → inline static text; package name → `com.techmemereader`
