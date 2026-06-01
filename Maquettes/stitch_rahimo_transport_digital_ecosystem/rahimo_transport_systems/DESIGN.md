---
name: Rahimo Transport Systems
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#5b403d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#8f6f6c'
  outline-variant: '#e4beb9'
  surface-tint: '#b91c1c'
  primary: '#93000b'
  on-primary: '#ffffff'
  primary-container: '#b91c1c'
  on-primary-container: '#ffcdc7'
  inverse-primary: '#ffb4ab'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#444749'
  on-tertiary: '#ffffff'
  tertiary-container: '#5c5f61'
  on-tertiary-container: '#d7d9db'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ab'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#93000b'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
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
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The design system for Rahimo Transport is rooted in **Modern Corporate** aesthetics with a focus on reliability, precision, and logistical efficiency. It targets both high-level logistics managers and public-facing passengers, requiring a UI that feels authoritative yet accessible.

The visual direction balances professional stability with technical clarity. It utilizes a refined color palette and high-contrast typography to ensure information density remains legible. The style avoids unnecessary ornamentation, favoring clean lines, structured grids, and subtle interactive feedback to evoke a sense of organized momentum.

## Colors

This design system moves away from bright, medical reds toward a deeper **Oxblood Red (#B91C1C)**, providing a more premium and established feel for a transport leader. 

- **Primary**: Used for core brand elements, primary actions, and critical status indicators.
- **Secondary**: A deep Slate (#1E293B) for sidebars, navigation headers, and strong text contrast in the BackOffice.
- **Surface**: Subtle grays and off-whites provide the foundation for the "Tonal Layering" strategy.
- **Functional**: Standardized success (Emerald), warning (Amber), and error (Red) tones are used, but kept subordinate to the brand's primary red to avoid visual confusion.

## Typography

The typography strategy employs a dual-font approach to separate narrative content from technical data.

1.  **Plus Jakarta Sans**: The workhorse font for all UI text, headings, and interface labels. Its soft curves and high legibility create a welcoming environment.
2.  **JetBrains Mono**: Specifically reserved for technical identifiers, ticket numbers, vehicle IDs, and data tables. This distinction alerts the user that they are looking at specific, copyable, or unique system references.

**Hierarchy Rules:**
- Use `display-lg` exclusively for landing page hero sections.
- `label-caps` is used for table headers and small category tags to maintain a professional, organized look.
- All numerical data in reports should utilize the monospace font for vertical alignment.

## Layout & Spacing

The design system utilizes two distinct layout models:

### 1. Guest Layout (Public)
Focuses on a **Fixed Grid** model. Content is centered with generous vertical padding (`xl`) to create a sense of breathability and ease. 
- **Margin**: 24px (Mobile), 48px+ (Desktop).
- **Alignment**: Centered focus for search bars and booking flows.

### 2. BackOffice Layout (Management)
Focuses on a **Fluid Grid** model to maximize data visibility.
- **Sidebar**: Fixed at 260px.
- **Main Content**: Expands to fill available width.
- **Spacing**: Compact `sm` and `md` spacing to allow for high-density tables and dashboards.

### Responsive Strategy
- **Mobile (<768px)**: 4-column grid.
- **Tablet (768px - 1024px)**: 8-column grid.
- **Desktop (>1024px)**: 12-column grid.

## Elevation & Depth

The design system uses **Tonal Layering** supplemented by subtle shadows to indicate interactivity.

- **Level 0 (Background)**: Solid `#F8FAFC` for BackOffice, or pure white for Guest surfaces.
- **Level 1 (Cards/Containers)**: White background with a 1px border in `#E2E8F0`. No shadow.
- **Level 2 (Interactions)**: When hovered or focused, elements receive a soft, low-opacity shadow (Color: `Primary`, Opacity: 8%, Blur: 12px) to suggest lift.
- **Navigation**: The BackOffice sidebar uses a solid color fill (Secondary) to clearly demarcate the control zone from the work zone.

## Shapes

The shape language is consistently **Rounded** (0.5rem base) to soften the "industrial" nature of transport and logistics.

- **Buttons & Inputs**: 0.5rem (8px) radius.
- **Cards & Modals**: 1rem (16px) radius for a modern, nested feel.
- **Status Tags**: Full pill-shape (9999px) for clear differentiation from buttons.
- **Iconography**: Use Lucide React icons with a `stroke-width` of 2px. Icons must be strictly linear with no fill.
  - **Small**: 16px (inline with text).
  - **Medium**: 20px (standard buttons/navigation).
  - **Large**: 24px (feature callouts).

## Components

### Buttons
- **Primary**: Background `#B91C1C`, text white. 
- **Secondary**: Background transparent, border 1px `#B91C1C`, text `#B91C1C`.
- **Ghost**: Text `#64748B`, background on hover `#F1F5F9`.

### Data Tables (BackOffice)
- Use `JetBrains Mono` for all ID columns.
- Alternating row stripes are not used; favor thin `1px` horizontal dividers.
- Header cells use `label-caps` for high-contrast scanning.

### Forms & Inputs
- Labels use `Plus Jakarta Sans` Bold at 14px.
- Focus state: `1px solid #B91C1C` with a `2px` outer glow in the primary color at 15% opacity.

### Animations (Framer Motion)
- **Page Transitions**: Simple `opacity: 0` to `opacity: 1` over 0.3s.
- **List Items**: Staggered `y: 10` to `y: 0` for dashboard data loading.
- **Loading State**: Use Skeleton Loaders that mimic the shape of the cards/lists using a pulsing shimmer effect (`#E2E8F0` to `#F1F5F9`).
- **Feedback**: Buttons should have a subtle scale-down effect (`whileTap={{ scale: 0.98 }}`) to feel tactile.