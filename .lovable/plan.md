# Drama Dash Go — Root Cause Audit

No code changes have been made. This is an investigation report with file/line references and proposed fixes for the three reported issues.

---

## Issue 1 — Play button "disappears" / unclickable on desktop after picking an episode

**File:** `src/pages/TitleDetail.tsx`

### Root causes

1. **Hero overlap on desktop (primary cause).**
   `main` uses `-mt-32` (line 191) when `item.backdrop` exists, pulling the entire content grid up under the backdrop hero. On desktop widths, the Play button sits inside the right column of `grid-cols-[260px_1fr]` (line 201) and ends up vertically aligned with the backdrop image (lines 178–186). The backdrop `<div>` has no `pointer-events-none`, and the gradient overlay (`absolute inset-0`) sits in the normal stacking context — so it can intercept clicks on the area where the Play button visually appears, making it look "disappeared/unclickable" especially after the episode-grid render reflows the column height.

2. **Layout reflow when `hasPicked` flips.**
   When an episode is selected, `pickEpisode` (line 137) toggles both `activeEp` and `hasPicked`. This:
   - Removes the helper paragraph at line 290 (`!hasPicked && <p>...`), shrinking the right column.
   - Re-renders the `<Button>` with new label text ("Watch Episode N" vs "Pick an Episode") which has different intrinsic width.
   - The `transition-all` class on the Button (line 270) animates layout properties, briefly making the button visually shift.
   Combined with #1, the button can end up under the backdrop gradient div on desktop after the reflow.

3. **Sticky header z-index vs no z-index on CTA.**
   The header is `z-30` (line 159), the MediaViewer is `z-[60]`. The CTA Button has no explicit `z-index` and lives inside `main` with no positioning context, so it cannot rise above the absolute-positioned backdrop overlay if their stacking contexts intersect.

4. **Tabs `defaultValue="episodes"` + grid height.**
   On desktop the episode grid uses `lg:grid-cols-12` (line 351) which is short vertically; the right column becomes shorter than the left poster column, making the CTA region overlap the `-mt-32` hero zone more severely than on mobile (where columns stack).

### Proposed fixes
- Add `pointer-events-none` to the backdrop wrapper (line 178) and its gradient overlay (line 184). The hero is purely decorative.
- Add `relative z-10` to `<main>` (line 188) so all content sits above the backdrop's stacking context.
- Reduce or conditionally apply `-mt-32` only on `md+` where there is enough hero height, e.g. `sm:-mt-20 md:-mt-32`, OR increase backdrop height on desktop.
- Reserve space for the helper paragraph so toggling `hasPicked` does not reflow (`min-h-[1.25rem]` wrapper around line 290–294).
- Remove `transition-all` from the Button (line 270) — use `transition-colors` to avoid animating layout-affecting properties.
- Optionally add `relative z-10` to the CTA's wrapper div (line 267) as defense-in-depth.

---

## Issue 2 — Same video plays for every title

**Files:** `src/components/MediaViewer.tsx`, `src/components/HlsPlayer.tsx`, `src/lib/api.ts`, `src/lib/mockData.ts`

### Root causes

1. **No per-item HLS source exists.**
   `mapTmdb` (api.ts lines 199–244) and `mapJikan` (lines 263–294) **never set `hlsSrc`**. Only items injected from `mockData` could carry one. So for every TMDB/Jikan item, `item.hlsSrc` is `undefined`.

2. **Universal fallback to a single demo stream.**
   `MediaViewer.tsx` line 13 defines `DEMO_HLS_SRC` (Tears of Steel) and the player passes `src={item.hlsSrc || DEMO_HLS_SRC}` (around line ~310). With no `hlsSrc` on any TMDB/Jikan item, **every title falls back to the same Tears of Steel stream** — exactly the symptom reported. The "trailer" branch only triggers when `ytKey` resolves AND `!hasHls`; if `fetchTrailerKey` returns null (no TMDB videos, Jikan items without YouTube ID, or rate-limit), it silently degrades to the same demo HLS.

3. **`fetchTrailerKey` regex over-restricts Jikan trailers.**
   `api.ts` line 511: `if (item.trailerQuery && /^[A-Za-z0-9_-]{11}$/.test(item.trailerQuery))`. `mapJikan` writes `trailerQuery` as either an 11-char YouTube ID **or** a free-form search string ("title trailer"). The regex correctly filters the search string, but Jikan items without a YouTube ID get no trailer fallback and route to the demo HLS too.

4. **Mock fallback shape.**
   `mockData.MOCK_BY_CATEGORY` items each carry at most one `hlsSrc`. Even when a mock item is shown, all its episodes (1–12) play the same single stream because `hlsSrc` is item-level, not episode-level. The `episode` number is in the `key` (`hls-${item.id}-${episode}`) so the player re-mounts, but the URL doesn't change.

5. **Stale URL is NOT the cause.**
   `HlsPlayer` cleanup is correct (`hls.destroy()`, `removeAttribute('src')`, `video.load()` in `useEffect` return — HlsPlayer.tsx lines 60–69). The `key` prop in MediaViewer forces remount on episode/item change. So the player re-initializes correctly — it's just being handed the same URL every time.

### Proposed fixes
- Make `hlsSrc` optional **per episode**: extend `MediaItem.metadata.episodes[i]` with optional `hlsSrc`, and resolve at play time via `episodes[ep-1]?.hlsSrc ?? item.hlsSrc ?? DEMO_HLS_SRC`.
- Stop falling back to a single global demo stream for unknown items. Instead:
  - If no `hlsSrc` and no trailer key, show the existing "Source unavailable" state from `HlsPlayer` (lines 73–82) rather than playing Tears of Steel.
  - OR rotate through 3–5 distinct demo HLS streams keyed by `hash(item.id) % N` so each title visibly differs.
