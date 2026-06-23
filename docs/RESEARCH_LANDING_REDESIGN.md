# CSUMB Esports — Landing + Research Redesign Plan

> Living reference document for the Landing + Research page redesign.
> Keep this in sync with the implementation; the initial vision lives here so it
> doesn't get lost as the build evolves.

---

## 0. Vision & Guiding Principles
- **Two pages, one site.** Landing = dark, cinematic, product-launch feel
  (Apple/Tesla). Research = dark, airy, museum-case feel. Both share universal
  Header/Footer/typography so they read as siblings.
- **Scroll is the director.** Every major visual change is driven by scroll
  position (scrubbed), not autoplay. Ultra-smooth via Lenis.
- **Premium, minimal, futuristic.** Glassmorphism, soft shadows, subtle glows,
  bold typography, parallax depth.
- **No autoplay "jank."** Videos loop silently; transitions are frame-accurate to
  scroll.

### Confirmed decisions
| Decision | Choice |
|---|---|
| Animation stack | **Lenis (smooth scroll) + GSAP + ScrollTrigger** |
| Test transitions | **Scroll-scrubbed frame sequences** (31-frame IN/OUT folders, AirPods-style) |
| Asset location | **Copy needed subset into `frontend/public/research-assets/`** (self-contained, deployable; excludes 226 MB source clips) |

---

## 1. Confirmed Asset Inventory
| Asset | Location | Count | Use |
|---|---|---|---|
| Box-open hero frames | `Research-Hero-Frames/` | **180** (`ezgif-frame-001…180.jpg`) | Research hero scrub (box opens → items fall) |
| Genesis GX3 photos | `Genesis-Research-Photos/` | **~11** | Research carousel |
| RT | `RT/raw-videos/Reaction-Time-EX.{webm,mp4}`, `RT/Reaction-Time-First-Frame.png`, `RT-Transition-{In,Out}-Frames/` (31 ea) | Landing test 1 |
| GoNoGo | `GoNoGo/raw-videos/Go-NoGo-EX.{webm,mp4}`, `Go-NoGo-First-Frame.png`, `GoNoGo-Transition-{In,Out}-Frames/` (31 ea) | Landing test 2 |
| TaskSwitching | `TaskSwitching/raw-videos/Task-Switching-EX.{webm,mp4}`, `Task-Switching-First-Frame.png`, `TS-Transition-{In,Out}-Frames/` (31 ea) | Landing test 3 |
| Posner-Cueing | `Posner-Cueing/raw-videos/Posner-Cueing-EX.{webm,mp4}`, `Posner-Cueing-First-Frame.png`, `Posner-Transition-{In,Out}-Frames/` (31 ea) | Landing test 4 |
| Heneveld placeholder | `28282b.png` (root) | 1 | Landing test 5 (content TBD — static placeholder, no frame scrub) |

**Spec corrections applied:**
- RT "backup video" path in the brief was a paste of the webm (typo). The real
  `Reaction-Time-EX.mp4` exists and is used as the `<source>` fallback.
- Posner's raw folder is `Posner-Cueing/raw-videos/Posner-Cueing-EX.*`.

---

## 2. Dependency Additions
`frontend/package.json`:
```
"lenis": "^1.x",        # smooth scroll
"gsap": "^3.x"          # ScrollTrigger + core (frame scrubbing, timelines)
```
No other libraries.

---

## 3. Asset Pipeline (copy into `frontend/public/research-assets/`)
Target layout (lowercase, URL-safe, no spaces, 3-digit zero-padded):
```
public/research-assets/
├─ hero/box-frame-001.jpg … 180.jpg          (180)
├─ genesis/01.jpg … 11.jpg                    (~11, renamed)
├─ tests/
│  ├─ rt/
│  │  ├─ raw/Reaction-Time-EX.webm + .mp4 + first-frame.jpg
│  │  ├─ in/frame-001…031.jpg
│  │  └─ out/frame-001…031.jpg
│  ├─ gonogo/   (same in/out/raw structure)
│  ├─ taskswitching/ (TS- prefix folders → in/out)
│  ├─ posner/
│  └─ heneveld/placeholder.png                (copy of 28282b.png)
```
Copy script: `frontend/scripts/copy-research-assets.mjs` (run once).

**Gitignored:** `Esports-Research-Website-Assets/` and the large root `.mp4`
clips so the 226 MB sources never get committed.

---

## 4. Theme System — One Header/Footer, Two Modes

### 4.1 `BaseLayout.astro` gains a `theme` prop
```astro
const { theme = 'dark' } = Astro.props;   // 'dark' | 'light'
<html lang={lang} class={`theme-${theme}`}>
```

### 4.2 `global.css` refactor
- Keep existing `:root` vars (dark) as the default.
- Add `html.theme-light { ... }` overriding the same custom properties:
  - **Dark (landing):** `--bg-primary #071018`, accent blue/cyan, **secondary `#28282b`** per spec.
  - **Light (research):** `--bg-primary #E4E3DF` center, vignettes `#D6D5D1` (top), `#CBCAC6` (bottom), core shadow `#747371`. Text flips to near-black; glass surfaces use white/translucent.
- Header/Footer already use `var(--…)` and adapt automatically.
- Add a reusable `.glass` utility (backdrop-blur, translucent surface, 1px border,
  soft shadow) usable on both themes via vars.

### 4.3 Header nav — add Research link
Add **"Research" → `/research/`** alongside existing links. Header stays universal.

---

