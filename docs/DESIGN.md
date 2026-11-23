# Vantage design system

A clean, friendly SaaS look: a cool-gray page, a floating pill navbar, bold navy headlines,
one saturated blue accent, big rounded white cards and outlined pill chips. Everything is driven
from **one place**: CSS variables in `src/styles/tokens.css`, mapped into Tailwind in
`tailwind.config.ts`, and consumed through the shared components in `src/components/`.

## Tokens

| Token                               | Value                             | Tailwind                                           | Use                                                          |
| ----------------------------------- | --------------------------------- | -------------------------------------------------- | ------------------------------------------------------------ |
| `--color-page`                      | `#F7F9FC`                         | `bg-page`                                          | Page background                                              |
| `--color-surface`                   | `#FFFFFF`                         | `bg-surface`                                       | Cards, navbar, inputs                                        |
| `--color-tint`                      | `#EEF3FD`                         | `bg-tint`                                          | Highlight cards, explanation panels, score track             |
| `--color-primary`                   | `#2563EB`                         | `bg-primary`, `text-primary`                       | The one accent: buttons, links, chips, score bars            |
| `--color-primary-hover` / `-active` | `#1D4ED8` / `#1E40AF`             | `hover:bg-primary-hover`                           | Hover/active                                                 |
| `--color-navy`                      | `#0F1F4B`                         | `text-navy`                                        | Headings, strong text                                        |
| `--color-body`                      | `#475569`                         | `text-body`                                        | Body copy                                                    |
| `--color-muted`                     | `#5B6B82`                         | `text-muted`                                       | Helper text (adjusted from `#64748B` to pass AA on the tint) |
| `--color-border`                    | `#DCE3F0`                         | `border-border`                                    | Decorative card edges                                        |
| `--color-border-strong`             | `#7D8AA3`                         | `border-border-strong`                             | Form-field boundaries (≥3:1, WCAG 1.4.11)                    |
| `--color-amber*`                    | `#92400E` / `#D97706` / `#FFFBEB` | `text-amber`, `border-amber-line`, `bg-amber-soft` | "Limited data", "Tight", "Over hours"                        |
| `--color-red*`                      | `#B91C1C` / `#FEF2F2`             | `text-danger`, `bg-danger-soft`                    | Errors, "Exceeds"                                            |
| `--radius-card`                     | 24px                              | `rounded-card`                                     | Cards, footer top                                            |
| `--radius-nav`                      | 24px                              | `rounded-nav`                                      | Navbar                                                       |
| `--radius-input`                    | 14px                              | `rounded-input`                                    | Inputs, selects, textareas                                   |
| `--radius-pill`                     | 9999px                            | `rounded-full`                                     | Buttons, chips                                               |
| `--shadow-soft`                     | `0 8px 30px rgba(15,31,75,.06)`   | `shadow-soft`                                      | Default elevation                                            |
| `--shadow-hover`                    | `0 14px 40px rgba(15,31,75,.10)`  | `shadow-hover`                                     | Hover elevation                                              |
| `--duration`                        | 180ms                             | `duration-brand`                                   | All hover/focus transitions                                  |

Every color also exists as RGB channels (`--rgb-*`) so Tailwind opacity modifiers work (`bg-primary/10`).
Legacy aliases (`ink`, `paper`, `accent`, `line`, `caution`, `alert`) point at the same variables.

### Contrast (WCAG AA, measured)

| Pair                           | Ratio             |
| ------------------------------ | ----------------- |
| Navy on page                   | 15.1:1            |
| Body on page                   | 7.2:1             |
| Muted on white / page / tint   | 5.4 / 5.1 / 4.9:1 |
| Primary on white / page / tint | 5.2 / 4.9 / 4.7:1 |
| White on primary / hover       | 5.2 / 6.7:1       |
| Amber text on amber soft       | 6.8:1             |
| Input border on white / page   | 3.5 / 3.3:1       |

An axe check (`e2e/a11y.spec.ts`) runs WCAG 2.1 AA rules on the landing, compare and planner screens at desktop and 360px.

## Typography

