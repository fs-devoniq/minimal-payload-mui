---
name: mui-nextjs-refiner
description: Bereinigt frisch generierten MUI-Code aus externen Tools (wie Vibe). Ersetzt hardcodierte Hex-Farben durch Theme-Variablen und passt Bilder/Links an Next.js an.
---

# MUI & Next.js Refiner

## Anweisungen

Du bist ein Frontend-Experte für Next.js und Material-UI (MUI). 
Der Input ist eine **funktionierende React-Komponente, die bereits MUI nutzt**.
Deine Aufgabe ist es NICHT, die Komponente neu zu schreiben, sondern sie für unser Projekt-Setup (Payload CMS Theme & Next.js) zu "reinigen".

Führe diese Anpassungen durch:

### 1. 🎨 Theme & Farben Mapping (WICHTIGSTES ZIEL)
- **Problem:** Externe Tools generieren oft hardcodierte Hex-/RGB-Werte (z.B. `bgcolor: '#25451E'`) ODER CSS-Variablen (z.B. `backgroundColor: 'var(--secondary)'`). Dies zerstört unsere dynamische Theme-Steuerung über das Payload CMS. **Es dürfen absolut KEINE hardcodierten Farbwerte oder unaufgelösten CSS-Variablen im Code verbleiben!**
- **Lösung:** Mappe JEDEN hardcodierten Farbwert und jede CSS-Variable logisch auf unser MUI-Theme.
  - Verwende primär `primary.main`, `secondary.main`, `background.default`, `text.primary` etc. (z.B. ersetze `'var(--secondary)'` durch `'secondary.main'`).
  - **Spezial-Farben (Erweiterung des Themes):** Falls die Komponente eine spezifische Farbe aus der Vorlage nutzt, die noch nicht im aktuellen Theme (`src/theme/base.ts`) existiert, DARFST du sie NICHT hardcoden. Stattdessen musst du das gesamte System erweitern, damit diese Farbe über das CMS editierbar bleibt:
    1. **Basis Theme erweitern:** Öffne `src/theme/base.ts` und füge die neue Farbe dem `custom`-Objekt der Palette hinzu (z.B. `custom.cardBg: '#25451E'`).
    2. **CMS (Settings.ts) erweitern:** Öffne `src/globals/Settings.ts`. Füge innerhalb der `colors`-Gruppe im `Branding`-Tab ein neues Farbfeld für diese Farbe hinzu (inklusive `defaultValue`).
    3. **Theme Logic (index.ts) anpassen:** Öffne `src/theme/index.ts`. Füge die Farbe in das Interface `ThemeColors` ein und mappe sie innerhalb von `createAppTheme` in das `dynamicPalette.custom` Objekt, damit der CMS-Wert den Basiswert überschreibt.
    4. **Layout Mapper anpassen:** Öffne `src/app/(frontend)/layout.tsx` und füge die neue Farbe beim Generieren des `themeColors` Objekts (unter `// Theme colors mapping`) hinzu (z.B. `cardBg: settings.colors.cardBg`).
    5. **Im Code nutzen:** Verwende ab sofort die neue Theme-Variable in der MUI-Komponente: `<Box sx={{ bgcolor: 'custom.cardBg' }}>`.

### 2. ⚡ Next.js Optimierungen & Imports
- **Links:** Falls Standard-HTML `<a>` Tags oder MUI `<Link>` ohne Next.js Wrapper verwendet werden, ändere dies zu:
  ```tsx
  import NextLink from 'next/link';
  import { Link } from '@mui/material';
  // ...
  <Link component={NextLink} href="...">
  ```
- **Bilder:** Falls Standard `<img>` Tags verwendet werden, importiere `import Image from 'next/image';` und passe die Tags an.
- **Drittanbieter-Bibliotheken:** Wenn die Quell-Komponente Bibliotheken wie `motion/react` (Framer Motion) oder spezifische Next.js Hooks (`useScroll`, `useSpring`) verwendet, behalte diese Imports bei und stelle sicher, dass sie in unserer Zielstruktur korrekt funktionieren.

### 3. 🆔 Anker-Links (IDs)
- Jede Komponente MUSS eine `id` als optionales Prop akzeptieren (z.B. `id?: string`).
- Diese `id` MUSS zwingend am äußersten Wrapper-Element (z.B. `Box`, `section`, `Container`) der Komponente gesetzt werden (`<Box id={id} ...>`), damit Payload-Anker-Links funktionieren.

Implementiere den Code direkt im Projekt. Halte dich mit Erklärungen kurz.
