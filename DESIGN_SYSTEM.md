# MediTrack Design System Documentation

Welcome to the **MediTrack Design System**. This comprehensive documentation establishes the foundational visual language, UI components, interaction patterns, design tokens, and accessibility standards for the MediTrack patient portal and healthcare management suite.

---

## 1. Design Philosophy

The MediTrack Design System is built upon core principles tailored specifically for healthcare software. Healthcare applications must inspire confidence, reduce cognitive load, and provide clear, empathetic user experiences for patients and healthcare providers alike.

### Patient-Centred Design
Every design decision prioritises patient needs, emotional states, and comfort. Patients visiting MediTrack may be stressed, unwell, or anxious. Interfaces must offer reassurance, clear calls-to-action, intuitive navigation, and transparent feedback.

### Accessibility and Inclusivity
MediTrack strictly adheres to **WCAG 2.2 AA** accessibility guidelines. Healthcare is a universal human need; our software must accommodate users with varying physical, visual, auditory, cognitive, and age-related abilities.

### Simplicity and Clarity
Avoid clutter, medical jargon, and overly complex visual layouts. Information hierarchy is enforced through deliberate typography, generous whitespace, and structured layouts to ensure users quickly find what they need.

### Trust, Privacy, and Professionalism
Visual styles communicate security and privacy through calm, healthcare-inspired color palettes, restrained typography, and clean surface cards. The UI never uses sensationalised elements, fake badges, or manipulative dark patterns.

### Mobile-First and Responsive Design
Recognising that many patients access services via smartphones or tablets, all components and pages are architected mobile-first, ensuring full functionality and touch-friendly targets across all device sizes.

---

## 2. Brand Identity

### Application Name
**MediTrack** — Patient Appointment and Health Information System.

### Brand Personality and Tone of Voice
- **Calm & Reassuring:** Uses empathetic, clear, and reassuring language that alleviates user anxiety.
- **Clear & Direct:** Avoids ambiguous terminology or dense medical jargon. Instructions and guidance are easy to comprehend.
- **Professional & Secure:** Maintains an authoritative yet approachably human tone, reinforcing data protection without overwhelming users with legalistic jargon.

### Visual Principles
- **Safety & Calm:** Restrained palettes featuring deep teals, slate blues, and soft neutrals.
- **Structure & Order:** Consistent spacing grids and clear visual separation using subtle borders and soft elevated shadows.
- **Clarity & Legibility:** Highly legible sans-serif typography with generous line heights and distinct contrast.

---

## 3. Colour Palette

MediTrack utilizes a restrained, healthcare-tailored color palette. Every color is defined with exact HEX values and semantic usage rules. All background and foreground color pairings comply with **WCAG 2.2 AA** contrast requirements (minimum 4.5:1 for standard text, 3:1 for UI controls and large text).

### Primary Colours
- **Primary 700 (`#0d5c75`):** Deep Teal (Dark) — Used for active state, hover on primary buttons, dark headings.
- **Primary 600 (`#0e7490`):** Ocean Teal (Main) — Brand primary color. Used for primary buttons, active navigation states, key interactive controls, and header accents.
- **Primary 100 (`#e0f2fe`):** Soft Sky Blue — Used for primary button focus rings, active light backgrounds, and highlighted tab containers.
- **Primary 50 (`#f0f9ff`):** Ice Blue Tint — Light background tint for primary cards or highlighted sections.

### Secondary Colours
- **Secondary 700 (`#1e3a8a`):** Slate Navy (Dark) — Used for secondary accents and dark text contrast.
- **Secondary 600 (`#2563eb`):** Royal Slate Blue — Used for secondary interactive links, active tab indicators, and informational iconography.
- **Secondary 100 (`#dbeafe`):** Soft Blue Tint — Background for secondary badges and subtle interactive hovers.

### Neutral Background & Surface Colours
- **Page Background (`#f8fafc`):** Very light cool gray — Main app background.
- **Surface / Card Background (`#ffffff`):** Pure white — Used for form cards, containers, modal dialogs, and elevated sections.
- **Surface Muted (`#f1f5f9`):** Slate light gray — Used for table headers, inactive container backgrounds, and section dividers.

