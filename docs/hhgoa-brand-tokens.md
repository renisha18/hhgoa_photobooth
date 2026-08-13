# HH Goa 2026 — Brand & Design Tokens

Audit of **https://hhgoa.com**, captured 2026-08-13. Reference document only — no
application code changed.

**Method.** Values were sampled from the site's actual served stylesheet
(`/_next/static/chunks/2gpdh40r3s9bj.css`, 40 KB), its rendered markup, its
`@font-face` declarations, and its downloaded image assets. Nothing here is
guessed; anything inferred rather than measured is marked *(inferred)*.

**Stack.** Next.js (App Router) + Tailwind CSS v4 + a shadcn/ui token layer.
Fonts are self-hosted through `next/font`. There is **no public brand-kit
page** — `/brand`, `/press`, `/media` and `/brand-kit` all return 404. The only
other routes are `/radar` and `/terms`.

---

## 1. Color palette

The site defines a shadcn-style semantic token set. Four colors carry the whole
identity; everything else is neutral or inherited Tailwind defaults.

### Core brand colors

| Role | Hex | RGB | Notes |
|---|---|---|---|
| **Brand green** | `#0b6839` | `11, 104, 57` | The dominant color. Page background, cards, borders, inputs, popovers, sidebar. |
| **Brand yellow** | `#fee101` | `254, 225, 1` | Primary accent. Headlines, highlights, focus rings, secondary surfaces. |
| **Brand magenta** | `#ff0080` | `255, 0, 128` | Hot accent. Used sparingly — CTAs, outline offsets, illustration highlights. |
| **Warm cream** | `#fffbe8` | `255, 251, 232` | Soft light surface. Appears mostly at partial alpha. |
| **White** | `#ffffff` | `255, 255, 255` | Default foreground/body text on green. |
| **Black** | `#000000` | `0, 0, 0` | Foreground on yellow; illustration outlines. |

Green and yellow appear 18× each in the stylesheet, white 15×, magenta 9× —
a useful proxy for the intended weighting.

### Semantic tokens, as authored on the site

```css
--background: #0b6839;   --foreground: #fff;
--card: #0b6839;         --card-foreground: #fff;
--popover: #0b6839;      --popover-foreground: #fff;
--primary: #0b6839;      --primary-foreground: #fff;
--secondary: #fee101;    --secondary-foreground: #000;
--muted: #0b6839;        --muted-foreground: #fee101;
--accent: #ff0080;       --accent-foreground: #fff;
--border: #0b6839;       --input: #0b6839;  --ring: #fee101;
--destructive: #dc2626;

--sidebar: #0b6839;            --sidebar-foreground: #fff;
--sidebar-primary: #fee101;    --sidebar-primary-foreground: #000;
--sidebar-accent: #ff0080;     --sidebar-accent-foreground: #fff;
--sidebar-border: #0b6839;     --sidebar-ring: #fee101;

/* charts — confirms the intended brand ordering */
--chart-1: #0b6839;  --chart-2: #fee101;  --chart-3: #ff0080;
--chart-4: #fff;     --chart-5: #ccc;
```

Note `--muted-foreground` is **yellow**, not grey. Secondary text on this site
is yellow-on-green, not a desaturated tint.

### Alpha variants actually used

Rather than mixing new hues, the site steps opacity on the same four colors:

```
#fee101 at 1a / 33 / 4d / 66 / 00     (10 / 20 / 30 / 40 / 0 %)
#ff0080 at 0d / 66                    (5 / 40 %)
#fffbe8 at 40 / 80 / cc / e6          (25 / 50 / 80 / 90 %)
#ffffff at 6 / 9 (i.e. 60 / 90 %)
#000000 at 1a / 26 / 40 / 4d / 59 / 03 / 09
```

### Gap vs. the current mockup

Our app's palette is in the right family but **no value matches**. If we want
"instantly recognizable HH Goa 2026 identity" (their words), these should be
swapped to exact:

