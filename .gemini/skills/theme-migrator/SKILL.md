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
- **Palette:** Farben mergen (bestehendes `custom` Objekt erhalten!).
- **Global Shapes:** Setze den globalen `shape.borderRadius` Wert basierend auf der Vorlage.
- **Component Defaults:** Falls die Vorlage z.B. alle Buttons mit einer bestimmten Rundung oder Padding versieht, lege dies in `components.MuiButton.defaultProps` oder `styleOverrides` fest.

### Schritt 4: Payload Settings Defaults aktualisieren
Öffne die Datei `src/globals/Settings.ts` im Zielprojekt.
Suche dort nach dem `Branding`-Tab und den Farbfeldern (`primary`, `secondary`, `backgroundDefault`, etc.).
Ersetze die `defaultValue`-Attribute dieser Felder mit den entsprechenden Hex-/RGBA-Werten aus dem Quellprojekt. Dadurch ist das CMS von Anfang an mit dem korrekten Brand-Design vorausgefüllt.

### Schritt 5: Abschluss
Überspringe das Ausführen von Linting oder Type-Checks (kein `eslint`, kein `tsc`), da dies am Ende des globalen Scripts vom Validator erledigt wird.
Gib eine kurze Erfolgsmeldung zurück.