## 5. Shared Study Data Model
`frontend/src/data/studyTests.ts` — typed array driving the landing test sections:
```ts
export interface StudyTest {
  id: 'rt' | 'gonogo' | 'taskswitching' | 'posner' | 'heneveld';
  title: string;
  measures: string;
  description: string;
  assets: {
    videoWebm?: string;
    videoMp4?: string;
    poster?: string;
    inFrames: string[] | null;   // 31 paths (null for heneveld)
    outFrames: string[] | null;
    staticImage?: string;
  };
}
```
All 5 test blocks' text are encoded here verbatim.

---

## 6. LANDING PAGE (`src/pages/index.astro`) — Dark Theme

### 6.1 Hero
- Full-viewport. Headline: **"Measure the cognitive and dexterity skills that
  affect YOUR performance."** ("affect" rendered with accent gradient + glow.)
- Floating gradient backdrop, parallax on scroll. Animated scroll cue.

### 6.2 Test Storytelling Section — the centerpiece
One tall scroll container (≈ 5 × viewport height):
- **Left column (scrolling text):** 5 test blocks. Each = title, "measures" glass
  pill, description paragraph. Reveals via GSAP fade/translate.
- **Right column (sticky):** single `position: sticky` stage showing the active
  test visual.

**Right-stage scroll mechanic (GSAP ScrollTrigger, scrubbed):**
1. **Hold** — test `i`'s EX `<video>` loops (muted).
2. **OUT transition** — scrub test `i`'s 31 OUT frames across canvas.
3. **IN transition** — scrub test `i+1`'s 31 IN frames.
4. Loop to Hold for test `i+1`.

**Rendering:** a single `<canvas>`. Per test we preload 62 frames + poster into
`Image` objects; on scroll we draw the right frame (Apple technique — cheap,
buttery).

- **Heneveld (test 5):** no frames → show `28282b.png` static placeholder with a
  glass "Content coming soon" tag; crossfade instead of scrub.
- **Fallback:** if canvas blocked, show poster; transitions degrade to opacity
  fades.

### 6.3 Closing CTA
Glass card: "Take the tests" → `/tests/`, "Explore the research" → `/research/`.

---

## 7. RESEARCH PAGE (`src/pages/research/index.astro`) — Light Theme (NEW)
Background uses the exact gradient spec: radial bright center `#E4E3DF`,
vignettes `#D6D5D1` (top), `#CBCAC6` (bottom), `#747371` core shadows.

### 7.1 Hero — Box Scene (sticky, scrubbed)
- Full-viewport sticky canvas plays the **180-frame** box sequence scrubbed by
  scroll. Frame 1 = closed; mid = opens with light bloom; late = items fall out.
- Cinematic lighting: soft radial glow overlay intensifying with scroll; vignette.
- Parallax depth on items for a 3D feel.
- Scroll range ≈ 2.5–3× viewport.

### 7.2 Explainer Text
Exact copy: Dr. Steven Machek / Cal State Monterey Bay / study title in emphasis
/ 3 body paragraphs / Polar H10 line. Glass card on light bg, dark text.

### 7.3 "Research at GX3" Carousel
Heading + horizontally scrolling strip of the ~11 Genesis photos. Horizontal
scroll driven by vertical scroll (GSAP x-translate) + drag/wheel. Looping feel
via node duplication + seamless reset. Glass frames, soft shadows, hover lift.

---

## 8. Animation Engineering (shared)
- **Lenis** once per page, wired to GSAP:
  ```js
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  ```
- `ScrollTrigger.refresh()` after images/fonts load.
- **Frame preloader:** load all hero (180) + test frames (5×62) as `Image()`
  with a progress bar / skeleton first-frame until ready.
- Respect `prefers-reduced-motion`: disable Lenis smoothing, skip scrubs (show
  first frame + looping video), keep all text accessible.

---

## 9. File-by-File Change List
**New:**
- `docs/RESEARCH_LANDING_REDESIGN.md` (this doc)
- `frontend/src/pages/research/index.astro`
- `frontend/src/data/studyTests.ts`
- `frontend/src/react/islands/SmoothScroll.client.ts`
- `frontend/src/react/islands/LandingTestStage.tsx`
- `frontend/src/react/islands/ResearchBoxScene.tsx`
- `frontend/src/react/islands/Gx3Carousel.tsx`
- `frontend/src/styles/landing.css` + `frontend/src/styles/research.css`
- `frontend/scripts/copy-research-assets.mjs`

**Modified:**
- `frontend/package.json` — add lenis, gsap
- `frontend/src/layouts/BaseLayout.astro` — theme prop
- `frontend/src/styles/global.css` — `.theme-light`, `.glass`, `#28282b`, light header/footer
- `frontend/src/components/Header.astro` — add Research link
- `frontend/src/pages/index.astro` — replace placeholder with Landing
- `.gitignore` — ignore `Esports-Research-Website-Assets/` and root clips

**Untouched:** backend, dashboard, tests, login, leaderboard, test-runner code.

---

## 10. Implementation Order (milestones)
1. Plan + deps
2. Asset copy + gitignore
3. Theme system
4. Shared infra (SmoothScroll, preloader, studyTests.ts)
5. Research page
6. Landing page
7. Polish (reduced-motion, fallbacks, responsive, performance)

---

## 11. Out of Scope / Risks
- **Asset weight:** 180 + 310 test frames + 5 videos. Mitigate with JPG,
  lazy section-wake, first-frame posters until preload completes.
- **Heneveld content missing** — placeholder only; flagged for later swap-in.
- **Carousel "looping"** — node duplication + reset; not infinite but feels
  continuous.
- **No new routing lib** — `/research/` is a new `pages/research/index.astro`.
- **Browser video format:** each `<video>` provides both `webm` and `mp4`
  sources + poster fallback.
