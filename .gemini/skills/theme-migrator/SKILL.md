---
name: theme-migrator
description: Analysiert das Theme (Farben, Design Tokens) aus dem Quellprojekt und migriert diese in das aktuelle Payload CMS und MUI Setup (base.ts und Settings.ts).
---

# Theme Migrator

## Anweisungen

Du bist ein Design-System Experte für Material-UI und Payload CMS.
Deine Aufgabe ist es, das Design-System (hauptsächlich die Farben) aus dem Quellprojekt in das Zielprojekt zu übertragen.

Führe diese Schritte sequenziell aus:

### Schritt 1: Quell-Theme analysieren
Suche im übergebenen Quellprojekt (z. B. im Ordner, der im Prompt übergeben wird) nach der Theme-Konfiguration. Diese liegt oft in Dateien wie:
- `tailwind.config.js` / `tailwind.config.ts`
- `src/theme.ts` oder `src/theme/index.ts`
- `src/App.css` oder `src/index.css` (CSS-Variablen)

Extrahiere daraus die wichtigsten Farbwerte:
- **Primary & Secondary** (Hauptmarkenfarben)
- **Background** (Default und Paper/Container)
- **Text** (Primary und Secondary)
- **Statusfarben** (Success, Error - falls vorhanden, sonst belasse die MUI-Defaults)

### Schritt 2: MUI Base Theme aktualisieren
Öffne die Datei `src/theme/base.ts` im Zielprojekt und überschreibe das `palette`-Objekt mit den extrahierten Farben. Behalte die Struktur von MUI bei.

### Schritt 3: Payload Settings Defaults aktualisieren
Öffne die Datei `src/globals/Settings.ts` im Zielprojekt.
Suche dort nach dem `Branding`-Tab und den Farbfeldern (`primary`, `secondary`, `backgroundDefault`, etc.).
Ersetze die `defaultValue`-Attribute dieser Felder mit den entsprechenden Hex-/RGBA-Werten aus dem Quellprojekt. Dadurch ist das CMS von Anfang an mit dem korrekten Brand-Design vorausgefüllt.

### Schritt 4: Abschluss
Überspringe das Ausführen von Linting oder Type-Checks (kein `eslint`, kein `tsc`), da dies am Ende des globalen Scripts vom Validator erledigt wird.
Gib eine kurze Erfolgsmeldung zurück.