- **Plus Jakarta Sans** (variable, Latin subset only, self-hosted in `public/fonts/`, `font-display: swap`, preloaded in `index.html`).
- Headlines: extrabold, navy, line-height 1.1–1.2, tracking −0.02 to −0.035em. Hero H1 64px desktop / ~34px mobile; section H2 ~42px desktop.
- Body: 16–18px, `text-body`, line-height 1.6. Nav and buttons: semibold.
- Sentence case everywhere. No all-caps labels.

## Layout and spacing

- Content max width 1200px (`max-w-content`), centered, 16px side gutters on mobile.
- Landing sections are separated by 96px (mobile) / 128px (desktop) (`space-y-24 sm:space-y-32`).
- Cards are white on the gray page; highlight cards use the tint.

## Components (`src/components`)

| Component                                                | Notes                                                                                                                                                                                                                                                                                     |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `layout/Navbar`                                          | Floating, sticky, 24px radius, inset 12–24px. Desktop: logo, nav links, help icon, outlined "Log in" + solid "Get started" (or email + "Log out"). Below 1024px: logo + menu button opening a rounded sheet; focus moves into the sheet, Tab is trapped, Escape closes and returns focus. |
| `layout/Logo`                                            | Original wordmark: blue rounded tile with a "V" path and a viewpoint dot, plus "Vantage" in navy.                                                                                                                                                                                         |
| `layout/Footer`                                          | White, rounded top corners, Product / Resources / About columns and the prototype disclaimer.                                                                                                                                                                                             |
| `layout/HelpBubble`                                      | Blue circular button (bottom right, ≥640px) opening a mini FAQ ("How Vantage works", "About the data"). Escape closes and returns focus. On phones it is hidden so it never covers content; help opens from the menu sheet instead.                                                       |
| `layout/TopoBackground`                                  | Landing page only: faint blue animated contour lines that react to the pointer. Static under reduced motion.                                                                                                                                                                              |
| `ui/Button` + `buttonClass()`                            | `primary` solid blue pill (48px, 0 28px padding), `secondary` outlined blue pill, `ghost` text link with underline on hover, `danger`. Lift 1px on hover.                                                                                                                                 |
| `ui/Chip`, `ui/Tag`, `chipClass()`                       | Outlined pill: white fill, 1.5px blue border, navy text. Selected = blue fill, white text, check icon. Wrap in `flex flex-wrap gap-2` for a tag cloud.                                                                                                                                    |
| `ui/Card`                                                | 24px radius, thin border, soft shadow. `tone="tint"` for highlights; `interactive` adds a stronger hover shadow.                                                                                                                                                                          |
| `ui/Field` (`TextField`, `SelectField`, `TextAreaField`) | 48px tall, 14px radius, navy semibold label above, muted helper text, errors in red with an icon and "Error:" for screen readers.                                                                                                                                                         |
| `ui/Notice`                                              | Rounded callout with an icon per tone (info, success, caution, alert).                                                                                                                                                                                                                    |
| `ui/ScoreMeter`                                          | Blue bar on a pale-blue track, navy number. Same color for every value.                                                                                                                                                                                                                   |
| `ui/Badge`                                               | Small pill for status.                                                                                                                                                                                                                                                                    |
| `transparency/DataQualityBadge`                          | Sourced = blue filled check; Limited data = amber info icon; Team estimate = gray dashed outline. Distinct by icon and outline, not color alone.                                                                                                                                          |
| `transparency/ScoreWithExplanation`                      | Score plus a pale-blue sub-panel holding "Driven by", the data-quality chip, the weight and "Why this rating". The only way a rating is rendered.                                                                                                                                         |

## Usage rules

1. Use tokens and shared components; don't hard-code hex values in features.
2. One accent: blue. Status colors (amber, red) always come with an icon and text.
3. Never emphasize one comparison column or catalog card over another (no ranking, no "winner").
4. Copy is descriptive, never prescriptive. The forbidden-phrase test enforces this across `src/`.
5. Motion is subtle: 150–200ms ease on hover/focus, 1px lift on buttons, stronger shadow on cards.
   `prefers-reduced-motion` disables all transitions and animations (the path strip becomes a static wrapped list).
6. Illustrations are inline SVG. Sample people and quotes are fictional and labelled as such.
7. Check every new screen at 360, 768, 1024 and 1440px.