| Our current | Brand actual | Δ |
|---|---|---|
| `#063c29` | `#0b6839` | ours is much darker, slightly bluer |
| `#ffdd1f` | `#fee101` | ours is warmer/softer |
| `#ff2b88` | `#ff0080` | ours is desaturated |
| `#fff9e8` | `#fffbe8` | near-identical |
| `#075d3c` / `#0a7b4d` | — | our "Forest" variant has no brand equivalent |

---

## 2. Typography

Two families, both **variable**, both self-hosted.

### Families

| Token | Family | Role | Weights loaded |
|---|---|---|---|
| `--font-imbue` | **Imbue** | Display / headlines | `400` only |
| `--font-victor-mono` | **Victor Mono** | Body, UI, labels — **the default** | `100 700` (variable range) |

```css
--font-imbue: "Imbue", "Imbue Fallback";
--font-victor-mono: "Victor Mono", "Victor Mono Fallback";
--default-font-family: var(--font-victor-mono);
--default-mono-font-family: var(--font-victor-mono);
```

The site is **monospace-first** — Victor Mono is the default body face, not just
a code face. Usage in markup runs roughly 2:1 mono over display (32 vs 16
references). Imbue is reserved for headings and the wordmark.

**Imbue** is a very high-contrast condensed display serif — that thin-and-tall
Didone look. It is what the `Hacker house.png` wordmark is set in.

Fallback metrics are overridden against Arial:
`ascent-override: 81.73%; descent-override: 18.58%; size-adjust: 134.59%`.

### Type scale (sampled `font-size` values)

Dense small end, big jump to display — there is no smooth modular scale.

```
Micro/labels   9px · 10px · 10.5px · 11px · 11.5px
Small UI       12px · 12.5px · 13px · 13.5px · 14px · 14.5px
Body           15px · 16px · 17px
Sub-headings   22px · 24px (--text-2xl: 1.5rem) · 26px · 28px · 30px
Headings       36px · 42px · 44px · 56px
Fluid display  clamp(1.5rem, 4vw, 2.5rem)
               clamp(2rem,  6vw, 4rem)
               clamp(3rem, 12vw, 8rem)   ← hero
```

Most-used sizes in markup: `12.5px` (18×), `16px` (11×), `14px` (11×), `42px` (4×).
The `12.5px` dominance is the monospace label/caption layer.

### Weights

`400`, `500`, `700` (`--font-weight-bold`), `800` (`--font-weight-extrabold`).
Imbue ships at `400` only — its heaviness is a property of the typeface, not the
weight axis. **Do not ask Imbue for 700/900**; it will synthesize.

### Letter-spacing

```css
--tracking-normal: 0em;
--tracking-wide:   0.025em;   /* 12 uses — the workhorse */
0.08em                        /* 1 use  */
0.1em                         /* 3 uses */
```

Wide tracking is applied to the small uppercase monospace labels, which is the
signature move.

### Case

`uppercase` 53×, `capitalize` 18×, `lowercase` 0×. Strongly uppercase-led. No
small-caps anywhere. Body copy inside cards is Title Case (visible in
`tracks.png`).

### Line-height

```css
--leading-tight: 1.25;  --leading-snug: 1.375;  --leading-relaxed: 1.625;
plus literals: 1 · 1.02 · 1.05 · 1.75
```

`1.0`–`1.05` on display headlines (tight, poster-like); `1.625`–`1.75` on body.

---

## 3. Border & shape language

**Mixed, and deliberately so** — pills for interactive chrome, sharp rectangles
for content cards.

```css
--radius: 0.625rem;              /* 10px base */
border-radius: 0                 /* sharp */
border-radius: 4px
border-radius: calc(var(--radius) * .6)   /*  6px */
border-radius: calc(var(--radius) * .8)   /*  8px */
border-radius: 3.40282e38px               /* rounded-full → pills */
```

In markup: `rounded-full` 15×, `rounded-none` 2×, `rounded-md` 2×, `rounded-lg` 2×.
Pills dominate for buttons/chips/tags; the illustrated content cards in
`tracks.png` are **fully sharp-cornered**.

