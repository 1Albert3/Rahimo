# Design System — Rahimo Transport

---

## 1. Creative North Star : "The Kinetic Horizon"

Design system conçu pour transformer le transport interurbain au Burkina Faso en une expérience premium éditoriale. **"The Kinetic Horizon"** incarne le croisement entre mouvement fiable et clarté numérique.

Principes fondateurs :
- **Asymétrie intentionnelle** et **profondeur tonale**
- Architecture **"No-Line"** (pas de bordures 1px)
- Priorité à la typographie contrastée et à la hiérarchie par surfaces
- Éléments qui flottent, se superposent et respirent

---

## 2. Palette Couleurs

Inspirée du Burkina Faso — le Rouge du progrès et l'Or du soleil du Sahel.

### 2.1 Primaires — Rouge

| Token | HEX | Usage |
|---|---|---|
| `primary` | `#b70100` | Couleur principale, éléments actifs, marque |
| `on-primary` | `#ffffff` | Texte/icône sur primary |
| `primary-container` | `#e60000` | Conteneurs, dégradés, hover |
| `on-primary-container` | `#ffcdc7` | Texte sur fond rouge clair |
| `primary-fixed` | `#ffdad6` | Teinte rouge très claire |
| `primary-fixed-dim` | `#ffb4ab` | Teinte rouge moyenne |
| `on-primary-fixed` | `#410002` | Texte foncé sur fond rouge clair |
| `on-primary-fixed-variant` | `#b70100` | Variante texte sur rouge clair |
| `inverse-primary` | `#ffb4ab` | Primaire sur fond sombre |

### 2.2 Secondaires — Or / Jaune

| Token | HEX | Usage |
|---|---|---|
| `secondary` | `#fcd400` | Actions secondaires, badges |
| `on-secondary` | `#1a1c1c` | Texte sur jaune |
| `secondary-container` | `#fff3b3` | Fond jaune clair |
| `on-secondary-container` | `#5c4d00` | Texte sur fond jaune |
| `secondary-fixed` | `#fff8d6` | Jaune pâle |
| `secondary-fixed-dim` | `#f5e6b3` | Jaune atténué |
| `on-secondary-fixed` | `#2e2600` | Texte très foncé sur jaune |
| `on-secondary-fixed-variant` | `#5c4d00` | Texte foncé sur jaune |

### 2.3 Tertiaire (identique au primaire)

| Token | HEX |
|---|---|
| `tertiary` | `#b70100` |
| `on-tertiary` | `#ffffff` |
| `tertiary-container` | `#e60000` |
| `on-tertiary-container` | `#ffffff` |

### 2.4 Erreur

| Token | HEX |
|---|---|
| `error` | `#ba1a1a` |
| `on-error` | `#ffffff` |
| `error-container` | `#ffdad6` |
| `on-error-container` | `#93000a` |

### 2.5 Surfaces

| Token | HEX | Rôle |
|---|---|---|
| `background` | `#ffffff` | Fond principal de la page |
| `on-background` | `#1a1c1c` | Texte sur fond (jamais noir pur) |
| `surface` | `#ffffff` | Surface de base |
| `on-surface` | `#1a1c1c` | Texte sur surface |
| `surface-variant` | `#f3f3f3` | Surface atténuée |
| `on-surface-variant` | `#6b6b6b` | Texte atténué |
| `surface-container-lowest` | `#ffffff` | Couche la plus haute (cartes) |
| `surface-container-low` | `#f9f9f9` | Sectionnement subtil |
| `surface-container` | `#f3f3f3` | Conteneur intermédiaire |
| `surface-container-high` | `#eeeeee` | Zones d'emphase |
| `surface-container-highest` | `#e8e8e8` | Conteneur le plus profond |
| `surface-bright` | `#ffffff` | Surface lumineuse |
| `surface-dim` | `#e8e8e8` | Surface atténuée |
| `surface-tint` | `#b70100` | Teinte de surface (primaire) |
| `outline` | `#d9d9d9` | Bordures subtiles |
| `outline-variant` | `#eeeeee` | Bordures très légères |
| `inverse-surface` | `#1a1c1c` | Surface sombre (navbar, footer) |
| `inverse-on-surface` | `#ffffff` | Texte sur surface sombre |

### 2.6 Aliases Kinetic

| Token | HEX |
|---|---|
| `kinetic-red` | `#b70100` |
| `kinetic-red-hover` | `#9a0100` |
| `kinetic-red-light` | `#ffdad6` |
| `kinetic-gold` | `#fcd400` |
| `kinetic-gold-light` | `#fff8d6` |

### 2.7 Couleurs de Statut

| État | Fond | Texte | Bordure |
|---|---|---|---|
| ✅ Succès | `#f0fdf4` | `#166534` | `#86efac` |
| ⚠️ Attention | `#fefce8` | `#854d0e` | `#fde68a` |
| ❌ Erreur | `#fef2f2` | `#991b1b` | `#fecaca` |
| ℹ️ Info | `#eff6ff` | `#1e40af` | `#bfdbfe` |
| 🔷 Neutre | `#f8fafc` | `#475569` | `#cbd5e1` |

