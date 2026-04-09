#!/bin/bash

# --- EINSTELLUNGEN ---
SHOW_THOUGHTS=false
VIBE_DIR=""
START_TIME=$(date +%s)

# --- ARGUMENT-PARSING ---
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -v|--verbose) SHOW_THOUGHTS=true ;;
        *) VIBE_DIR=$1 ;;
    esac
    shift
done

# --- HILFSFUNKTIONEN FÜR DIE UI ---
# Farben
C_RESET="\033[0m"
C_GREEN="\033[32m"
C_BLUE="\033[34m"
C_CYAN="\033[36m"
C_YELLOW="\033[33m"
C_RED="\033[31m"
C_GRAY="\033[90m"

# Fortschrittsbalken zeichnen
function draw_progress() {
    local label=$1
    local current=$2
    local total=$3
    local width=30
    local percent=$((current * 100 / total))
    local filled=$((current * width / total))
    local empty=$((width - filled))
    
    local bar=$(printf "%${filled}s" | tr ' ' '█')
    local space=$(printf "%${empty}s" | tr ' ' '░')
    
    echo -e "${C_CYAN}${label}${C_RESET} ${C_GREEN}[${bar}${C_GRAY}${space}${C_GREEN}]${C_RESET} ${percent}% (${current}/${total})"
}

# Gemini ausführen mit schickem Output oder Log
function run_gemini() {
    local prompt=$1
    local log_file=".gemini-migration.log"
    
    if [ "$SHOW_THOUGHTS" = true ]; then
        echo -e "${C_GRAY}╭─── Gemini AI denkt...${C_RESET}"
        # Fange stdout/stderr und formatiere jede Zeile mit einem Seitenstreifen
        gemini -y -p "$prompt" 2>&1 | while IFS= read -r line; do
            echo -e "${C_GRAY}│${C_CYAN}  $line${C_RESET}"
        done
        # Check den Exit-Status von PIPESTATUS[0] wegen der Pipe
        local exit_code=${PIPESTATUS[0]}
        echo -e "${C_GRAY}╰──────────────────────${C_RESET}"
        return $exit_code
    else
        # Silent Mode: Lade-Spinner Simulation & Loggen
        gemini -y -p "$prompt" >> "$log_file" 2>&1
        return $?
    fi
}

# --- 1. UMGEBUNG LADEN ---
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# --- 2. VALIDIERUNG ---
if [ -z "$VIBE_DIR" ]; then
  echo -e "${C_RED}❌ Bitte gib den Pfad zu deinem Vibe-Projekt an.${C_RESET}"
  echo -e "${C_YELLOW}💡 Nutzung: ./migrate-vibe-blocks.sh [-v|--verbose] /Users/name/git/vibe-projekt${C_RESET}"
  exit 1
fi

BLOCKS_PATH="$VIBE_DIR/src/blocks"

if [ ! -d "$BLOCKS_PATH" ]; then
  echo -e "${C_RED}❌ Fehler: Ordner $BLOCKS_PATH nicht gefunden.${C_RESET}"
  exit 1
fi

if [ -z "$GEMINI_API_KEY" ]; then
  echo -e "${C_RED}❌ Fehler: GEMINI_API_KEY ist nicht gesetzt.${C_RESET}"
  exit 1
fi

# Log-Datei leeren
> .gemini-migration.log

