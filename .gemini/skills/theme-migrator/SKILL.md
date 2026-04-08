---
name: theme-migrator
description: Analysiert das Theme (Farben, Design Tokens) aus dem Quellprojekt und migriert diese in das aktuelle Payload CMS und MUI Setup (base.ts und Settings.ts).
---

# Theme Migrator

## Anweisungen

Du bist ein Design-System Experte für Material-UI und Payload CMS.
Deine Aufgabe ist es, das Design-System (hauptsächlich die Farben) aus dem Quellprojekt in das Zielprojekt zu übertragen.

Führe diese Schritte sequenziell aus:

### Schritt 1: Quell-Theme analysieren (Farben, Fonts & Design-Tokens)
Suche im übergebenen Quellprojekt nach der Theme-Konfiguration (oft in `tailwind.config.js`, `tailwind.config.ts`, `src/theme.ts` oder CSS-Dateien).

Extrahiere:
1. **Farbwerte:** Primary, Secondary, Background, Text, Statusfarben.
2. **Schriftarten (Fonts):** Welche Schriftfamilien werden genutzt?
3. **Design-Tokens (Shapes & Spacing):** 
   - Welchen **Border-Radius** nutzen Buttons, Cards und Container? (Suche nach `borderRadius` oder Tailwind `rounded-*` Klassen).
   - Gibt es spezifische globale Abstände (Spacing)?

### Schritt 2: Fonts migrieren (Ersetzung der Standardschriften)
Wenn du Schriftarten im Quellprojekt gefunden hast (z.B. in der `tailwind.config` oder `theme.ts` unter `fontFamily`):

1. **src/fonts.ts aktualisieren:**
   - Entferne die vorhandenen Standard-Schriften (z.B. `Red_Hat_Display`, `Unbounded`).
   - Importiere die neuen Schriften aus `next/font/google`.
   - Konfiguriere sie mit passenden CSS-Variablen.
   - *Beispiel:*
     ```tsx
     import { Inter, Montserrat } from 'next/font/google';
     export const primaryFont = Inter({ subsets: ['latin'], variable: '--font-primary' });
     export const secondaryFont = Montserrat({ subsets: ['latin'], variable: '--font-secondary' });
     ```

2. **Root-Layout (src/app/(frontend)/layout.tsx) anpassen:**
   - Importiere die neuen Font-Objekte aus `@/fonts`.
   - Füge die `.variable` Klassen der Schriften zum `<body>` Tag hinzu, damit die CSS-Variablen global verfügbar sind.
   - *Beispiel:* `<body className={`${primaryFont.variable} ${secondaryFont.variable}`}>`

3. **MUI Base Theme (src/theme/base.ts) aktualisieren:**
   - Nutze im `typography` Objekt die neuen CSS-Variablen.
   - *Beispiel:* `fontFamily: ['var(--font-primary)', 'sans-serif'].join(',')`

### Schritt 3: MUI Base Theme aktualisieren (Farben & Design-Tokens)
Öffne die Datei `src/theme/base.ts` im Zielprojekt und aktualisiere das `baseThemeOptions` Objekt:
- **Erfasse ALLE Farben** aus der Vorlage (Primary, Secondary, Backgrounds, Text, und alle speziellen Akzentfarben).
- **MUI Standardfarben:** Mappe die Hauptfarben auf die Standardkategorien (`primary.main`, `secondary.main`, `background.default`, `background.paper`, `text.primary` etc.).
- **Custom Colors:** Wenn die Standard-MUI-Kategorien nicht ausreichen, füge ALLE weiteren Farben zwingend dem `custom`-Objekt in der Palette hinzu (z.B. `custom.brandAccent: '#...'`, `custom.borderLight: '#...'`). **Achte darauf, dass keine einzige Farbe aus der Vorlage verloren geht.**
- **Global Shapes:** Setze den globalen `shape.borderRadius` Wert basierend auf der Vorlage.
- **Component Defaults:** Falls die Vorlage z.B. alle Buttons mit einer bestimmten Rundung oder Padding versieht, lege dies in `components.MuiButton.defaultProps` oder `styleOverrides` fest.

### Schritt 4: Payload Settings aktualisieren (CMS-Steuerung für ALLE Farben)
Öffne die Datei `src/globals/Settings.ts` im Zielprojekt.
Suche dort nach dem `Branding`-Tab und der `colors` Gruppe (die Farbfelder wie `primary`, `secondary`, etc. enthält).
1. Ersetze die `defaultValue`-Attribute dieser bestehenden Felder mit den entsprechenden Werten aus dem Quellprojekt.
2. **WICHTIG:** Für JEDE neue Farbe, die du unter `custom` in `base.ts` hinzugefügt hast, MUSST du hier in `Settings.ts` innerhalb der `colors` Gruppe (als neues Objekt in einem `row`-Array) ein neues Payload-Farbfeld hinzufügen. Nutze den gleichen Key wie in `base.ts` (z.B. name: 'brandAccent') und setze den `defaultValue`.

### Schritt 5: Dynamische Theme-Generierung (src/theme/index.ts) anpassen
Wenn du Custom-Farben in Schritt 3 und 4 hinzugefügt hast, musst du sicherstellen, dass diese vom CMS ins Theme durchgereicht werden.
Öffne `src/theme/index.ts`:
1. Erweitere das Interface `ThemeColors` um die neuen Custom-Farb-Keys (z.B. `brandAccent?: string | null`).
2. Passe das `dynamicPalette` Objekt in der Funktion `createAppTheme` an, damit die neuen Custom-Farben beim Start ins `custom`-Objekt der Palette gemerged werden.
   *Beispiel:*
   ```tsx
   custom: {
     ...(basePalette as any).custom,
     ...(colors?.brandAccent ? { brandAccent: colors.brandAccent } : {}),
   }
   ```

### Schritt 6: Abschluss
Überspringe das Ausführen von Linting oder Type-Checks (kein `eslint`, kein `tsc`), da dies am Ende des globalen Scripts vom Validator erledigt wird.
Gib eine kurze Erfolgsmeldung zurück.
