# 🚀 Workflow: Vibe Coden in AI Studio zu Payload CMS

Diese Anleitung beschreibt den kompletten Ablauf, um ein in AI Studio ("Vibe") generiertes Projekt in ein sauberes Payload CMS + Next.js Setup (basierend auf dem `minimal-payload-mui` Template) zu migrieren.

## 1. AI Studio (Das "Vibe" Projekt)
1. **Vibe Coden:** In AI Studio mit dem entsprechenden System Prompt das Frontend generieren lassen.
2. **Exportieren:** Auf den Reiter **Github** wechseln.
3. **Repository erstellen:** Ein neues Repository mit dem Namen `[projektname]-vibe` anlegen und den Code dorthin pushen lassen.

## 2. GitHub (Das Ziel-Projekt)
1. GitHub im Browser öffnen.
2. Ein neues Repository anlegen:
   - **Name:** `[projektname]-website`
   - **Sichtbarkeit:** Privat
   - **Template:** `minimal-payload-mui` auswählen
3. Auf **Create** drücken.

## 3. Terminal & Lokales Setup

Öffne dein Terminal und führe die folgenden Schritte aus. Ersetze dabei `[projektname]` durch deinen tatsächlichen Projektnamen (z. B. `daniel`).

### Repositories klonen
```bash
# Vibe-Repo klonen
git clone -c core.sshCommand="ssh -i ~/.ssh/fscheel@github.com" git@github.com:fs-devoniq/[projektname]-vibe.git

# Website-Repo klonen
git clone -c core.sshCommand="ssh -i ~/.ssh/fscheel@github.com" git@github.com:fs-devoniq/[projektname]-website.git
```

### Umgebungsvariablen konfigurieren
Das Template benötigt eine `.env` Datei. Kopiere die Vorlage und passe die Datenbank-URL an.

```bash
# In das Website-Verzeichnis wechseln
cd [projektname]-website

# .env erstellen
cp .env.example .env
```
Öffne die `.env` und stelle sicher, dass die `DATABASE_URI` deinen Datenbanknamen enthält:
`DATABASE_URI=postgresql://postgres:postgres@127.0.0.1:5432/[projektname]_db`

### Datenbank vorbereiten (Docker)
Stelle sicher, dass dein lokaler Postgres-Container läuft.
```bash
# Alte Datenbank löschen (falls vorhanden)
docker exec -it postgres-container dropdb -U postgres [projektname]_db

# Neue Datenbank erstellen
docker exec -it postgres-container createdb -U postgres [projektname]_db
```

### Migration ausführen
Stelle sicher, dass das Gemini CLI installiert ist (`npm install -g @google/gemini-cli`). Starte dann die Migration:

```bash
# Migrations-Skript starten
GEMINI_API_KEY="[DEIN_API_KEY]" ./migrate-vibe-blocks.sh ../[projektname]-vibe
```

### Abhängigkeiten installieren & Server starten
```bash
yarn install
yarn dev
```

## 4. Finalisierung im CMS
1. Öffne `http://localhost:3000/admin`.
2. Erstelle deinen **ersten Admin-Benutzer**.
3. Gehe zu **Settings > Branding** und lade dein Logo hoch.
4. Erstelle unter **Pages** eine neue Seite (z.B. "Home"), füge die migrierten Blöcke hinzu und veröffentliche sie.
5. Gehe zu **Settings > General** und wähle die neu erstellte Seite im Feld **Home Page** aus. Speichere die Einstellungen.

🎉 **Fertig!** Das Projekt sollte nun lokal unter `http://localhost:3000` direkt mit deiner neuen Startseite erreichbar sein. Alle Vibes wurden in saubere Payload-Blöcke und MUI-Komponenten umgewandelt.
