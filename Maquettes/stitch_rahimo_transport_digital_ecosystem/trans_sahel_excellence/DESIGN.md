---
name: Trans-Sahel Excellence
colors:
  surface: '#fff8f7'
  surface-dim: '#f2d3cf'
  surface-bright: '#fff8f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff0ee'
  surface-container: '#ffe9e6'
  surface-container-high: '#ffe2de'
  surface-container-highest: '#fbdbd8'
  on-surface: '#281716'
  on-surface-variant: '#5c403d'
  inverse-surface: '#3f2c2a'
  inverse-on-surface: '#ffedea'
  outline: '#906f6b'
  outline-variant: '#e5bdb9'
  surface-tint: '#bd1119'
  primary: '#b20112'
  on-primary: '#ffffff'
  primary-container: '#d62828'
  on-primary-container: '#fff1ef'
  inverse-primary: '#ffb4ab'
  secondary: '#7c5800'
  on-secondary: '#ffffff'
  secondary-container: '#ffbe39'
  on-secondary-container: '#6f4e00'
  tertiary: '#005d83'
  on-tertiary: '#ffffff'
  tertiary-container: '#0077a6'
  on-tertiary-container: '#ebf5ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ab'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#93000d'
  secondary-fixed: '#ffdea8'
  secondary-fixed-dim: '#fcbb36'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5e4200'
  tertiary-fixed: '#c7e7ff'
  tertiary-fixed-dim: '#83cfff'
  on-tertiary-fixed: '#001e2e'
  on-tertiary-fixed-variant: '#004c6c'
  background: '#fff8f7'
  on-background: '#281716'
  surface-variant: '#fbdbd8'
typography:
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-regular:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-light:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '300'
    lineHeight: '1.5'
  data-table:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  grid-columns: '12'
  gutter: 24px
  margin: 32px
  container-max: 1280px
---

## Brand & Style

The brand identity focuses on reliability, punctuality, and the physical connection of regions. The design system balances the energy of travel with the rigor of logistics. It utilizes a **Corporate / Modern** aesthetic, drawing inspiration from high-end transportation and logistics software to ensure the interface feels robust and high-trust.

The visual language is characterized by clean structural lines, generous whitespace to reduce cognitive load during booking or fleet management, and a deliberate use of color to signal action and status. The tone is professional and authoritative, yet accessible to a broad demographic of travelers.

## Colors

The color palette is anchored by a high-visibility Primary Red, chosen for its association with urgency and movement. The Secondary Yellow serves as a functional highlight, drawing attention to calls-to-action and critical badges without competing with the primary brand color.

For the management back-office, a deep Sidebar Gray (#1E1E2D) provides a high-contrast environment that reduces eye strain for long-duration administrative tasks. Status colors follow international transport standards: Green for availability, Orange for warnings, and Red for occupied or restricted assets.

## Typography

This design system utilizes a dual-font strategy. **Plus Jakarta Sans** (serving as the modern alternative for Poppins) is used for all brand-facing elements, headers, and general UI text to maintain a welcoming and geometric feel. 

**Inter** is reserved strictly for high-density information environments, such as passenger manifests, schedule tables, and financial reporting in the back-office. This switch ensures maximum legibility for numerical data. All typography is implemented in French, with careful attention to character spacing for longer words common in the language.

## Layout & Spacing

The system is built on a 12-column responsive fluid grid. In the public website, content is centered within a maximum container width of 1280px to maintain readability. In the management software, the grid expands to fill the viewport, utilizing the 12-column structure to organize complex dashboard widgets.

A base unit of 8px dictates all padding and margins, ensuring a consistent rhythm. Gutters are fixed at 24px to provide enough breathing room between functional cards and data columns.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Ambient Shadows**. The interface remains primarily flat to emphasize efficiency, with elevation used only to indicate interactivity or focus.

- **Level 0 (Floor):** Light Gray (#F5F5F5) background for the application canvas.
- **Level 1 (Cards):** White (#FFFFFF) surfaces with a soft, diffused shadow (0px 4px 12px rgba(0, 0, 0, 0.05)).
- **Level 2 (Modals/Dropdowns):** Elevated white surfaces with a more pronounced shadow (0px 8px 24px rgba(0, 0, 0, 0.12)) to indicate temporary overlay status.

## Shapes

The shape language is defined by a consistent 12px (0.75rem) corner radius for primary UI containers and cards. This moderate "Rounded" style strikes a balance between a friendly consumer appearance and a structured professional tool.

- **Cards/Containers:** 12px (rounded-lg)
- **Buttons/Inputs:** 8px (rounded-md)
- **Status Badges:** 100px (rounded-full/pill)

## Components

### Buttons
- **Primary:** Solid Red (#D62828) with White text. Used for main actions like "Réserver" or "Enregistrer".
- **Secondary:** Solid Yellow (#F7B731) with Text Gray (#333333). Used for "Modifier" or secondary filters.
- **Ghost:** Transparent background with a 1px Light Gray border for low-priority actions.

### Inputs & Selects
Form fields use a white background with a 1px border (#E0E0E0). On focus, the border shifts to Primary Red with a subtle 2px glow. Labels are always positioned above the field in Inter (SemiBold).

### Data Tables
Tables in the back-office use Inter. Headers are sticky with a Light Gray background. Rows have a subtle hover state (#F9F9F9) to help users track data across wide screens.

### Seat Selection (Plan de salle)
- **Free:** Green (#27AE60) border with light green tint.
- **Occupied:** Solid Danger Red (#E74C3C).
- **Selected:** Solid Primary Red (#D62828) with a white icon.

### Cards
All cards feature the standard 12px radius and a soft shadow. Used for travel search results, bus details, and dashboard analytics modules.