# Zähle alle Blöcke
BLOCK_DIRS=($(find "$BLOCKS_PATH" -mindepth 1 -maxdepth 1 -type d))
TOTAL_BLOCKS=${#BLOCK_DIRS[@]}

if [ "$TOTAL_BLOCKS" -eq 0 ]; then
  echo -e "${C_YELLOW}⚠️ Keine Blöcke in $BLOCKS_PATH gefunden.${C_RESET}"
  exit 0
fi

# Gesamtschritte = Theme + Blöcke + Globals + Validator
TOTAL_STEPS=$((TOTAL_BLOCKS + 3))
CURRENT_STEP=0
CURRENT_BLOCK=0

echo -e "\n${C_BLUE}=======================================================${C_RESET}"
echo -e "${C_BLUE}🚀 STARTE OPTIMIERTE PAYLOAD & MUI MIGRATION${C_RESET}"
echo -e "${C_BLUE}=======================================================${C_RESET}\n"
echo -e "🔍 Projekt: ${C_YELLOW}$VIBE_DIR${C_RESET}"
if [ "$SHOW_THOUGHTS" = false ]; then
    echo -e "🤫 Silent Mode aktiv (Details in .gemini-migration.log. Nutze -v für Gemini-Gedanken)\n"
fi

# --- 3. THEME MIGRATION ---
CURRENT_STEP=$((CURRENT_STEP + 1))
echo ""
draw_progress "Gesamtfortschritt:" $CURRENT_STEP $TOTAL_STEPS
echo -e "🎨 Verarbeite Theme & Farben..."

THEME_PROMPT="Aktiviere den Skill 'theme-migrator'. Analysiere das Vibe-Projekt unter dem Pfad $VIBE_DIR und migriere die Farben in unser MUI Base Theme und in die Payload Settings."

run_gemini "$THEME_PROMPT"

if [ $? -ne 0 ]; then
  echo -e "${C_YELLOW}⚠️ Fehler bei der Migration des Themes. Nutze Fallback-Farben.${C_RESET}"
else
  echo -e "${C_GREEN}✅ Theme und Farben erfolgreich migriert.${C_RESET}"
fi

# --- 4. LOOP FÜR ALLE EINZELNEN BLÖCKE ---
for BLOCK_DIR in "${BLOCK_DIRS[@]}"; do
    BLOCK_NAME=$(basename "$BLOCK_DIR")
    FILE_PATH="$BLOCK_DIR/index.tsx"

    CURRENT_STEP=$((CURRENT_STEP + 1))
    CURRENT_BLOCK=$((CURRENT_BLOCK + 1))

    echo ""
    draw_progress "Gesamtfortschritt:" $CURRENT_STEP $TOTAL_STEPS
    draw_progress "Komponenten:  " $CURRENT_BLOCK $TOTAL_BLOCKS
    echo -e "📦 Verarbeite Block: ${C_YELLOW}$BLOCK_NAME${C_RESET}"

    if [ -f "$FILE_PATH" ]; then
      
      PROMPT="Migriere die Komponente '$BLOCK_NAME' aus der Datei $FILE_PATH.
      Schritt 1: Aktiviere den Skill 'mui-nextjs-refiner' und bereinige die MUI-Komponente (Theme-Farben mappen, Next.js Bilder/Links anpassen). Speichere diese in src/components/$BLOCK_NAME/index.tsx.
      Schritt 2: Aktiviere danach den Skill 'payload-block-generator' für die gerade erstellte Komponente. Erstelle die Block-Konfiguration in src/blocks/$BLOCK_NAME/config.ts, registriere den Block in src/collections/Pages.ts und integriere das Rendering in src/components/PageTemplate.tsx.
      
      WICHTIG FÜR GESCHWINDIGKEIT: 
      Führe ABSOLUT KEIN LINTING (eslint) und KEINE TYPE-CHECKS (tsc) aus. 
      Überspringe die Validierung komplett, um Zeit zu sparen. Erstelle nur die Dateien."

      run_gemini "$PROMPT"
      
      if [ $? -ne 0 ]; then
        echo -e "${C_RED}❌ Fehler bei der Migration von $BLOCK_NAME! Breche Skript ab.${C_RESET}"
        exit 1
      fi
      echo -e "${C_GREEN}✅ $BLOCK_NAME erfolgreich migriert.${C_RESET}"
    else
      echo -e "${C_YELLOW}⚠️ Keine index.tsx in $BLOCK_NAME gefunden. Überspringe...${C_RESET}"
    fi
done

# --- 4. GLOBALE ELEMENTE (NAVBAR & FOOTER) ---
CURRENT_STEP=$((CURRENT_STEP + 1))
echo ""
draw_progress "Gesamtfortschritt:" $CURRENT_STEP $TOTAL_STEPS
echo -e "🌐 Verarbeite Globale Elemente (Header/Footer)..."

GLOBAL_PROMPT="Aktiviere den Skill 'payload-globals-generator'. 
Suche im Vibe-Projekt unter $VIBE_DIR (schau in src/components oder src/App.tsx) nach Header/Navbar und Footer Komponenten.
Konvertiere diese in Material-UI (MUI).
Erstelle dafür Payload Globals (z.B. Header und Footer Globals).
Integriere diese in das globale Frontend-Layout (src/app/(frontend)/layout.tsx), sodass sie auf jeder Unterseite erscheinen.

WICHTIG: Führe ABSOLUT KEIN LINTING (eslint) und KEINE TYPE-CHECKS (tsc) aus."

run_gemini "$GLOBAL_PROMPT"

if [ $? -ne 0 ]; then
  echo -e "${C_YELLOW}⚠️ Fehler bei der Erstellung der globalen Elemente.${C_RESET}"
else
  echo -e "${C_GREEN}✅ Globale Elemente erfolgreich integriert.${C_RESET}"
fi

# --- 5. VALIDATOR ---
CURRENT_STEP=$((CURRENT_STEP + 1))
echo ""
draw_progress "Gesamtfortschritt:" $CURRENT_STEP $TOTAL_STEPS
echo -e "🧹 Führe den Post-Migration Validator aus (Linting, Typen, Auto-Fixing)..."

VALIDATOR_PROMPT="Aktiviere den Skill 'post-migration-validator'. Führe die dort definierten Schritte (Prettier, ESLint mit --fix, tsc --noEmit) aus und behebe eventuell verbleibende Code- oder Typfehler, die während der Migration entstanden sind."

run_gemini "$VALIDATOR_PROMPT"

if [ $? -ne 0 ]; then
  echo -e "${C_YELLOW}⚠️ Der Validator konnte nicht alle Fehler automatisch beheben. Bitte manuell prüfen.${C_RESET}"
else
  echo -e "${C_GREEN}✅ Alles fehlerfrei! Validierung abgeschlossen.${C_RESET}"
fi

# --- 6. DATENBANK MIGRATION ERSTELLEN ---
CURRENT_STEP=$((CURRENT_STEP + 1))
echo ""
draw_progress "Gesamtfortschritt:" $CURRENT_STEP $TOTAL_STEPS
echo -e "🗄️ Erstelle Payload Datenbank-Migration..."

# Da wir yarn nutzen, rufen wir yarn payload migrate:create auf
MIGRATION_NAME="vibe_migration"
yarn payload migrate:create $MIGRATION_NAME

if [ $? -ne 0 ]; then
  echo -e "${C_YELLOW}⚠️ Migration konnte nicht erstellt werden. Bitte manuell prüfen (yarn payload migrate:create).${C_RESET}"
else
  echo -e "${C_GREEN}✅ Datenbank-Migration erfolgreich erstellt.${C_RESET}"
fi

echo -e "\n${C_GREEN}=======================================================${C_RESET}"
echo -e "${C_GREEN}🎉 MIGRATION KOMPLETT ABGESCHLOSSEN!${C_RESET}"

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

echo -e "${C_CYAN}⏱️  Dauer: ${MINUTES} Minuten und ${SECONDS} Sekunden${C_RESET}"
echo -e "${C_GREEN}=======================================================${C_RESET}\n"