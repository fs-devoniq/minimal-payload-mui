---
name: payload-block-generator
description: Erstellt aus einer React-Komponente eine Payload CMS Block-Konfiguration mit defaultValues und liefert den Code für die Backend-Registrierung (Pages-Collection) sowie das Frontend-Rendering (PageTemplate).
---

# Anweisungen

Du bist ein Full-Stack-Experte für Payload CMS und Next.js. 
Der Input ist eine fertige **React-Komponente**. Deine Aufgabe ist es, diese im Payload Admin-Panel als Block nutzbar zu machen und die nahtlose Integration von der Datenbank bis zum Frontend vorzubereiten.

Führe diese 4 Aufgaben aus:

1. **Payload CMS Block (VOLLSTÄNDIGKEIT IST PFLICHT):** Analysiere die Komponente und erstelle die exakt passende Block-Konfiguration (Schema) für Payload CMS.
   - **KEINE AUSNAHMEN:** Jedes einzelne variable Element der UI-Komponente MUSS ein entsprechendes Feld in Payload erhalten. Das gilt insbesondere für:
     - **Texte:** Überschriften, Untertitel, Fließtexte.
     - **Bilder/Icons:** Upload-Felder für jedes Bild oder Icon.
     - **Buttons/Links:** Erstelle Gruppen oder Arrays für Buttons (Label + URL). Oft werden Buttons in Hero-Sektionen oder Call-to-Action Blöcken vergessen – das ist verboten.
   - **WICHTIG:** Jeder Block MUSS ein Feld `blockId` (Type: `text`) erhalten. Dieses dient als Anker-Link (z.B. für Sprungmarken in der Navigation). Gib ihm eine passende Beschreibung im Admin-Panel (z.B. "Eindeutige ID für Anker-Links, z.B. 'ueber-uns'").

2. **Default Values (ZWINGEND & LÜCKENLOS):** Du MUSST ABSOLUT ALLE aktuellen statischen Inhalte (alle Texte, Bild-URLs, Button-Labels, Links etc.) aus dem übergebenen React-Code extrahieren und als `defaultValue` in den jeweiligen Payload-Feldern eintragen. Lass diese Werte NIEMALS leer! Ziel ist es, dass der Block im CMS direkt nach der Erstellung zu 100% identisch zum Design-Entwurf vorausgefüllt ist. Jedes CMS-Feld, das du anlegst, braucht einen sinnvollen Default-Wert aus der Vorlage.
   - **WICHTIGER TYP-HINWEIS:** Bei `select`-Feldern MUSS der `defaultValue` exakt dem Datentyp der `options` entsprechen. Da Payload `select`-Felder in Postgres als `enum` anlegt, führt ein Typkonflikt (z.B. Zahl `4` statt String `'4'`) zu einem Datenbank-Absturz beim `db push`. Nutze im Zweifel immer Strings für Select-Optionen und Defaults.
3. **Backend-Registrierung (z.B. Pages.ts):** **Öffne zwingend die entsprechende Collection-Datei (z.B. `src/collections/Pages.ts`)** und bearbeite sie: Importiere deinen neuen Block und füge ihn dem Block-Array (z.B. im Feld `layout` oder `content`) hinzu.
4. **Frontend-Rendering (z.B. PageTemplate.tsx):** **Öffne zwingend die Template-Datei (z.B. `src/components/PageTemplate.tsx`)** und bearbeite sie: Importiere deine React-Komponente und binde sie in den Switch-Case (oder das entsprechende Rendering-Mapping) für die Blöcke ein. 
   - Durchlaufe das Block-Array (z.B. `layout` oder `content`) aus den Payload-Daten.
   - Prüfe den `blockType` und rendere die entsprechende React-Komponente.
   - Übergib die Payload-Daten direkt als Props an die Komponente.
   - **WICHTIG (Image Loading):** Damit Bilder in Blöcken angezeigt werden, stelle sicher, dass:
     1. Die Datenabfrage in der `page.tsx` mindestens `depth: 2` nutzt (standardmäßig der Fall, aber prüfe es).
     2. Die Media-Kollektion (`src/collections/Media.ts`) korrekt konfiguriert ist (empfohlen: `staticDir: 'public/media'`).
     3. Die `next.config.ts` den Pfad erlaubt (z.B. `/media/**`).
   - **WICHTIG (MUI & Server Components):** Das `PageTemplate` wird serverseitig gerendert. Füge der React-Komponente des Blocks in der ersten Zeile `'use client';` hinzu, **aber nur, wenn es zwingend nötig ist** (z. B. wegen `useState`, `onClick`, `component={Link}` oder Theme-Funktionen im `sx`-Prop). Wenn der Block nur statisches Layout rendert und keine Client-Features nutzt, verzichte darauf, um die Server-Side-Rendering Performance zu optimieren.
   - **WICHTIG:** Übergib das Feld `blockId` als `id`-Prop an die Komponente, sodass es die angegebene ID in Payload rendert.
   - **Wichtig:** Achte darauf, dass Full-Screen-Elemente (wie Hero-Sektionen) nicht durch umschließende Container im Template eingeschränkt werden, damit sie die volle Breite/Höhe einnehmen können.

Implementiere den Code direkt im Projekt und halte dich mit Erklärungen kurz. Sobald du alle Dateien fertiggestellt hast, generiere die passenden Terminal-Befehle, um die Änderungen zu committen (`git add .` und `git commit -m "..."`). 
Nutze für die Commit-Message zwingend das Conventional Commits Format (z. B. `feat(components): migrate Tailwind Hero to MUI` oder `feat(payload): add Header global`), damit die Historie sauber bleibt.


