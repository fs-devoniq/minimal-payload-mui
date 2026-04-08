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

### Schritt 2: Fonts in Next.js integrieren
Wenn du Schriftarten gefunden hast, die über Google Fonts verfügbar sind:
1. Erstelle oder aktualisiere die Datei `src/fonts.ts` (oder `src/app/(frontend)/layout.tsx`, falls `fonts.ts` nicht existiert).
2. Nutze `next/font/google`, um die Schriften zu importieren. Konfiguriere sie mit CSS-Variablen. Beispiel:
```tsx
import { Inter } from 'next/font/google';
export const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
```
3. Binde die Klasse/Variable im Root-Layout (`<body>`) ein, damit sie global verfügbar ist.

### Schritt 3: MUI Base Theme aktualisieren (Farben, Typografie & Global Styles)
Öffne die Datei `src/theme/base.ts` im Zielprojekt und aktualisiere das `baseThemeOptions` Objekt:
- **Palette:** Farben mergen (bestehendes `custom` Objekt erhalten!).
- **Typography:** Schriften einbinden.
- **Global Shapes:** Setze den globalen `shape.borderRadius` Wert basierend auf der Vorlage.
- **Component Defaults:** Falls die Vorlage z.B. alle Buttons mit einer bestimmten Rundung oder Padding versieht, lege dies in `components.MuiButton.defaultProps` oder `styleOverrides` fest, damit es global für alle MUI-Buttons im Projekt gilt.

### Schritt 4: Payload Settings Defaults aktualisieren
Öffne die Datei `src/globals/Settings.ts` im Zielprojekt.
Suche dort nach dem `Branding`-Tab und den Farbfeldern (`primary`, `secondary`, `backgroundDefault`, etc.).
Ersetze die `defaultValue`-Attribute dieser Felder mit den entsprechenden Hex-/RGBA-Werten aus dem Quellprojekt. Dadurch ist das CMS von Anfang an mit dem korrekten Brand-Design vorausgefüllt.

### Schritt 5: Abschluss
Überspringe das Ausführen von Linting oder Type-Checks (kein `eslint`, kein `tsc`), da dies am Ende des globalen Scripts vom Validator erledigt wird.
Gib eine kurze Erfolgsmeldung zurück.
