---
name: payload-globals-generator
description: Wandelt statische Header/Navbar- und Footer-Komponenten in Payload CMS Globals um, registriert sie in der Konfiguration und bindet sie für den globalen Abruf im Next.js App Router Layout ein.
---

# Anweisungen

Du bist ein Full-Stack-Experte für Payload CMS (v3+) und Next.js (App Router). 
Der Input des Nutzers ist der Code einer **Header/Navbar- oder Footer-Komponente**.

Deine Aufgabe ist es, diese Komponenten vollständig in das CMS zu integrieren, sodass sie global vom Kunden bearbeitet werden können und auf jeder Seite erscheinen.

Führe exakt diese 4 Schritte aus:

1. **Payload Globals Konfiguration (`src/globals/...`):**
   - Erstelle die Payload Global-Konfiguration (z. B. `Header.ts` oder `Footer.ts`).
   - Lege für alle variablen Elemente (z. B. Logo, Navigations-Links, Social-Media-Links, Copyright-Texte) die passenden Payload-Felder an.
   - **Wichtig:** Verwende die aktuellen statischen Inhalte aus dem Input-Code als `defaultValue`, damit das Global im CMS sofort vorausgefüllt ist.

2. **Frontend-Komponente anpassen & Logik migrieren (`src/components/...`):**
   - Passe die React-Komponente so an, dass sie die typisierten Payload-Daten als Props entgegennimmt, anstatt die hardcodierten Werte zu nutzen.
   - **WICHTIG (Logik-Migration):** Suche in der Quell-Datei (z.B. `App.tsx`) nach funktionaler Logik, die mit dieser Komponente zusammenhängt. Dazu gehören:
     - **Scroll-Logik:** z.B. `useEffect` mit Scroll-Event-Listenern für transparente/farbige Navbars.
     - **UI-State:** z.B. `useState` für das Öffnen/Schließen von Mobile-Menüs.
     - **Interaktive Hooks:** Alle Hooks, die das Verhalten der Komponente steuern.
   - Integriere diese Logik direkt in die neue MUI-Komponente im Zielprojekt. Nutze dafür moderne React-Hooks (`useState`, `useEffect`, `useScrollTrigger` von MUI, etc.).

3. **Payload Config Update (`src/payload.config.ts`):**
   - Generiere das Snippet, das zeigt, wie das neue Global in die Hauptkonfiguration von Payload (im `globals`-Array) importiert und registriert wird.

4. **Next.js Layout Integration (`src/app/(frontend)/layout.tsx`):**
   - Generiere das Code-Snippet für das Root-Layout (oder das relevante Frontend-Layout).
   - Zeige, wie die Daten für das Global serverseitig über die Payload Local API (z. B. `getPayload({ config })` und `payload.findGlobal(...)`) abgerufen werden.
   - Binde die angepasste Header/Footer-Komponente in das Layout ein und übergib die abgerufenen CMS-Daten.

Implementiere den Code direkt im Projekt und halte dich mit Erklärungen kurz. Sobald du alle Dateien fertiggestellt hast, generiere die passenden Terminal-Befehle, um die Änderungen zu committen (`git add .` und `git commit -m "..."`). 
Nutze für die Commit-Message zwingend das Conventional Commits Format (z. B. `feat(components): migrate Tailwind Hero to MUI` oder `feat(payload): add Header global`), damit die Historie sauber bleibt.