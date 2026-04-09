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

### Datenbank vorbereiten (Docker)
Stelle sicher, dass dein lokaler Postgres-Container läuft.
```bash
# Alte Datenbank löschen (falls vorhanden)
docker exec -it postgres-container dropdb -U postgres [projektname]_db

# Neue Datenbank erstellen
docker exec -it postgres-container createdb -U postgres [projektname]_db
```

### Migration ausführen
Wechsle in das neu geklonte Website-Verzeichnis und starte das Migrations-Skript.

```bash
# In das Website-Verzeichnis wechseln
cd [projektname]-website  # oder 'z [projektname]-website'

# Migrations-Skript starten (Pfad zum Vibe-Projekt anpassen!)
GEMINI_API_KEY="[DEIN_API_KEY]" ./migrate-vibe-blocks.sh ../[projektname]-vibe
```

### Abhängigkeiten installieren & Server starten
Sobald das Skript erfolgreich durchgelaufen ist, installiere die NPM-Pakete und starte die Entwicklungsumgebung:

```bash
yarn install
yarn dev
```

🎉 **Fertig!** Das Projekt sollte nun lokal unter `http://localhost:3000` erreichbar sein und alle Vibes in saubere Payload-Blöcke und MUI-Komponenten umgewandelt haben.
