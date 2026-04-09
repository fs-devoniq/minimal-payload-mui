# Setup: Vibe Factory (GitHub Actions)

Dieses Repository dient als zentrale Fabrik, um Vibe-Projekte in Payload CMS Websites zu verwandeln und synchron zu halten.

## 1. Repository vorbereiten
1. Erstelle ein neues, privates GitHub Repo namens `vibe-factory`.
2. Gehe zu **Settings > Secrets and variables > Actions**.
3. Füge folgende **Repository Secrets** hinzu:
   - `GEMINI_API_KEY`: Dein Google Gemini API Key.
   - `GH_PAT`: Ein GitHub Personal Access Token mit `repo` Berechtigungen (damit die Action in andere Repos pushen kann).

## 2. Workflows anlegen

Erstelle den Ordner `.github/workflows/` und lege dort folgende zwei Dateien an:

### `initial-migration.yml` (Die Geburtsstunde)
Dieser Workflow erstellt aus einem Vibe-Repo eine neue Website.

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

### `incremental-sync.yml` (Das Update-System)
Dieser Workflow wird getriggert, wenn du im Vibe-Repo etwas pushst.

```yaml
name: Incremental Vibe Sync
on:
  repository_dispatch:
    types: [vibe_push]

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
        run: git clone https://x-access-token:${{ secrets.GH_PAT }}@github.com/${{ github.event.client_payload.target_repo }} target-project

      - name: Clone Vibe Project
        run: git clone https://x-access-token:${{ secrets.GH_PAT }}@github.com/${{ github.event.client_payload.vibe_repo }} vibe-project

      - name: Run Sync
        working-directory: ./target-project
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
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

## 3. Webhook im Vibe-Repo einrichten
Damit der Sync automatisch startet, musst du im Vibe-Repo unter **Settings > Webhooks** einen Webhook hinzufügen:
- **Payload URL:** `https://api.github.com/repos/[DEIN_USER]/vibe-factory/dispatches`
- **Content type:** `application/json`
- **Secret:** (optional)
- **Events:** `Just the push event`
- **Payload:** (muss via GitHub Action im Vibe Repo oder manuell gesendet werden, um den `repository_dispatch` zu triggern).