**Border widths:** `1px`, `2px`, `3px`, `4px` (`border-2` is the common one, 7×
in markup). A `4px` left-only border is used for a callout/quote treatment.

**Border style:** solid, plus **dashed** — `border-dashed` appears in both the
stylesheet and markup. Dashed rules serve as the "cut here / ticket" divider.

**Dividers:** the distinctive one is not a CSS rule at all — it's a repeating
**azulejo tile-pattern strip** (Portuguese-Goan ceramic motif) running along the
top and bottom edge of cards. Clearly visible in `tracks.png`. Rendered as
image/SVG, not border CSS.

### Shadows — the strongest signal

Every brand shadow is a **hard offset with zero blur**. This is a
neo-brutalist / sticker aesthetic, and it is the single most copyable detail:

```css
3px  3px  0 rgba(0,0,0,0.15)
4px  5px  0 rgba(0,0,0,0.20)
6px  8px  0 rgba(0,0,0,0.25)
8px 10px  0 rgba(0,0,0,0.25)     /* most prominent, 2× in markup */
0   12px  0 rgba(0,0,0,0.25)
```

Only two soft shadows exist in the entire sheet (`0 1px 3px`, `0 2px 4px`), both
inherited Tailwind defaults rather than brand choices.

Our current mockup already uses hard offsets (`8px 8px 0`, `5px 5px 0`) — this
is the one place we're **already on-brand**.

---

## 4. Spacing rhythm

**Dense and utilitarian, not editorial.** Base unit `--spacing: 0.25rem` (4px).

Observed frequencies: `px-3` (11×), `gap-2` (11×), `px-6` (6×), `py-2` (3×),
`gap-3` (3×), `gap-8` (3×), then singletons at `py-6 / py-8 / py-9 / py-10`,
`px-8 / px-10 / px-20`.

Read: **tight inner padding** (8–12px gaps inside components, 12–24px inline
padding) with **moderate section breathing** (24–40px vertical). Section rhythm
is compact — this is a dense information poster, not a spacious editorial
layout. Containers cap at `--container-3xl: 48rem` / `--container-4xl: 56rem`
(768 / 896px), which is narrow and reinforces the density.

Motion is minimal: `--default-transition-duration: .15s`,
`cubic-bezier(.4, 0, .2, 1)`, with `--ease-out: cubic-bezier(0, 0, .2, 1)`.

---

## 5. Notable graphic elements

**The entire visual system is flat vector illustration.** No photographic
textures, no gradients, no photographic backgrounds anywhere.

- **Illustration style** — flat fills, uniform thin black outlines, no shading
  or gradients. Reads like screen-printed travel-poster art.
- **Motifs** — palm trees, sunrise/sunset disc with straight radiating rays,
  Portuguese-Goan architecture (tiled roofs, louvered shutters in alternating
  pink/yellow/green), bougainvillea and monstera, beach umbrellas, deck chairs,
  scooters, sailboats, signposts, seagulls.
- **Palette discipline** — illustrations use only the four brand colors plus
  black outline and white. Strictly held.
- **Azulejo tile strips** — repeating ceramic-tile borders as card edging. The
  most culturally specific element in the system.
- **Zigzag bunting** — triangular pennant border framing person cards.
- **Devanagari** — `goa_hindi.svg` sets **गोवा** in yellow with a thick offset
  magenta outline. Bilingual identity is part of the brand.
