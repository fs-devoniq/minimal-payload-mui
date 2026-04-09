# Setup: Vibe Factory (GitHub Actions)

Dieses Repository dient als zentrale Fabrik, um Vibe-Projekte in Payload CMS Websites zu verwandeln und synchron zu halten.

## 1. Repository vorbereiten
1. Erstelle ein neues, privates GitHub Repo namens `vibe-factory`.
2. Gehe zu **Settings > Secrets and variables > Actions**.
3. Füge folgende **Repository Secrets** hinzu:
   - `GEMINI_API_KEY`: Dein Google Gemini API Key.
   - `GH_PAT`: Ein GitHub Personal Access Token mit `repo` Berechtigungen.

## 2. Workflows anlegen

Erstelle den Ordner `.github/workflows/` und lege dort folgende zwei Dateien an:

### `initial-migration.yml` (Initial-Setup)
Dieser Workflow wird manuell gestartet, wenn du ein neues Projekt beginnst.

```yaml
name: Initial Vibe Migration
on:
  workflow_dispatch:
    inputs:
      vibe_repo:
        description: 'Vibe Repo (z.B. fs-devoniq/daniel-vibe)'
        required: true
      target_repo:
        description: 'Ziel Repo (z.B. fs-devoniq/daniel-website)'
        required: true

jobs:
  migrate:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Gemini CLI
        run: npm install -g @google/gemini-cli

      - name: Clone Template
        run: git clone https://github.com/fs-devoniq/minimal-payload-mui target-project

      - name: Clone Vibe Project
        run: git clone https://x-access-token:${{ secrets.GH_PAT }}@github.com/${{ github.event.inputs.vibe_repo }} vibe-project

      - name: Run Migration
        working-directory: ./target-project
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          DATABASE_URI: postgresql://postgres:postgres@localhost:5432/postgres
        run: |
          chmod +x ./migrate-vibe-blocks.sh
          ./migrate-vibe-blocks.sh ../vibe-project

      - name: Push to Target Repo
        working-directory: ./target-project
        run: |
          git remote add target https://x-access-token:${{ secrets.GH_PAT }}@github.com/${{ github.event.inputs.target_repo }}
          git push -u target main --force
```

### `incremental-sync.yml` (Update-Sync)
Diesen Workflow startest du manuell über den **"Run workflow"** Button, sobald du in AI Studio Änderungen gepusht hast. Er erstellt einen Pull Request im Ziel-Projekt.

```yaml
name: Incremental Vibe Sync
on:
  workflow_dispatch:
    inputs:
      vibe_repo:
        description: 'Vibe Repo (z.B. fs-devoniq/daniel-vibe)'
        required: true
      target_repo:
        description: 'Ziel Repo (z.B. fs-devoniq/daniel-website)'
        required: true

jobs:
  sync:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432

    steps:
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Gemini CLI
        run: npm install -g @google/gemini-cli

      - name: Clone Target Website
        run: git clone https://x-access-token:${{ secrets.GH_PAT }}@github.com/${{ github.event.inputs.target_repo }} target-project

      - name: Clone Vibe Project
        run: git clone https://x-access-token:${{ secrets.GH_PAT }}@github.com/${{ github.event.inputs.vibe_repo }} vibe-project

      - name: Run Sync
        working-directory: ./target-project
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          DATABASE_URI: postgresql://postgres:postgres@localhost:5432/postgres
        run: |
          chmod +x ./sync-vibe-updates.sh
          ./sync-vibe-updates.sh ../vibe-project .

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v6
        with:
          path: ./target-project
          token: ${{ secrets.GH_PAT }}
          commit-message: "feat(vibe): incremental sync from AI Studio"
          title: "🚀 Vibe Update: Neue Änderungen aus AI Studio"
          body: "Dieser PR wurde automatisch erstellt, um die neuesten UI-Änderungen aus AI Studio zu synchronisieren."
          branch: vibe-sync-update
```

## 3. Workflow im Alltag
1. **Neues Projekt:** Starte `Initial Vibe Migration` in der Factory.
2. **Änderungen in AI Studio:** Pushe den Code in AI Studio zu GitHub.
3. **Website aktualisieren:** Starte `Incremental Vibe Sync` in der Factory.
4. **Prüfen:** Gehe in dein Website-Repo und merge den neu erstellten Pull Request.

🎉 **Fertig!** Keine Webhooks, keine Token in URLs und AI Studio kann nichts kaputt machen.