### Text Colours
- **Text Primary (`#0f172a`):** Slate 900 — Used for primary headings, body text, and high-emphasis labels. Contrast ratio > 12:1 against white.
- **Text Secondary (`#475569`):** Slate 600 — Used for supporting body text, form field labels, and descriptions. Contrast ratio > 7:1 against white.
- **Text Muted (`#64748b`):** Slate 500 — Used for helper text, placeholder text, captions, and footer links. Contrast ratio > 4.5:1 against white.
- **Text Inverse (`#ffffff`):** Pure white — Used for text inside primary dark buttons and solid alert badges.

### Border Colours
- **Border Default (`#cbd5e1`):** Slate 300 — Standard borders for inputs, cards, and quiet dividers.
- **Border Focus (`#0e7490`):** Primary Teal — Border outline color when inputs or controls receive focus.
- **Border Subdued (`#e2e8f0`):** Slate 200 — Subtle horizontal dividers and secondary card borders.

### Feedback & Status Colours
- **Success (`#15803d` / Background `#f0fdf4` / Border `#bbf7d0`):** Green — Form success, verified status, confirmed appointments.
- **Warning (`#b45309` / Background `#fffbeb` / Border `#fef3c7`):** Amber — Cautionary messages, pending verifications, session timeout notices.
- **Error (`#b91c1c` / Background `#fef2f2` / Border `#fecaca`):** Crimson Red — Validation errors, login failures, destructive actions.
- **Information (`#1d4ed8` / Background `#eff6ff` / Border `#bfdbfe`):** Sapphire Blue — Informational alerts, security guidance notes, system updates.

### State Variations Summary
| State | Primary Button | Text Input Border | Link |
| :--- | :--- | :--- | :--- |
| **Default** | `#0e7490` | `#cbd5e1` | `#0e7490` |
| **Hover** | `#0d5c75` | `#94a3b8` | `#0d5c75` |
| **Focus** | Outline `#0e7490` + ring `#e0f2fe` | `#0e7490` + ring `#e0f2fe` | Outline `#0e7490` |
| **Active** | `#083344` | `#0e7490` | `#083344` |
| **Disabled** | `#94a3b8` (Bg `#e2e8f0`) | `#e2e8f0` (Bg `#f8fafc`) | `#94a3b8` |

---

## 4. Typography

MediTrack uses a clean, modern, screen-optimised sans-serif font stack prioritizing legibility across mobile and desktop display displays.

### Font Family
`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`

### Heading Hierarchy
- **Heading 1 (`H1`):** `2.0rem` (32px), Weight: `700` (Bold), Line height: `1.25`, Tracking: `-0.02em`. Used for primary page title.
- **Heading 2 (`H2`):** `1.5rem` (24px), Weight: `600` (SemiBold), Line height: `1.3`, Tracking: `-0.01em`. Used for section headings and modal titles.
- **Heading 3 (`H3`):** `1.25rem` (20px), Weight: `600` (SemiBold), Line height: `1.35`. Used for card headers and fieldset titles.
- **Heading 4 (`H4`):** `1.125rem` (18px), Weight: `600` (SemiBold), Line height: `1.4`. Used for subsection headings.
- **Heading 5 (`H5`):** `1.0rem` (16px), Weight: `600` (SemiBold), Line height: `1.4`. Used for small card titles or group labels.
- **Heading 6 (`H6`):** `0.875rem` (14px), Weight: `600` (SemiBold), Line height: `1.4`. Used for inline widget headers.

### Body Text, Labels, and Captions
- **Body Large:** `1.125rem` (18px), Weight: `400` (Regular), Line height: `1.6`. Used for introductory text and lead paragraphs.
- **Body Base:** `1.0rem` (16px), Weight: `400` (Regular), Line height: `1.5`. Default text for body paragraphs and descriptions.
- **Body Small:** `0.875rem` (14px), Weight: `400` (Regular), Line height: `1.5`. Used for helper text, subtle notes, and table content.
- **Form Labels:** `0.875rem` (14px), Weight: `600` (SemiBold), Line height: `1.25`. Associated with form controls.
- **Captions & Legal:** `0.75rem` (12px), Weight: `400` (Regular), Line height: `1.4`. Used for copyright notes and small print.

### Mobile Typography Guidelines
- Base font size is capped at `16px` on mobile to prevent automatic zooming behavior in mobile iOS browsers when focusing inputs.
- Minimum line height for body paragraphs is `1.5` to ensure comfortable reading distance on narrow mobile displays.

---

## 5. Spacing and Layout

