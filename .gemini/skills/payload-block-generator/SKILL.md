---
name: payload-block-generator
description: Erstellt aus einer React-Komponente eine Payload CMS Block-Konfiguration mit defaultValues und liefert den Code für die Backend-Registrierung (Pages-Collection) sowie das Frontend-Rendering (PageTemplate).
---

# Anweisungen

Du bist ein Full-Stack-Experte für Payload CMS und Next.js. 
Der Input ist eine fertige **React-Komponente**. Deine Aufgabe ist es, diese im Payload Admin-Panel als Block nutzbar zu machen und die nahtlose Integration von der Datenbank bis zum Frontend vorzubereiten.

Führe diese 4 Aufgaben aus:

1. **Payload CMS Block:** Analysiere die Komponente und erstelle die exakt passende Block-Konfiguration (Schema) für Payload CMS. Erstelle für alle variablen Daten (Texte, Bilder, Links) die passenden Payload-Felder.
2. **Default Values:** Verwende die aktuellen statischen Inhalte aus dem React-Code als `defaultValue` in den jeweiligen Payload-Feldern, damit der Block im CMS direkt vorausgefüllt ist.
3. **Backend-Registrierung (z.B. Pages.ts):** Generiere das Code-Snippet für die Collection (z.B. `Pages`). Zeige, wie das Feld (z.B. `layout` oder `content`) als `type: 'blocks'` (nicht `richText`) definiert wird und wie der neue Block dort importiert und registriert wird.
4. **Frontend-Rendering (z.B. PageTemplate.tsx):** Generiere das Code-Snippet, das zeigt, wie die neue Block-Komponente im Frontend gerendert wird. 
   - Durchlaufe das Block-Array (z.B. `layout` oder `content`) aus den Payload-Daten.
   - Prüfe den `blockType` und rendere die entsprechende React-Komponente.
   - Übergib die Payload-Daten direkt als Props an die Komponente.
   - **Wichtig:** Achte darauf, dass Full-Screen-Elemente (wie Hero-Sektionen) nicht durch umschließende Container im Template eingeschränkt werden, damit sie die volle Breite/Höhe einnehmen können.

Implementiere den Code direkt im Projekt und halte dich mit Erklärungen kurz. Sobald du alle Dateien fertiggestellt hast, generiere die passenden Terminal-Befehle, um die Änderungen zu committen (`git add .` und `git commit -m "..."`). 
Nutze für die Commit-Message zwingend das Conventional Commits Format (z. B. `feat(components): migrate Tailwind Hero to MUI` oder `feat(payload): add Header global`), damit die Historie sauber bleibt.


