---
name: Clinical Clarity
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3e4947'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6e7977'
  outline-variant: '#bdc9c6'
  surface-tint: '#006a63'
  primary: '#005c55'
  on-primary: '#ffffff'
  primary-container: '#0f766e'
  on-primary-container: '#a3faef'
  inverse-primary: '#80d5cb'
  secondary: '#216963'
  on-secondary: '#ffffff'
  secondary-container: '#a8ece5'
  on-secondary-container: '#266d68'
  tertiary: '#2d5951'
  on-tertiary: '#ffffff'
  tertiary-container: '#467169'
  on-tertiary-container: '#c5f3ea'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9cf2e8'
  primary-fixed-dim: '#80d5cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504a'
  secondary-fixed: '#abefe8'
  secondary-fixed-dim: '#8fd3cc'
  on-secondary-fixed: '#00201e'
  on-secondary-fixed-variant: '#00504b'
  tertiary-fixed: '#bdece2'
  tertiary-fixed-dim: '#a2d0c6'
  on-tertiary-fixed: '#00201c'
  on-tertiary-fixed-variant: '#224e47'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display:
    fontFamily: Inter
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.005em
  title-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an authoritative, clinical-grade interface engineered for a modern healthcare SaaS public web presence. The visual tone prioritizes immediate trust, operational hygiene, and calm efficiency, communicating the rigor of medical-grade data infrastructure while remaining welcoming to healthcare providers, administrators, and prospective patients.

The aesthetic follows a modern corporate minimalism philosophy enriched with clinical precision. It avoids non-essential decorative flourishes in favor of meticulous alignment, generous negative space, high legibility, and quiet visual confidence. The interface creates an emotional response of security, compliance readiness, and frictionless technological adoption.

## Colors

The palette is anchored by balanced medical tones and high-contrast neutrals designed to satisfy WCAG 2.2 AA accessibility criteria across all interactive states.

### Primary & Functional Roles
- **Primary Teal (`#0F766E`):** Represents core brand actions, primary calls to action, focus rings, and high-priority interactive states.
- **Dark Teal (`#115E59`):** Dedicated to hover and pressed states on primary elements, as well as selected navigation indicators.
- **Light Teal / Accent (`#CCFBF1`):** Applied to active states, selected card highlights, badge backgrounds, and non-distracting visual accents.
- **Surface Canvas (`#F8FAFC`):** The default screen background, providing a sterile, cool-tinted canvas that reduces ocular fatigue.
- **Surface Elevated (`#FFFFFF`):** Applied to cards, popovers, navigation bars, and inputs to create clean spatial hierarchy against the canvas.
- **Subtle Border (`#E2E8F0`):** Used on card perimeters, dividers, and default input outlines to structure content without harsh visual stops.

### Text & Hierarchy
- **Text Primary (`#0F172A`):** Deep slate applied to headers, body titles, and core interface content for maximum readability.
- **Text Secondary (`#475569`):** Subdued slate for supporting descriptions, metadata, unselected links, and captions.

### Status Indicators
- **Success (`#15803D`):** Indicates verified records, system uptime, and completed operational steps.
- **Warning (`#B45309`):** Highlights compliance deadlines, system cautions, and threshold warnings.
- **Error (`#B91C1C`):** Flags validation failures, missing clinical parameters, and critical system alerts.

## Typography

The typography relies entirely on Inter to ensure clean rendering across platforms, clear tabular number alignment, and immediate legibility in high-density clinical and technical data contexts.

- **Headlines:** Use tighter letter-spacing (`-0.02em` to `-0.01em`) and solid line heights to present marketing copy and value propositions authoritatively without breaking layout cadence.
- **Body:** Standardized at 16px (`body-md`) with a generous 1.5 ratio (`24px` line-height) to maintain scanability through detailed health tech specifications.
- **Labels & Microcopy:** Utilize medium weights (`500`) with subtle positive tracking for forms, badges, table headers, and navigation states.

## Layout & Spacing

The layout is built on a responsive 12-column grid system paired with an 8-point base spatial scale.

- **Desktop (>= 1200px):** 12-column grid, max-width of 1280px centered, 24px (`1.5rem`) gutters, and dynamic margins of at least 32px (`2rem`).
- **Tablet (768px - 1199px):** 8-column grid, 20px gutters, and 24px margins. Content reflows into single or two-column component blocks.
- **Mobile (< 768px):** 4-column grid, 16px (`1rem`) gutters, and 16px margins. Complex horizontal arrangements collapse into a vertical narrative stack.