### Spacing Scale
MediTrack utilizes an 8-point spatial system (with 4px sub-grid for fine details) to ensure optical alignment and vertical rhythm:
- `space-1` (`4px` / `0.25rem`): Extra micro spacing (input padding, badge gaps).
- `space-2` (`8px` / `0.5rem`): Micro spacing (label-to-input gap, icon spacing).
- `space-3` (`12px` / `0.75rem`): Small spacing (compact card padding, button icon gaps).
- `space-4` (`16px` / `1.0rem`): Base spacing (standard field spacing, internal card padding).
- `space-5` (`20px` / `1.25rem`): Medium spacing (component gap).
- `space-6` (`24px` / `1.5rem`): Large spacing (card padding, form group gap).
- `space-8` (`32px` / `2.0rem`): Extra large spacing (section margins).
- `space-12` (`48px` / `3.0rem`): Major section gaps.
- `space-16` (`64px` / `4.0rem`): Page layout container padding.

### Layout Grid and Content Widths
- **Form / Auth Container:** Max-width `460px` (centred). Ideal for single-column sign-in, registration, and password reset workflows.
- **Standard Content Area:** Max-width `800px` (centred). Ideal for articles, patient health summaries, and multi-step forms.
- **Full Portal Container:** Max-width `1200px` (centred). Designed for multi-column dashboards and appointment lists.

### Breakpoints
- **Mobile (`xs` / `sm`):** `< 640px` (Single column layout, edge-to-edge cards with 16px horizontal margins).
- **Tablet (`md`):** `640px - 1024px` (Fluid layouts, 24px margins, balanced dual-column where applicable).
- **Desktop (`lg` / `xl`):** `> 1024px` (Centered fixed max-width containers with spacious multi-column layouts).

### Border Radius Scale
- `radius-sm` (`4px` / `0.25rem`): Badges, small tags.
- `radius-md` (`8px` / `0.5rem`): Buttons, form inputs, alerts.
- `radius-lg` (`12px` / `0.75rem`): Cards, containers, main portal frames.
- `radius-full` (`9999px`): Pill badges, rounded avatars.

### Border Widths & Shadow Styles
- **Border Thin:** `1px solid var(--color-border-default)`
- **Border Focus:** `2px solid var(--color-primary-600)`
- **Shadow Subdued (`shadow-sm`):** `0 1px 2px 0 rgba(15, 23, 42, 0.05)` — Form inputs and quiet buttons.
- **Shadow Card (`shadow-md`):** `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)` — Default cards and login boxes.
- **Shadow Elevated (`shadow-lg`):** `0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.05)` — Dropdowns and modals.

---

## 6. Design Tokens (CSS Custom Properties)

These custom properties form the foundation of our design system stylesheet (`styles.css`). When transitioning to TypeScript (e.g., React/Vue/Tailwind), these tokens can be exported directly as JSON or TypeScript constants.

```css
:root {
  /* Primary Palette */
  --color-primary-700: #0d5c75;
  --color-primary-600: #0e7490;
  --color-primary-100: #e0f2fe;
  --color-primary-50: #f0f9ff;

  /* Secondary Palette */
  --color-secondary-700: #1e3a8a;
  --color-secondary-600: #2563eb;
  --color-secondary-100: #dbeafe;

  /* Neutral Surface Palette */
  --color-bg-app: #f8fafc;
  --color-bg-surface: #ffffff;
  --color-bg-muted: #f1f5f9;

  /* Text Palette */
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-muted: #64748b;
  --color-text-inverse: #ffffff;

  /* Border Palette */
  --color-border-default: #cbd5e1;
  --color-border-subdued: #e2e8f0;
  --color-border-focus: #0e7490;

  /* Feedback Palette */
  --color-success-text: #15803d;
  --color-success-bg: #f0fdf4;
  --color-success-border: #bbf7d0;

  --color-warning-text: #b45309;
  --color-warning-bg: #fffbeb;
  --color-warning-border: #fef3c7;

  --color-error-text: #b91c1c;
  --color-error-bg: #fef2f2;
  --color-error-border: #fecaca;

  --color-info-text: #1d4ed8;
  --color-info-bg: #eff6ff;
  --color-info-border: #bfdbfe;

  /* Typography */
  --font-family-base: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-size-xs: 0.75rem;     /* 12px */
  --font-size-sm: 0.875rem;    /* 14px */
  --font-size-base: 1rem;      /* 16px */
  --font-size-lg: 1.125rem;    /* 18px */
  --font-size-xl: 1.25rem;     /* 20px */
  --font-size-2xl: 1.5rem;     /* 24px */
  --font-size-3xl: 2rem;       /* 32px */

  /* Spacing Scale */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-12: 3rem;    /* 48px */

  /* Radii */
  --radius-sm: 0.25rem; /* 4px */
  --radius-md: 0.5rem;  /* 8px */
  --radius-lg: 0.75rem; /* 12px */
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(15, 23, 42, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04);
  --shadow-lg: 0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.05);

  /* Touch Target */
  --touch-target-min: 44px;
}
```

