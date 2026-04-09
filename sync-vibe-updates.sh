#!/bin/bash

# --- EINSTELLUNGEN ---
VIBE_DIR=$1
TARGET_DIR=$2 # Meistens "." (das aktuelle Verzeichnis der Website)

if [ -z "$VIBE_DIR" ] || [ -z "$TARGET_DIR" ]; then
  echo "❌ Nutzung: ./sync-vibe-updates.sh [PFAD_ZU_VIBE] [PFAD_ZU_TARGET]"
  exit 1
fi

# Farben für Output
C_CYAN="\033[36m"
C_GREEN="\033[32m"
C_YELLOW="\033[33m"
C_RESET="\033[0m"

echo -e "${C_CYAN}🔄 Starte inkrementellen Vibe-Sync...${C_RESET}"

# 1. Geänderte Dateien im Vibe-Repo finden (Letzter Commit)
cd "$VIBE_DIR"
CHANGED_FILES=$(git diff --name-only HEAD~1)
cd - > /dev/null

if [ -z "$CHANGED_FILES" ]; then
  echo -e "${C_YELLOW}⚠️ Keine Änderungen im Vibe-Repo gefunden.${C_RESET}"
  exit 0
fi

echo -e "🔍 Gefundene Änderungen:\n$CHANGED_FILES\n"

# 2. Loop über die geänderten Dateien
for FILE in $CHANGED_FILES; do
    # Wir interessieren uns nur für Komponenten/Blocks
    if [[ "$FILE" == *"src/blocks/"* ]] && [[ "$FILE" == *"/index.tsx" ]]; then
        BLOCK_NAME=$(basename $(dirname "$FILE"))
        echo -e "${C_CYAN}📦 Aktualisiere Block: $BLOCK_NAME...${C_RESET}"
        
        PROMPT="Aktiviere den Skill 'vibe-updater'. 
        Die Vibe-Komponente '$BLOCK_NAME' wurde geändert (Datei: $VIBE_DIR/$FILE).
        Synchronisiere diese Änderungen mit der bestehenden Implementierung in $TARGET_DIR/src/components/$BLOCK_NAME und der Payload-Config in $TARGET_DIR/src/blocks/$BLOCK_NAME/config.ts.
        
        WICHTIG: Führe KEIN LINTING aus."

        gemini -y -p "$PROMPT"
        
        if [ $? -eq 0 ]; then
          echo -e "${C_GREEN}✅ $BLOCK_NAME erfolgreich aktualisiert.${C_RESET}"
        else
          echo -e "❌ Fehler beim Update von $BLOCK_NAME."
        fi
    fi

    # Theme/Farben Check (falls tailwind oder theme.ts sich ändert)
    if [[ "$FILE" == *"tailwind.config"* ]] || [[ "$FILE" == *"src/theme"* ]]; then
        echo -e "${C_CYAN}🎨 Theme-Änderung erkannt. Starte Theme-Sync...${C_RESET}"
        gemini -y -p "Aktiviere den Skill 'theme-migrator'. Synchronisiere die neuen Theme-Einstellungen aus $VIBE_DIR/$FILE mit unserem Projekt."
    fi
done

echo -e "\n${C_CYAN}🗄️ Erstelle Payload Datenbank-Migration für die Updates...${C_RESET}"
# Setze Dummy-Werte für CI/CD Umgebungen
PAYLOAD_SECRET="${PAYLOAD_SECRET:-dummy_secret_for_ci_to_bypass_validation}" \
DATABASE_URL="${DATABASE_URL:-postgres://dummy:dummy@localhost:5432/dummy}" \
yarn payload migrate:create vibe_sync_update
if [ $? -ne 0 ]; then
  echo -e "${C_YELLOW}⚠️ Migration konnte nicht automatisch erstellt werden. Bitte manuell ausführen.${C_RESET}"
else
  echo -e "${C_GREEN}✅ Payload CLI erfolgreich ausgeführt.${C_RESET}"
  
  # Prüfen, ob wirklich eine neue Datei in src/migrations/ erstellt wurde
  if git status --porcelain src/migrations/ | grep -q "^??"; then
    git add src/migrations/
    git commit -m "chore(db): auto-generate migration after vibe sync update"
    echo -e "${C_GREEN}💾 Neue Migration erkannt und committet.${C_RESET}"
  else
    echo -e "${C_YELLOW}ℹ️ Keine Schema-Änderungen erkannt. Es wurde keine neue Migration erstellt.${C_RESET}"
  fi
fi

echo -e "\n${C_GREEN}✨ Sync abgeschlossen!${C_RESET}"
