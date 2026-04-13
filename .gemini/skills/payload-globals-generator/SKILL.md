---
name: payload-globals-generator
description: Wandelt statische Header/Navbar- und Footer-Komponenten in Payload CMS Globals um, registriert sie in der Konfiguration und bindet sie für den globalen Abruf im Next.js App Router Layout ein.
---

# Anweisungen

Du bist ein Full-Stack-Experte für Payload CMS (v3+) und Next.js (App Router). 
Der Input des Nutzers ist der Code einer **Header/Navbar- oder Footer-Komponente**.

Deine Aufgabe ist es, diese Komponenten vollständig in das CMS zu integrieren, sodass sie global vom Kunden bearbeitet werden können und auf jeder Seite erscheinen.

Führe exakt diese 4 Schritte aus:

1. **Zentrales Logo (Basic Site Settings) & Payload Globals Konfiguration (`src/globals/...`):**
   - **WICHTIG (Logo-Behandlung):** Prüfe, ob in der Vorlage ein Haupt-Logo (oft im Header) verwendet wird. Wenn ja, füge ein Feld `logo` vom Typ `upload` (relationTo: 'media') in der Datei `src/globals/Settings.ts` (unter dem "Branding" Tab) hinzu, damit es eine zentrale Austauschmöglichkeit gibt. 
   - *Ausnahme:* Wenn eine Komponente (z.B. ein spezifischer Footer oder eine Partner-Sektion) offensichtlich ein *anderes*, abweichendes Logo verwendet, erlaube ein separates Logo-Feld in deren spezifischer Global-Konfiguration. Nutze ansonsten immer das zentrale Logo.
   - Erstelle die spezifische Payload Global-Konfiguration für die übergebene Komponente (z. B. `Header.ts` oder `Footer.ts` in `src/globals/`).
   - Lege in diesem Global nur Felder für die spezifischen variablen Elemente an (z. B. Navigations-Links, Social-Media-Links, Copyright-Texte). Nutze die statischen Inhalte aus dem Input als `defaultValue`.

2. **Frontend-Komponente anpassen & Logik migrieren (`src/components/...`):**
   - Passe die React-Komponente so an, dass sie die typisierten Payload-Daten als Props entgegennimmt.
   - **WICHTIG (Server Components):** Setze `'use client';` in die erste Zeile der Komponente, **aber nur dann, wenn** sie Interaktivität (z. B. Mobile-Menü `useState`, `useScrollTrigger`, `component={Link}` oder interaktive Hooks) enthält. Wenn der Header/Footer komplett statisch ist, verzichte darauf.
   - **Logo rendern:** Die Komponente muss das Logo (entweder als spezifisches Prop oder als übergebenes zentrales `logo` aus den Settings) entgegennehmen und es dort als `<Image />` (aus `next/image`) rendern. Achte auf ordentliche Breiten-/Höhenangaben oder `fill`.
   - **WICHTIG (Logik-Migration):** Suche in der Quell-Datei nach funktionaler Logik, die mit dieser Komponente zusammenhängt (Scroll-Logik, UI-State für Mobile-Menüs, interaktive Hooks) und integriere diese in die neue MUI-Komponente. Nutze moderne Hooks (`useState`, `useEffect`, MUI's `useScrollTrigger`).

3. **Payload Config Update (`src/payload.config.ts`):**
   - **Öffne zwingend die Datei `src/payload.config.ts`** und füge den Import für das neue Global (Header/Footer) hinzu. 
   - Füge das neue Global zwingend in das `globals`-Array in dieser Datei ein. Du darfst nicht nur ein Snippet zeigen, du musst die Datei bearbeiten!

4. **Next.js Layout Integration (`src/app/(frontend)/layout.tsx`):**
   - Generiere das Code-Snippet für das Root-Layout (oder das relevante Frontend-Layout).
   - Rufe die Daten serverseitig über die Payload Local API ab (`getPayload({ config })`). Hole sowohl das neu erstellte Global (Header/Footer) als AUCH das `Settings`-Global.
   - **WICHTIG (Depth):** Nutze beim Abruf von `Settings` (falls es die Homepage verlinkt) und Header/Footer mindestens `depth: 2`, damit Bilder innerhalb von Blöcken oder Untermenüs korrekt als Objekt (statt nur ID) geladen werden.
   - Binde die Header/Footer-Komponente ein. Übergib ihr die spezifischen Global-Daten. Wenn die Komponente das Hauptlogo nutzt, übergib ihr das `logo` aus den Settings als Prop.

Implementiere den Code direkt im Projekt und halte dich mit Erklärungen kurz. Sobald du alle Dateien fertiggestellt hast, generiere die passenden Terminal-Befehle, um die Änderungen zu committen (`git add .` und `git commit -m "..."`). 
Nutze für die Commit-Message zwingend das Conventional Commits Format (z. B. `feat(components): migrate Tailwind Hero to MUI` oder `feat(payload): add Header global`), damit die Historie sauber bleibt.