---

## 7. UI Component Library

### Primary and Secondary Buttons
- **Primary Button (`.btn-primary`):** Solid background (`--color-primary-600`), white text (`--color-text-inverse`). Min-height: 44px.
  - *Hover:* Background darkens to `--color-primary-700`.
  - *Focus:* Visible 2px outline in `--color-primary-600` with 3px box-shadow glow `--color-primary-100`.
  - *Disabled:* Background `--color-border-subdued`, text `#94a3b8`, `cursor: not-allowed`.
- **Secondary Button (`.btn-secondary`):** White background, border `1px solid var(--color-border-default)`, text `--color-text-primary`.
  - *Hover:* Background `--color-bg-muted`, border `--color-text-muted`.

### Text, Email, and Password Inputs
- **Base Input (`.form-control`):** Padding `0.75rem 1rem`, border `1px solid var(--color-border-default)`, border-radius `var(--radius-md)`. Min-height: 44px.
- **Focus State:** Border changes to `--color-border-focus` (`#0e7490`), `box-shadow: 0 0 0 3px var(--color-primary-100)`.
- **Error State (`.is-invalid`):** Border `--color-error-text` (`#b91c1c`), shadow ring in crimson tint.
- **Password Input:** Wrapped in a relative container with a toggle button positioned inside the right padding edge.

### Labels and Helper Text
- **Label (`.form-label`):** Block level, text size `--font-size-sm`, font-weight `600`, color `--color-text-primary`, margin-bottom `0.375rem`.
- **Helper Text (`.form-text`):** Text size `--font-size-sm`, color `--color-text-muted`, margin-top `0.375rem`.

### Form Validation Messages
- **Error Message (`.invalid-feedback`):** Displays directly beneath the input field with a small warning icon, colored in `--color-error-text` (`#b91c1c`), text size `--font-size-sm`, weight `500`.
- **Requirements List:** Bulleted password criteria list with dynamic checkmarks (valid/invalid indicator states).

### Checkboxes
- **Custom Checkbox (`.form-check-input`):** Dimensions 20px x 20px for touch convenience.
- **Checked State:** Background `--color-primary-600` with white checkmark SVG.
- **Focus Ring:** Consistent 3px focus ring in `--color-primary-100`.

### Links
- **Inline Link (`.link`):** Color `--color-primary-600`, font-weight `500`, underline on hover.
- **Focus:** 2px dotted outline or focus box with high contrast.

### Cards
- **Auth Card (`.auth-card`):** Background white, padding `2rem` (desktop) / `1.5rem` (mobile), border `1px solid var(--color-border-subdued)`, border-radius `var(--radius-lg)`, shadow `var(--shadow-md)`.

### Navigation Bars and Page Headers
- **Header Header Brand (`.app-header`):** Top bar with logo badge, application title, and high-level navigation/back links.
- **Brand Logo (`.brand-logo`):** Deep teal cross/heart symbol with crisp sans-serif "MediTrack" wordmark.

### Alerts and Notifications
- **Alert Banner (`.alert`):** Padding `1rem`, border-radius `var(--radius-md)`, left border `4px solid`.
  - Variants: `.alert-danger`, `.alert-success`, `.alert-info`, `.alert-warning`.
  - Features high-contrast text and icon indicator.

### Badges and Status Indicators
- **Status Badge (`.badge`):** Small inline capsule tag with padding `0.25rem 0.625rem`, border-radius `var(--radius-full)`, bold small text.
- Must include both text label and shape/icon to ensure status is not communicated by color alone.

### Loading Indicators
- **Spinner (`.spinner`):** Accessible rotating indicator with `aria-hidden="true"` and an accompanying visible or screen-reader-only `.sr-only` text ("Loading, please wait...").