- For Jikan items, when `trailerQuery` is a search string, surface a "Watch trailer on YouTube" button using `externalUrl` instead of the demo stream.
- Add a small set of working public HLS samples in `mockData.ts` (Mux/Apple/Unified-Streaming test streams) and assign per-episode arrays so episode switches change the URL.
- Optional: add a TMDB `/videos` lookup that returns more than `Trailer|Teaser` (e.g., `Featurette`, `Clip`) before falling back.

---

## Issue 3 — Slow content loading

**Files:** `src/pages/Index.tsx`, `src/lib/api.ts`, `src/components/MediaCard.tsx`/`MediaRow.tsx`, `src/components/TrendingSlider.tsx`

### Root causes

1. **14 parallel queries on initial render with a single loading boundary.**
   `Index.tsx` `ROWS` defines 14 rows and `useQueries` (lines ~95–106) fires all 14 requests on mount in parallel. That itself is fine, but then `initialLoading = rowQueries.some(q => q.isLoading)` (line 110) blocks **every row** from rendering until the slowest one resolves. So the page appears empty until the slowest of 14 endpoints (often Jikan or Open Library, both rate-limited) finishes — perceived as "very slow".

2. **Jikan rate-limit stalls (HTTP 429).**
   Jikan's free tier is ~3 req/s and ~60/min. The home page fires **4 Jikan calls** simultaneously (top/anime, top/manga, seasons/now, manga popular). `safeJson` throws `RateLimitError` on 429 (api.ts lines 150–160) and React Query's default behavior **retries 3 times with exponential backoff**, multiplying latency by up to ~5× when 429s hit. There is no `retry: false` in the query config (Index.tsx).

3. **TMDB direct → proxy fallback doubles latency on failure.**
   `tmdb()` (api.ts lines 163–173) does `direct → if null → proxied`. Any direct failure (network, region block, 401 with bad key) waits for the full timeout before retrying through `corsproxy.io`. With 5–7 TMDB calls on the home page, a single flaky network burst cascades.

4. **Search hydration runs on every search.**
   `searchAll` (api.ts lines 478–495) issues up to 8 extra `/alternative_titles` requests per search, serially awaited via `Promise.all`. If 1+ of those rate-limit, the whole search palette feels frozen.

5. **Image bloat on mobile.**
   Posters use `w500` (api.ts line 133) and backdrops use `w1280` (line 134) regardless of viewport. On the user's current 647px viewport, `w1280` backdrops in `TrendingSlider` are ~3–4× larger than needed. `MediaCard` posters are also delivered at w500 for cards rendered at ~120px wide. There is no `srcset` or DPR-aware sizing.

6. **`staleTime` is reasonable but `gcTime`/retry defaults aren't tuned.**
   Rows use `staleTime: 1000 * 60 * 10` (good) but no `retry`/`refetchOnWindowFocus: false`. Switching tabs triggers full refetches.

7. **Two waterfalls in TitleDetail.**
   `TitleDetail.tsx` runs `fetchRelated` (line 86), then conditionally `fetchLocalizedOverview` (line 96), then in `MediaViewer` `fetchTrailerKey` (line ~310). These are not all parallel — they depend on `item` arriving first (sessionStorage), then trigger sequentially as state hydrates. Acceptable but adds 2× round-trips for regional titles.

### Proposed fixes
- **Remove the global `initialLoading` gate.** Render each row independently with its own skeleton. This is the highest-impact perceived-perf fix.
- **Tune React Query defaults** in `App.tsx` `QueryClient`: `retry: 1`, `refetchOnWindowFocus: false`, `gcTime: 1000*60*30`. For Jikan rows specifically, set `retry: 0` so 429s fail fast to mock fallback.
- **Throttle Jikan**: serialize the 4 Jikan calls behind a small concurrency limiter (1–2 in flight) or stagger by 350 ms; use `queryClient.getQueryData` so a second mount re-uses the first response.
- **Drop the TMDB proxy fallback** since the project already moved to direct CORS — keep the proxy only for `corsproxy.io` retry on explicit network error, not on `null`.
- **Responsive images**: use `w185`/`w342` for cards, `w500`/`w780` for tablet, `w1280` only for desktop hero. Prefer TMDB's `t/p/wXXX` sized to actual rendered width; add `loading="lazy"` and `decoding="async"` on all non-hero images (already present on related cards, missing on row cards/trending hero).
- **Search hydration**: cap alternative-title fetches at top **3** (not 8), and don't `await Promise.all` blocking — fire-and-forget then update via `queryClient.setQueryData` or a separate `useQuery`.
- **Preconnect** to `image.tmdb.org`, `api.themoviedb.org`, `api.jikan.moe` in `index.html` to remove DNS/TLS handshake from the critical path.
- **Code-split** `MediaViewer`/`HlsPlayer` with `React.lazy` so `hls.js` (large) is not in the initial Index bundle.

---

## Summary table

| # | Issue | Primary file(s) | Root cause | Fix complexity |
|---|---|---|---|---|
| 1 | Play button hidden on desktop | `TitleDetail.tsx` | Backdrop overlay intercepts clicks; `-mt-32` pulls CTA under hero; no z-index on CTA | Low |
| 2 | Same video everywhere | `api.ts`, `MediaViewer.tsx`, `mockData.ts` | `hlsSrc` never set by mappers; universal `DEMO_HLS_SRC` fallback; episode-level URLs missing | Medium |
| 3 | Slow loads | `Index.tsx`, `api.ts`, `App.tsx` | Single global loading gate across 14 queries; Jikan 429 retries; TMDB direct→proxy double-latency; oversized images | Medium |

Approve this report to proceed with the implementation phase.
