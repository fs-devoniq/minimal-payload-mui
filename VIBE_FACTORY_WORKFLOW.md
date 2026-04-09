# Vibe Factory: Automatisierter Cloud-Workflow

Dieses Dokument beschreibt den automatisierten Workflow über das `vibe-factory` Repository. Im Gegensatz zum lokalen `VIBE_MIGRATION_GUIDE.md` findet hier die gesamte Arbeit (Migration, Refactoring, Sync) in der GitHub Cloud statt.

## Übersicht: Was ist die Vibe Factory?
Die Factory ist dein zentrales Kontrollzentrum. Sie nimmt den "rohen" UI-Code aus AI Studio und transformiert ihn vollautomatisch in ein professionelles Payload CMS Projekt, ohne dass du lokal Skripte ausführen oder Datenbanken verwalten musst.

---

## 1. Vorbereitung (Einmalig)
Bevor du startest, stelle sicher, dass:
1. Dein `vibe-factory` Repository existiert.
2. Die Secrets `GEMINI_API_KEY` und `GH_PAT` in der Factory hinterlegt sind.
3. Du den System-Prompt aus `AI_STUDIO_PROMPT.md` in deinem AI Studio Projekt verwendest.

---

## 2. Der "Initial Migration" Workflow (Projektstart)

Diesen Schritt führst du aus, wenn du ein neues Vibe-Projekt zum ersten Mal in eine Website verwandeln willst.

### Manuelle Schritte:
1. Erstelle ein leeres, privates Ziel-Repository auf GitHub (z.B. `projekt-website`).
2. Gehe in dein **vibe-factory** Repo -> **Actions** -> **Initial Vibe Migration**.
3. Klicke auf **Run workflow** und fülle die Felder aus:
   - `vibe_repo`: Das Repo aus AI Studio (z.B. `fs-devoniq/projekt-vibe`)
   - `target_repo`: Dein leeres Ziel-Repo (z.B. `fs-devoniq/projekt-website`)
4. Klicke auf **Run workflow**.

### Was im Hintergrund passiert:
- **Cloud Runner:** GitHub startet einen virtuellen Server (Ubuntu).
- **Datenbank:** Ein Docker-Container mit PostgreSQL wird im Runner gestartet.
- **Template-Klon:** Die Factory klont das `minimal-payload-mui` Template.
- **Vibe-Klon:** Dein AI Studio Code wird daneben geklont.
- **Gemini Migration:** Das Skript `migrate-vibe-blocks.sh` läuft im Runner. Die KI analysiert alle Vibe-Komponenten, baut MUI-Versionen und erstellt die Payload-Block-Konfigurationen.
- **Deployment:** Der fertige Code wird per "Force Push" in dein Ziel-Repo geschoben.

---

## 3. Der "Incremental Sync" Workflow (Updates)

Diesen Schritt führst du aus, wenn du in AI Studio Änderungen gemacht und gepusht hast.

### Manuelle Schritte:
1. Pushe deine Änderungen in **AI Studio** (Vibe).
2. Gehe in dein **vibe-factory** Repo -> **Actions** -> **Incremental Vibe Sync**.
3. Klicke auf **Run workflow** und gib wieder die Namen der beiden Repos ein.
4. Klicke auf **Run workflow**.

### Was im Hintergrund passiert:
- **Analyse:** Das Skript `sync-vibe-updates.sh` vergleicht den neuen Vibe-Stand mit dem aktuellen Website-Stand.
- **Vibe-Updater Skill:** Die KI nutzt den spezialisierten `vibe-updater`. Er erkennt, welche Felder im CMS dazugekommen sind oder welche UI-Details sich geändert haben.
- **Chirurgisches Update:** Anstatt alles neu zu bauen, werden bestehende Dateien gezielt aktualisiert (Refactoring).
- **Pull Request:** Die Factory pusht die Änderungen nicht direkt in den `main` Zweig, sondern erstellt einen **Pull Request (PR)** in deinem Website-Repo.
- **Review:** Du öffnest den PR in deinem Website-Repo, prüfst die Änderungen und klickst auf **Merge**.

---

## 4. Warum dieser Weg?
- **Keine lokale Umgebung nötig:** Du brauchst kein Node, kein Docker und kein Git lokal installiert zu haben, um die Migration zu starten.
- **AI Studio Sicherheit:** Da wir keine Dateien zurück in das Vibe-Repo schreiben, kann AI Studio nichts löschen oder verfälschen.
- **Kontrolle:** Durch die Pull Requests beim Sync-Workflow hast du immer das letzte Wort, bevor Code in deine Live-Website fließt.
- **Zentralisierung:** Alle deine Projekte werden über eine einzige Factory verwaltet.

---

## 💡 Profi-Tipp
Wenn du lokal an der Website arbeiten willst, klone dir einfach das migrierte Ziel-Repo (`projekt-website`). Du kannst dort manuelle Anpassungen machen. Der `vibe-updater` ist so trainiert, dass er versucht, deine manuellen Änderungen beim nächsten Sync so gut wie möglich zu respektieren, solange du die Struktur der Blöcke nicht komplett zerstörst.