Classes Tailwind : `status-{green|yellow|red|blue|slate}-{bg|text|ring}`.

### 2.8 Admin Dark Theme (Back-Office)

| Token | HEX | Usage |
|---|---|---|
| `admin-bg` | `#0f172a` | Fond général back-office |
| `admin-card` | `#1e293b` | Cartes back-office |
| `admin-border` | `#334155` | Bordures back-office |
| `admin-text` | `#e2e8f0` | Texte back-office |
| `admin-muted` | `#64748b` | Texte atténué back-office |

---

## 3. Typographie

### 3.1 Polices

| Police | Usage | Weights |
|---|---|---|
| **Inter** | Toute l'interface UI (Swiss-inspired) | 300, 400, 500, 600, 700, 800, 900 |
| **JetBrains Mono** | Codes, tickets, données techniques | 400, 500, 600, 700 |
| **Material Symbols Outlined** | Icônes (variable) | FILL 0..1, wght 100..700 |

Importé depuis Google Fonts dans `resources/views/app.blade.php`.

### 3.2 Échelles

| Échelle | Taille | Usage |
|---|---|---|
| Display Large | 3.5rem (-0.02em) | Villes destinations hero |
| Headline Medium | 1.75rem | Titres de sections |
| Body Large | 1rem | Texte courant (couleur `on-surface`) |
| Label Medium | 0.75rem (+0.05em, caps) | Métadonnées, labels |

### 3.3 Règles typographiques

- Jamais de noir pur : toujours `on-surface` (`#1a1c1c`)
- Labels en all-caps avec tracking augmenté pour les données fonctionnelles
- Les prix et horaires utilisent une échelle display pour devenir des éléments de design

---

## 4. Bordures & Radius

| Classe | Valeur | Usage |
|---|---|---|
| `rounded` | 4px (0.25rem) | Général |
| `rounded-md` | 6px (0.375rem) | Boutons, inputs |
| `rounded-lg` | 8px (0.5rem) | Cartes, conteneurs |
| `rounded-xl` | 12px (0.75rem) | Modaux, panneaux, nav |
| `rounded-2xl` | 16px (1rem) | Cartes élevées |
| `rounded-3xl` | 24px (1.5rem) | Emphase spéciale |
| `rounded-full` | 9999px | Pills, badges, avatars |

---

## 5. Ombres

| Classe | Valeur | Usage |
|---|---|---|
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.06)` | Léger soulèvement |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` | Élévation standard |
| `shadow-lg` | `0 8px 24px rgba(0,0,0,0.10)` | Grande élévation |
| `shadow-xl` | `0 16px 48px rgba(0,0,0,0.12)` | Hero/overlay |
| `shadow-card` | `0 1px 4px rgba(0,0,0,0.06)` | Niveau carte |
| `shadow-ambient` | `0 12px 32px rgba(183,1,0,0.08)` | Ombres teintées marque |
| `shadow-red-glow` | `0 4px 14px rgba(183,1,0,0.25)` | Glow rouge |
| `shadow-primary-glow` | `0 4px 20px rgba(183,1,0,0.25)` | Glow primary |

Règle : toujours teinter les ombres avec la couleur primaire, jamais de noir pur.

---

## 6. Règles de Design

### 6.1 No-Line Rule

**Interdiction d'utiliser des bordures 1px solid pour le sectionnement.** Les limites doivent être définies exclusivement par des changements de fond ou des transitions tonales subtiles.

### 6.2 Hiérarchie par Surface

Traiter l'UI comme une série de couches imbriquées. Une carte = un élément `surface-container-lowest` (`#ffffff`) posé sur un fond `surface-container` (`#f3f3f3`). Crée un "lift" sophistiqué.

### 6.3 Glass & Gradient

- **Dégradés signature** : Les CTA primaires utilisent un dégradé linéaire de `primary` à `primary-container` à 135deg.
- **Glassmorphism** : Les barres de navigation flottantes utilisent la couleur `surface` à 80% d'opacité avec `backdrop-blur-2xl`.

### 6.4 Ghost Border

Si un conteneur est sur un fond de même couleur, utiliser une bordure 1px avec `outline-variant` à 15% d'opacité. Doit être senti, pas vu.

### 6.5 Feedback Tactile

Au survol, les éléments changent de "Tonal Tier". Un bouton passe de `primary` à `primary-container` pour indiquer la profondeur.

### 6.6 Pas de séparateurs

Utiliser 16px d'espace vertical plutôt que des lignes de séparation.

---

## 7. Composants

### 7.1 Boutons

| Variante | Style |
|---|---|
| **Primaire** | Dégradé `from-primary to-primary-container`, `rounded-md`, uppercase, tracking-widest, texte blanc. Hover: `brightness-110` |
| **Secondaire** | Fond `secondary-container`, texte `on-secondary-container`, `rounded-md`, uppercase |
| **Danger** | Fond `kinetic-red` uni, texte blanc. Hover: `kinetic-red-hover` |

