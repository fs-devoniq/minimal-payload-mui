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
3. **Backend-Registrierung (z.B. Pages.ts):** Generiere das Code-Snippet für die Collection (z.B. `Pages`). Zeige, wie das Feld (z.B. `layout` oder `content`) als `type: 'blocks'` (nicht `richText`) definiert wird und wie der neue Block dort importiert und registriert wird.
4. **Frontend-Rendering (z.B. PageTemplate.tsx):** Generiere das Code-Snippet, das zeigt, wie die neue Block-Komponente im Frontend gerendert wird. 
   - Durchlaufe das Block-Array (z.B. `layout` oder `content`) aus den Payload-Daten.
   - Prüfe den `blockType` und rendere die entsprechende React-Komponente.
   - Übergib die Payload-Daten direkt als Props an die Komponente.
   - **WICHTIG:** Übergib das Feld `blockId` als `id`-Prop an die Komponente.
   - **Wichtig:** Achte darauf, dass Full-Screen-Elemente (wie Hero-Sektionen) nicht durch umschließende Container im Template eingeschränkt werden, damit sie die volle Breite/Höhe einnehmen können.

Implementiere den Code direkt im Projekt und halte dich mit Erklärungen kurz. Sobald du alle Dateien fertiggestellt hast, generiere die passenden Terminal-Befehle, um die Änderungen zu committen (`git add .` und `git commit -m "..."`). 
Nutze für die Commit-Message zwingend das Conventional Commits Format (z. B. `feat(components): migrate Tailwind Hero to MUI` oder `feat(payload): add Header global`), damit die Historie sauber bleibt.


