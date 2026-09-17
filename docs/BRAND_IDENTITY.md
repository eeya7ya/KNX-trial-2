# KNX Club Jordan — Digital Identity

**نادي KNX الأردني**

This is the single source of truth for how the club looks and sounds. Every
value below is what the site actually ships today — pulled from
`app/globals.css`, `app/[locale]/layout.tsx`, `lib/icon-image.tsx` and
`lib/i18n.ts`, not invented for this document.

The machine-readable twin lives at [`brand/identity.json`](../brand/identity.json).
Use that one when you are generating something (a deck, a social card, a
newsletter, a Figma theme, a new component). Use this one when a human needs to
understand *why*.

> **If you change a token, change it in both places** — `app/globals.css` is
> what the site renders, `brand/identity.json` is what everything else reads.

---

## 1. Who we are

|  | |
|---|---|
| **Name** | KNX Club Jordan · نادي KNX الأردني |
| **Short** | KNX Club · نادي KNX |
| **What** | A non-profit professional community for the KNX building & home automation standard in Jordan |
| **Where** | Amman · Jordan |
| **Web** | https://knx-jordan-club.com |
| **Email** | hello@support.knx-jordan-club.com |
| **Standard** | KNX — ISO/IEC 14543-3 |

**Tagline** — Smart buildings · open standard · one community
**الشعار** — مبانٍ ذكية · معيار مفتوح · مجتمع واحد

**One line** — The professional KNX community of Jordan.
**بسطر واحد** — النادي المهني الأردني لمعيار KNX.

---

## 2. Voice

Five rules:

1. **Professional, not promotional.** Say what the club does. Skip superlatives.
2. **Concrete over abstract.** Name the standard, the tool (ETS6), the city, the date.
3. **Arabic is the default voice, English the equal second.** Neither is a
   machine translation of the other — the site ships two hand-written
   dictionaries, and so should anything new.
4. **Short sentences, one idea per line.** The hero is three lines, not a paragraph.
5. **Never imply vendor endorsement.** The club *follows* the open KNX standard;
   it does not speak for KNX Association.

Avoid: *revolutionary, cutting-edge, world-class*, exclamation marks, ALL-CAPS headlines.

The three pillars we come back to: **Local expertise · Global standard · Always current**
(خبرة محلية · معيار عالمي · مواكبة دائمة).

---

## 3. Logo

The mark is `public/KNX_logo.svg.png` — a 1920 × 916 lockup (≈2.1:1): an arc
above, the letters **KNX** below, with a fully transparent band between them.

**Clear space** — free space equal to the height of the *K* on all four sides.
**Minimum width** — 96 px on screen, 25 mm in print.

### Square formats

Do **not** letterbox the wide lockup into a square — it can only ever fill ~45%
of the height and reads as a smudge in a browser tab. Cut at the transparent
band (rows 370–397) and re-stack the two halves with air between them. This is
already implemented in `lib/icon-image.tsx` → `renderIcon()`; call it rather
than re-deriving it.

### On dark

The mark is green + mid-grey + a fairly dark blue X. The grey and green hold up
on the near-black canvas; the blue sinks. So the mark is **lifted, not dimmed** —
`brightness(1.16) saturate(1.08)` plus a faint green halo. Anything carrying the
`.knx-logo` class gets this for free; photographs get the opposite treatment (a
small brightness cut) so they settle into the page.

### Misuse

- Don't recolor, outline, or gradient the mark.
- Don't stretch, rotate, or skew it.
- Don't drop it on a busy photo without a white card behind it — see the
  OpenGraph pattern in §7.
- Don't typeset "KNX Club Jordan" in another face and call it the logo.

---

## 4. Color

### Brand scale — fixed in both themes

| Token | Hex | |
|---|---|---|
| `knx` / `knx-600` | `#00965e` | the green |
| `knx-50` | `#ecfdf5` | |
| `knx-100` | `#d1fae5` | |
| `knx-200` | `#a7f3d0` | |
| `knx-500` | `#00b070` | |
| `knx-700` | `#007a4d` | |
| `knx-800` | `#065f3c` | |
| `knx-900` | `#064e34` | |

### Semantic tokens — these are what you build with

`html.dark` re-points the *same names*, so `bg-canvas`, `text-ink`,
`border-line`, `text-accent`, `bg-cta` … all flip in one step. Markup needs no
`dark:` variants.

| Token | Light | Dark | Role |
|---|---|---|---|
| `canvas` | `#ffffff` | `#0a0f0e` | the page |
| `card` | `#ffffff` | `#111817` | a surface raised off it |
| `subtle` | `#f5f5f5` | `#161f1d` | image wells, hover fills |
| `ink` | `#0a0a0a` | `#e9efec` | primary text |
| `ink-muted` | `#525252` | `#97a5a0` | secondary text |
| `line` | `#e7e7e7` | `#242e2c` | hairlines, dividers |
| `accent` | `#007a4d` | `#3ddc97` | brand green **as text** |
| `accent-strong` | `#065f3c` | `#7cebba` | its hover |
| `accent-soft` | `#ecfdf5` | `#10261f` | tint behind an icon or badge |
| `cta` / `cta-ink` | `#0a0a0a` / `#ffffff` | `#00b070` / `#04130d` | primary button |
| `cta-hover` | `#007a4d` | `#2fd493` | |
| `invert` / `invert-ink` | `#0a0a0a` / `#ffffff` | `#053026` / `#eafaf3` | the one high-contrast panel (Join) |
| `danger` | `#dc2626` | `#f87171` | |