### 7.2 Champs de Saisie (TextInput)

- Pas de bordure
- Fond : `surface-container-low`
- Focus : fond passe à `surface-container-lowest`, `ring-2 ring-primary/15`
- Placeholder : `on-surface-variant/50`

### 7.3 Navigation (NavLink)

| État | Style |
|---|---|
| Actif | Bordure basse `primary`, texte `on-surface` |
| Inactif | Bordure transparente, texte `on-surface-variant`, hover devient `on-surface` |

### 7.4 Badges de Statut (StatusBadge)

- Forme pill (`rounded-full`)
- Utilise `ring-1` au lieu de border pour un contour subtil
- Coloré selon le statut (vert/jaune/rouge/bleu/ardoise)

### 7.5 Pagination

| État | Style |
|---|---|
| Page active | Fond `primary-container`, texte `on-primary`, `shadow-card` |
| Page inactive | Bordure `outline-variant`, texte `on-surface`, hover `bg-surface-container` |
| Taille : `w-9 h-9`, `rounded-lg` |

### 7.6 Modale (Modal)

- Overlay : `bg-black/50`
- Panneau : `rounded-lg bg-white shadow-card`
- Tailles : sm, md, lg, xl, 2xl
- Animation : opacity + translate-y + scale

---

## 8. Layouts

### 8.1 Navbar Publique (GuestLayout)

```css
bg-gradient-to-r from-primary/90 to-primary-container/90 backdrop-blur-2xl text-white shadow-ambient
```

- Glassmorphism avec dégradé
- CTA : `bg-white text-primary` (inverse)
- Footer : `bg-inverse-surface text-white`

### 8.2 Sidebar Admin (BackOfficeLayout)

- Largeur : 256px (`w-64`)
- Fond : `bg-inverse-surface/95 backdrop-blur-xl shadow-ambient`
- Nav item actif : `bg-primary text-on-primary`
- Nav item inactif : `text-slate-300 hover:bg-white/10 hover:text-white`

### 8.3 Layout Client (AuthenticatedLayout)

- Fond : `bg-surface-container-low`
- Navbar : `bg-white/80 backdrop-blur-xl shadow-ambient`
- Header : `bg-white shadow-ambient`

---

## 9. Utilitaires

### `cn()` — Fusion de classes Tailwind

```ts
// resources/js/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
```

### `formatFCFA()` — Format monétaire

```ts
new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
```

---

## 10. Animation

- **Framer Motion** pour toutes les animations
- Transitions douces : `transition duration-150 ease-in-out`
- Modales : opacity + translate-y + scale
- Menu mobile : height + opacity

---

## 11. Do's and Don'ts

### ✅ Do
- Utiliser l'asymétrie des espaces blancs pour créer un intérêt visuel
- Utiliser les chiffres en `display-sm` pour les prix et horaires
- Superposer du texte sur des dégradés subtils aux couleurs de la marque
- Utiliser les changements de `surface-container` ou un gap de 24px plutôt que des séparateurs

### ❌ Don't
- Utiliser du noir pur (`#000`). Toujours `on-surface` (`#1a1c1c`)
- Utiliser les ombres par défaut des logiciels. Toujours teinter et diffuser
- Utiliser les icônes comme moyen principal de communication. La typo et la couleur suffisent
- Utiliser des séparateurs 1px. Utiliser un changement de tier de `surface-container` ou un gap

---

## 12. Fichiers Clés

| Fichier | Chemin |
|---|---|
| Configuration Tailwind | `tailwind.config.js` |
| CSS principal | `resources/css/app.css` |
| Configuration Vite | `vite.config.js` |
| Layout Blade | `resources/views/app.blade.php` |
| Point d'entrée JS | `resources/js/app.tsx` |
| Utilitaires | `resources/js/lib/utils.ts` |
| Types TypeScript | `resources/js/types/index.d.ts` |

### Composants React

| Composant | Chemin |
|---|---|
| Bouton Primaire | `resources/js/Components/PrimaryButton.tsx` |
| Bouton Secondaire | `resources/js/Components/SecondaryButton.tsx` |
| Bouton Danger | `resources/js/Components/DangerButton.tsx` |
| Champ Texte | `resources/js/Components/TextInput.tsx` |
| Badge Statut | `resources/js/Components/StatusBadge.tsx` |
| Modale | `resources/js/Components/Modal.tsx` |
| Dropdown | `resources/js/Components/Dropdown.tsx` |
| Pagination | `resources/js/Components/Pagination.tsx` |
| Flash Toast | `resources/js/Components/FlashToast.tsx` |
| Loading Spinner | `resources/js/Components/LoadingSpinner.tsx` |
| Empty State | `resources/js/Components/EmptyState.tsx` |
| Guest Layout | `resources/js/Layouts/GuestLayout.tsx` |
| BackOffice Layout | `resources/js/Layouts/BackOfficeLayout.tsx` |
| Driver Layout | `resources/js/Layouts/DriverLayout.tsx` |
| Auth Layout | `resources/js/Layouts/AuthenticatedLayout.tsx` |