Components strictly adhere to interior spacing derived from the scale tokens (`space-xs` through `space-xl`) to establish dependable rhythm between forms, card interiors, and navigation rails.

## Elevation & Depth

Visual hierarchy uses a hybrid strategy of delicate structural outlines and restrained ambient shadows to maintain a clean, clinical aesthetic:

- **Base Layer (Flat):** Page canvas rests at `#F8FAFC`. Section panels with alternate visual pacing utilize `#FFFFFF` with flat boundaries.
- **Card Tier (Elevation 1):** Elements sit on `#FFFFFF`, bounded by a single 1px solid border of `#E2E8F0`, accompanied by an ambient, diffused shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.03)`.
- **Interactive Hover & Overlay (Elevation 2):** Elevated cards, dropdown menus, and active tooltips expand slightly: `0 10px 15px -3px rgba(15, 23, 42, 0.05), 0 4px 6px -4px rgba(15, 23, 42, 0.03)`, keeping border contrast intact.
- **Modals & Flyouts (Elevation 3):** Urgent clinical prompts and focused forms use: `0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)` over a backdrop tint of `#0F172A` with 30% opacity.

## Shapes

The design system enforces a balanced roundedness tier (`2`), balancing institutional stability with approachable consumer software paradigms:

- **Standard Elements (0.5rem / 8px):** Applied to form fields, primary/secondary buttons, table card wrappers, and individual accordion rows.
- **Containers & Surfaces (1rem / 16px):** Applied to pricing cards, feature showcase tiles, and clinical overview modals.
- **Badges & Micro Indicators (9999px / Full pill):** Applied to system status tags, active filtering tags, and category identifiers.

## Components

### Header & Navigation
- **Desktop:** Fixed top bar with a `#FFFFFF` surface, subtle bottom border (`#E2E8F0`), and backdrop-filter blur. Contains the brand identity, navigation links (Home, About Us, Features, FAQ, Contact) using `body-md` in `#475569` (hovering to `#0F766E`), a text-style "Sign In" button, and a primary "Get Started" button.
- **Mobile:** Fixed 64px header with an accessible hamburger toggle expanding into a full-height sheet on `#FFFFFF`, placing core links and both conversion CTAs in a thumb-friendly sequence.

### Buttons
- **Primary:** Filled `#0F766E`, `#FFFFFF` text, `rounded-md`, 10px 20px padding. Transitions to `#115E59` on hover. Focus state features a 2px ring offset in `#0F766E`.
- **Secondary / Ghost:** Transparent background, 1px solid `#E2E8F0`, `#0F172A` text. Hover shifts to `#F8FAFC` background with a `#0F766E` border.
- **Tertiary / Subtle:** `#CCFBF1` background with `#0F766E` text for low-friction actions within secure dashboards or informational teasers.

### Cards & Surfaces
- Bounded by `#FFFFFF` fill, 1px `#E2E8F0` border, and Level 1 elevation. Internal padding scales with `space-lg` (desktop) and `space-md` (mobile). Top or corner badges sit flush within grid lines.

### Forms & Input Fields
- Built on `#FFFFFF` backgrounds with 1px `#E2E8F0` borders and 8px border-radius. Placeholder text in `#475569` at 60% opacity. Focused inputs transition to a solid `#0F766E` outline with a 3px outer halo in `rgba(15, 118, 110, 0.15)`. Validation errors switch border and text helper to `#B91C1C`.

### Tabs & Accordions
- **Tabs:** Underline style with a 2px active indicator in `#0F766E` and active text in `#0F172A`. Inactive items rest in `#475569`.
- **Accordions (FAQ):** Independent card surfaces or clean bordered rows with `#0F172A` headers that rotate a chevron indicator on toggle, smoothly expanding clinical answer copy in `#475569`.

### Badges & Chips
- Status labels set at `label-sm` with full pill radius, utilizing `#CCFBF1` background with `#0F766E` text for operational tags, and semantic equivalents for warning, error, and success states.

### Footer
- Structured in `#F8FAFC` or `#0F172A` neutral tone with an upper border in `#E2E8F0`. Four-column grid housing company overview, feature taxonomy, regulatory compliance credentials (HIPAA, SOC2 indicators), and legal placeholders (Privacy Policy, Terms of Service, BAAs).