Browser theme color: `#ffffff` light, `#0a0f0e` dark.

### How to spend it — 60 / 30 / 10

- **60%** canvas
- **30%** ink, ink-muted, line
- **10%** green, and only as accent: eyebrows, icons, badges, hover states

Green is never the background of a full page. The single high-contrast panel
uses `invert`, not green. The one place the gradient is allowed to take over is
a social card (§7).

**Contrast** — body text clears WCAG AA 4.5:1 on its surface. Note that raw
`knx` (`#00965e`) does *not* pass at small sizes on white; that is exactly why
`accent` exists at `#007a4d`. Use `accent` for green text.

---

## 5. Typography

| | Family | Applies to |
|---|---|---|
| Arabic | **Cairo** (`--font-cairo`) | `html[dir="rtl"]` |
| Latin | **Inter** (`--font-inter`) | `html[dir="ltr"]` |

Both load through `next/font/google` with `display: swap`.

| Role | Spec |
|---|---|
| Hero | `text-5xl`→`text-6xl`, bold, `leading-[1.02]` |
| Section title | `text-3xl`→`text-4xl`, bold |
| Card title | `text-lg`, semibold |
| Body | `text-base`, `leading-relaxed`, `ink-muted` |
| Eyebrow | `text-xs`, semibold, uppercase *(Latin only)*, wide tracking, `accent` |
| Meta | `text-xs`, `ink-muted` |

- **Never uppercase Arabic.** It has no case, and letterspacing breaks the joins.
  Arabic eyebrows keep sentence case and normal tracking.
- Numerals stay Western (38+, 2026) in both locales.
- Prose caps at `max-w-3xl`.

---

## 6. Layout & motion

Content column `max-w-7xl`, prose `max-w-3xl`. Radii: cards `rounded-2xl`,
pills `rounded-full`, inputs `rounded-xl`, big panels `rounded-3xl`.
Separation is a 1px `line` hairline — shadows are for floating UI only.

**Arabic is RTL and is the default locale** (`/` → `/ar`). Author with logical
properties (`inset-inline`, `ms`/`me`, `text-start`) and Tailwind's `rtl:`
variants. Never `left`/`right`.

Motion is opacity and transform only, and every animation is cancelled under
`prefers-reduced-motion`:

- `.rise` — 8px lift + fade, 0.6s ease-out
- `knx-page-in` — 16px lift + fade, 0.45s `cubic-bezier(0.22, 1, 0.36, 1)`
- theme swap — a circular View Transitions wipe spreading from the pull cord,
  with a 0.4s cross-fade fallback

### The signatures

Four details make an asset read as *this* club rather than a generic green tech brand:

1. **The pull cord.** The dark/light switch is a physical cord hanging off the
   header. It is the one piece of personality — keep it in product screenshots.
2. **Green-tinted dark.** `#0a0f0e`, not pure black, so the green belongs to the
   surface instead of floating on it.
3. **The three-line hero** with the middle line in accent green:
   *Smart buildings, / open standard, / one community.*
4. **The ambient wash** — three soft green radials behind key sections.

---

## 7. Asset recipes

Everything below already exists in the repo; regenerate from source rather than
exporting a PNG by hand.

| Asset | Source |
|---|---|
| Logo | `public/KNX_logo.svg.png` |
| Favicon | `app/icon.tsx` (512px via `lib/icon-image.tsx`) |
| App icons | `app/icon-192`, `app/icon-512`, `app/icon-maskable` |
| Apple icon | `app/apple-icon.tsx` |
| OpenGraph card | `app/[locale]/opengraph-image.tsx` |
| Web manifest | `app/manifest.ts` |
| Tokens | `app/globals.css` |

### Social / OG card — 1200 × 630

The template to copy for any outward-facing card (event announcement, workshop
poster, LinkedIn header):

- Background `linear-gradient(135deg, #064e34 0%, #00965e 100%)`, padding 76
- Logo on a **white card**, `border-radius: 28`, padding `26px 34px`, logo 188 wide
- Title 92 / bold / `#ffffff`, `line-height: 1.02`
- Subtitle 40 / medium / `#d1fae5`
- Footer row 30 / `#a7f3d0` — `knx-jordan-club.com` on one side, `Amman · Jordan` on the other

---

## 8. Using this file

```ts
import identity from "@/brand/identity.json";

identity.color.semantic.light.accent;        // "#007a4d"
identity.voice.tagline.ar;                   // "مبانٍ ذكية · معيار مفتوح · مجتمع واحد"
identity.socialTemplate.background;          // the OG gradient
```

For anything generated outside the codebase — a deck, a proposal, a print
banner, an email template, a prompt to a design tool — hand over
`brand/identity.json` and this document together. Between them they answer
every question about color, type, the mark, and the voice without anyone having
to guess.