### Empty States
- **Empty State Container (`.empty-state`):** Centered layout with muted icon, clear heading, descriptive text, and a primary action button.

### Footer Elements
- **App Footer (`.app-footer`):** Clean background (`--color-bg-app`), subtle top border, containing links to Privacy Policy, Terms of Service, Accessibility Statement, and Simulated Data Disclaimer.

---

## 8. Accessibility (WCAG 2.2 AA Compliance)

1. **Keyboard Accessibility:** All interactive elements (`<button>`, `<a>`, `<input>`) are fully reachable via `<Tab>` key and triggered with `<Space>` or `<Enter>`. Custom focus rings are explicitly styled with high contrast and are never suppressed (`outline: none` without replacement is strictly forbidden).
2. **Semantic HTML5:** HTML elements (`<header>`, `<main>`, `<nav>`, `<footer>`, `<form>`, `<label>`, `<fieldset>`) are used in accordance with standard HTML specifications.
3. **Form Labels & Associations:** Every input control is explicitly connected to its corresponding `<label>` using matching `id` and `for` attributes.
4. **Color Contrast:** All text elements meet or exceed contrast ratios:
   - Normal text (under 18pt): at least 4.5:1 ratio.
   - Large text (18pt or larger, or 14pt bold): at least 3:1 ratio.
5. **Non-Color Status Communication:** All feedback banners, field error states, and badges pair color with text labels or visual icons (e.g. checkmarks, exclamation mark icons).
6. **Touch Target Size:** Interactive controls feature a minimum touch target height and width of `44px x 44px` for mobile usability.
7. **Screen Reader Support:** Form validation errors employ `aria-invalid="true"` and `aria-describedby="error-id"` to ensure screen reader users hear error descriptions upon focus.

---

## 9. Responsive Design

- **Mobile-First Paradigm:** Styles are defined for small screen devices first and progressively enhanced using `@media (min-width: 640px)` and `@media (min-width: 1024px)` media queries.
- **Fluid Layouts:** Card widths scale smoothly on mobile screens using percentage-based widths with `max-width` constraints and CSS flexbox/grid containers.
- **Mobile Touch Enhancements:** Inputs and buttons maintain spacious tap targets, and inputs enforce font sizes of at least `16px` to prevent unexpected mobile viewport zooming.

---

## 10. Interaction Patterns

### Form Submission & Real-Time Feedback
- **Validation Timing:** Form fields validate on form submit or on `blur` after user interaction to avoid premature error flashing while typing.
- **Error Summaries:** On submission failure, an alert banner appears at the top of the card detailing errors, and the first invalid input receives focus.
- **Password Visibility Toggle:** Eye icon button inside the password field dynamically toggles `type="password"` and `type="text"`, updating `aria-label` to "Show password" / "Hide password".

---

## 11. Privacy and Security UX

1. **Transparent Handling:** The interface explicitly communicates how patient data is handled with reassuring microcopy (e.g., "Your connection is encrypted using healthcare-grade security").
2. **Standard Privacy Disclaimer:** Every page header and footer clearly clarifies that MediTrack is an educational prototype:
   > *"MediTrack is an educational prototype using fictional patient data. Do not submit real personal medical information."*
3. **Account Enumeration Prevention:** The Password Recovery workflow displays a standardized confirmation message regardless of whether the entered email exists in the system:
   > *"If an account exists for patient@example.com, password reset instructions have been sent."*
4. **No Sensitive Browser Storage:** No passwords, authentication tokens, or personal medical information are stored in standard `localStorage` or `sessionStorage`.

---

## 12. Implementation & Developer Guidelines

### Token Usage in CSS
Developers must use standard CSS custom properties defined in `styles.css`.
```css
/* Good */
.my-card {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border-subdued);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

/* Avoid hardcoded values */
.my-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
}
```

### Naming Conventions
- Component classes follow clean utility-oriented BEM or standard functional class patterns (e.g., `.btn`, `.btn-primary`, `.form-group`, `.auth-card`).
- Id naming is explicit and kebab-case (e.g., `#email-address`, `#password-toggle`).

### Maintenance & Scalability
When expanding MediTrack into TypeScript and React/Vue components:
1. Map CSS custom properties directly to component library tokens.
2. Maintain HTML semantic structure when crafting JSX components.
3. Retain ARIA accessibility bindings in all interactive frontend controls.
