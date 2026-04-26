---
name: Academic Momentum
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf8'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e2e1ed'
  on-surface: '#191b23'
  on-surface-variant: '#434654'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c5d7'
  surface-tint: '#1353d8'
  primary: '#003fb1'
  on-primary: '#ffffff'
  primary-container: '#1a56db'
  on-primary-container: '#d4dcff'
  inverse-primary: '#b5c4ff'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed01b'
  on-secondary-container: '#6f5900'
  tertiary: '#852b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#ad3b00'
  on-tertiary-container: '#ffd4c5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b5c4ff'
  on-primary-fixed: '#00174d'
  on-primary-fixed-variant: '#003dab'
  secondary-fixed: '#ffe083'
  secondary-fixed-dim: '#eec200'
  on-secondary-fixed: '#231b00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59a'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#802a00'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e2e1ed'
typography:
  display:
    fontFamily: Lexend
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  h1:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  h2:
    fontFamily: Lexend
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
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
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-margin: 16px
  gutter: 12px
---

## Brand & Style

This design system balances the gravity of high-stakes examination prep with the engaging mechanics of modern gamification. The aesthetic is **Modern-Minimalist with a Tactile edge**, specifically optimized for the Nigerian digital landscape where clarity and performance are paramount.

The brand personality is "The Supportive Mentor": authoritative yet encouraging. The UI evokes a sense of progress through a clean, uncluttered interface that utilizes generous whitespace to reduce cognitive load during intense study sessions. To achieve the "gamified but professional" feel, the system uses subtle depth and soft geometry rather than loud, distracting animations. Visual elements are designed to be "low-bandwidth friendly," favoring CSS-based styling, icon fonts, and SVGs over heavy bitmap assets to ensure fast loading on 3G/4G networks.

## Colors

The palette is anchored by a **Trustworthy Primary Blue**, used for core branding and primary actions to instill confidence. **Progression Yellow** is reserved for motivational elements: streaks, XP gains, and "in-progress" states, providing a bright counterpoint to the professional blue. 

**Success Green** and **Error Red** are utilized for immediate feedback during practice tests. The background uses a soft off-white surface to reduce eye strain, while neutrals are strictly cool-toned to maintain a crisp, modern feel. Contrast ratios strictly adhere to WCAG AA standards to ensure readability in high-glare outdoor environments typical for mobile users in Nigeria.

## Typography

This design system employs a dual-font strategy. **Lexend** is used for headlines and progress indicators; its hyper-readable, expanded glyphs are specifically designed to reduce visual stress and improve reading speed—critical for timed exam practice. 

**Inter** serves as the workhorse for body text, questions, and UI labels. It provides a neutral, systematic feel that ensures complex educational content remains the focus. Large font sizes (minimum 16px for body) are prioritized to account for varied mobile screen qualities and to ensure accessible reading distances.

## Layout & Spacing

The layout follows a **Mobile-First Fluid Grid** model. On mobile devices, a 4-column grid is used with 16px side margins. As the viewport scales to tablet and desktop, the system transitions to an 8 and 12-column fixed-width centered container to prevent line lengths from becoming unreadable.

The spacing rhythm is based on a **4px baseline grid**. Padding and margins should always be multiples of 8px (e.g., 16, 24, 32) to maintain vertical rhythm. High-density layouts are avoided; vertical breathing room is prioritized between question blocks to help students focus on one task at a time.

## Elevation & Depth

This design system uses **Tonal Layers and Subtle Ambient Shadows** to create a sense of hierarchy without relying on heavy textures. 

1.  **Level 0 (Base):** The main background (`#F9FAFB`).
2.  **Level 1 (Cards):** White surfaces with a 1px border (`#E5E7EB`) or a very soft, diffused shadow (Offset: 0 2px, Blur: 4px, Color: 4% Black).
3.  **Level 2 (Interactive/Floating):** Higher elevation shadows (Offset: 0 8px, Blur: 16px, Color: 8% Black) used for active state cards or floating action buttons (FABs).

This approach ensures that even on low-contrast screens or in bright sunlight, the structural boundaries of the UI remain visible.

## Shapes

The shape language is **Friendly and Approachable**. A standard corner radius of 8px (`rounded-md`) is used for most components like input fields and small cards. Larger containers, such as lesson modules or modal sheets, use 16px (`rounded-lg`) to emphasize the modern, gamified feel. 

Buttons and progress bars use a fully rounded "pill" shape to signify interactivity and movement. These rounded forms soften the academic nature of the app, making the preparation process feel less like a chore and more like a modern digital experience.

## Components

### Buttons
Primary buttons use the Primary Blue with white text and a pill-shaped radius. Secondary buttons use a light blue tint or a 1px outline. Interactive states (hover/tap) are indicated by a slight darkening of the color rather than complex gradients.

### Cards
Question and Subject cards are the primary vessels for content. They should feature a white background, 1px neutral border, and 16px internal padding. For "Gamified" cards (like achievement unlocks), use a subtle background tint of the Progression Yellow.

### Chips & Tags
Used for subject categories (e.g., "Physics", "English"). These are small, low-height elements with a 12px font size and high-contrast background colors to aid quick scanning.

### Input Fields
Inputs must have a minimum height of 48px to ensure they are "thumb-friendly" on mobile devices. Use a clear 1px border that turns Primary Blue when focused.

### Progress Bars
A signature component for this design system. Use a thick 12px height with rounded caps. The track should be a light neutral, while the indicator uses Progression Yellow or Success Green to visualize completion.

### Practice Mode Elements
- **Timer:** A fixed top-bar element using a monospaced variant of Inter for stability.
- **Option Selectors:** Large, full-width taps targets for A/B/C/D choices, using a 2px border that highlights in Blue when selected.