- **Iconography** — simple line icons matching the illustration weight
  (location pin, plus/add). Not a recognizable third-party icon set *(inferred —
  they're Figma-exported one-offs)*.

### How imagery is treated — directly relevant to a builder card

`team.png` is the brand's own **person-card** pattern, and it is the closest
existing analogue to what we're building:

1. Subject photographed against a plain background, **cut out**.
2. Converted to **high-contrast greyscale / black-and-white** — never full color.
3. Placed on a flat **`#fee101` yellow** field.
4. Framed with a **zigzag bunting border** in pink / green / yellow.
5. Captioned below with a small **monospace tag** (`Judge`, `Mentor`) on a
   yellow chip.
6. Card corners are **square**, photo is square-cropped.

That greyscale-on-yellow + zigzag-frame + mono-caption combination is the
house treatment for putting a human on a card.

---

## 6. Downloadable assets

Base path `https://hhgoa.com/assets/`. **187 unique assets** total, but ~175 are
Figma-exported SVG fragments with generated names (`085-frame-1948754909-54-17608.svg`)
— individually meaningless slices of larger compositions. The named assets are
the usable set.

### Named assets

| Asset | URL | Size | Dimensions | Content |
|---|---|---|---|---|
| `Hacker house.png` | `/assets/Hacker%20house.png` | 27 KB | 1148×237 | **Wordmark** — "HACKER HOUSE" in yellow Imbue, subtle offset shadow, transparent bg |
| `goa_hindi.svg` | `/assets/goa_hindi.svg` | 25 KB | 181×180 | **गोवा** yellow w/ magenta offset outline — vector |
| `Sun rise.png` | `/assets/Sun%20rise.png` | 3.2 MB | 1440×1438 | Beach + sunrise + palms + "GOA BEACH" shack |
| `footer trees.png` | `/assets/footer%20trees.png` | 2.3 MB | 1440×887 | Palms + bougainvillea framing an **empty green center** |
| `hackers.png` | `/assets/hackers.png` | 2.1 MB | 1440×804 | Illustrated builders at a long table, Goan facade |
| `details.png` | `/assets/details.png` | 2.0 MB | 1440×937 | Signpost, umbrella, scooter, deck chairs, sailboat |
| `agenda.png` | `/assets/agenda.png` | 2.4 MB | 1440×872 | Agenda section illustration |
| `tracks.png` | `/assets/tracks.png` | 126 KB | 1440×1160 | Card layout w/ azulejo tile borders on yellow |
| `team.png` | `/assets/team.png` | 127 KB | 1282×966 | **Person-card grid — contains a real individual's photo** |
| `sponsor.png` | `/assets/sponsor.png` | 146 KB | 1440×1236 | Sponsor section layout |
| `Bounties.png` | `/assets/Bounties.png` | 55 KB | 1440×973 | Bounties section layout |
| `2-47.svg` | `/assets/2-47.svg` | 32 KB | — | "2:41 PM STUDIO" hand-drawn marker lettering |
| `favicon.webp` | `/favicon.webp` | 36 KB | — | Site icon |
| `019-group-59467-...svg` | `/assets/019-group-59467-54-3485.svg` | 111 KB | 2501×74 | Wide marquee/ticker strip — vector |
| `177-background-...svg` | `/assets/177-background-54-29999.svg` | 206 B | 1440×959 | Flat background rect — trivial |
| `129-location-pin-1-...svg` | `/assets/129-location-pin-1-54-26837.svg` | 804 B | 25×25 | Location pin icon — vector |

### Reusability assessment

**✅ Safe and genuinely useful for a builder card**

- **`footer trees.png`** — the best single candidate. Palms and flowers frame a
  large empty green center, so it works directly as a card background with room
  for a photo and text. No people.
- **`Sun rise.png`** — strong hero/backdrop. Pure environment, no people.
  Nearly square (1440×1438), which suits a portrait-ish card.
- **`goa_hindi.svg`** — vector, tiny, culturally distinctive. Excellent as a
  card badge or corner mark. Scales cleanly to any canvas size.
- **`Hacker house.png`** — the wordmark. Transparent background, so it drops
  straight into a card header. Essential for brand recognition.
- **`details.png`** — decorative props (scooter, umbrella, signpost) that could
  be cropped into individual stickers. No people.
- **`019-group-59467-...svg`** — 2501×74 marquee strip; good as a card edge band.
- **`129-location-pin-...svg`** — usable inline with a "GOA, INDIA" line.

**⚠️ Use with care**

- **`hackers.png`** — figures are *illustrated*, not photographed, so there are
  no personality rights at stake. But they're stylized humans, which may read
  oddly behind a real user's photo. Fine as an ambient background, not as a
  subject.
- **`tracks.png`** — don't reuse as an image; **do** copy its azulejo tile-border
  and sharp-card pattern as a layout reference.
- **`2-47.svg`** — this is the **design studio's own credit mark** ("2:41 PM
  Studio"), not an HH Goa brand asset. Do not put it on a builder card.

**🚫 Do not reuse**

- **`team.png`** — contains a **real, identifiable individual's photograph**
  (repeated as a placeholder across the grid). Clear personality/likeness-rights
  concern. Copy the *treatment* — greyscale on yellow, zigzag frame, mono caption
  — never the pixels.
- **`sponsor.png`**, `Bounties.png`, `agenda.png` — third-party marks and
  page-specific compositions. No value for a card.

**Practical note on weight.** The five large PNGs are 2–3.2 MB each — far too
heavy to ship into a client-side card generator as-is. Any of them would need
downscaling to card resolution and re-encoding to WebP first. `goa_hindi.svg`
and the SVG fragments have no such problem, which argues for favoring the vector
assets.

---

## 7. Font licensing

**Both fonts are free and open-source. No paid license, no legal obstacle.**

| | Imbue | Victor Mono |
|---|---|---|
| Source | Google Fonts | Google Fonts |
| License | SIL Open Font License 1.1 | SIL Open Font License 1.1 |
| Delivery on hhgoa.com | Self-hosted via `next/font/google` | Self-hosted via `next/font/google` |
| Cost | Free, incl. commercial | Free, incl. commercial |
| Weights available | Variable 100–900 | Variable 100–700 (+ italics) |
| Weights they load | 400 only | 100–700 range |

Neither is served from a Google CDN at runtime — `next/font` downloads them at
build time and serves them from `/_next/static/media/*.woff2`, self-hosted and
subsetted. **We can adopt exactly the same approach in our app** with
`next/font/google`, which is what we already do for Archivo. It's a
like-for-like swap, not new infrastructure.

Subsets served: Latin, Latin-Extended, Greek, Cyrillic, Vietnamese. Note that
**neither font covers Devanagari** — the गोवा mark is vector artwork, not live
text, so any Hindi on a card must be an image or a separately loaded font.

*(License names verified from the fonts' standard Google Fonts distribution
terms rather than from a license file served by hhgoa.com — the site ships only
subsetted woff2 binaries.)*

---

## 8. Findings that affect the build

Three things surfaced during this audit that go beyond tokens.

**1. The official task brief is published on the site.** Under
*Build This → Tasks → Task #1, "HH Goa Frame / ID Card Generator"*:

> Design your own HH Goa 2026 themed photo frame generator. **Use that same
> generator to bring your teammates into one combined frame.** Post it on X with
> a quick how-to on generating your own #FrameInGoa post using your generator —
> and you're done.

Stated acceptance criteria:
- Instantly recognizable HH Goa 2026 identity
- 1-click download + 1-click Share to X
- Works on any photo — no manual cropping
- Personalized: name, stack, a generated builder class
- Seconds from upload to shareable output

**2. The combined/team frame is a stated requirement we don't meet.** The app is
single-person only. This is the largest functional gap against the brief, and
it's a bigger scope item than anything in the Phase 1 work.

**3. "Works on any photo — no manual cropping" is worth reading carefully.** It
asks for auto-crop to be good enough that manual work is *unnecessary* — it does
not forbid a manual editor. Our auto-crop still runs by default and the editor
is opt-in, so we satisfy this. Worth confirming rather than assuming.

Separately: our current palette is close-but-wrong on all four brand colors, and
our typography (Archivo) has no relationship to the site's Imbue + Victor Mono
pairing. Both are cheap to correct and both bear directly on criterion #1.
