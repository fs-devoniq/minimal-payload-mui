#!/bin/bash

# 1. UMGEBUNG LADEN
# Lade Umgebungsvariablen aus einer .env Datei, falls vorhanden
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# 2. VALIDIERUNG
# Prüfen, ob ein Pfad zum Vibe-Projekt übergeben wurde
VIBE_DIR=$1

if [ -z "$VIBE_DIR" ]; then
  echo "❌ Bitte gib den Pfad zu deinem Vibe-Projekt an."
  echo "💡 Nutzung: ./migrate-vibe-blocks.sh /Users/name/git/vibe-projekt"
  exit 1
fi

BLOCKS_PATH="$VIBE_DIR/src/blocks"

# Prüfen, ob der blocks Ordner existiert
if [ ! -d "$BLOCKS_PATH" ]; then
  echo "❌ Fehler: Ordner $BLOCKS_PATH nicht gefunden."
  exit 1
fi

# Prüfen, ob der API Key existiert
if [ -z "$GEMINI_API_KEY" ]; then
  echo "❌ Fehler: GEMINI_API_KEY ist nicht gesetzt."
  echo "💡 Bitte setze ihn vorher mit: export GEMINI_API_KEY=\"dein-key\""
  echo "Oder erstelle eine .env Datei im aktuellen Projekt-Ordner."
  exit 1
fi

echo "🔍 Vibe-Projekt gefunden: $VIBE_DIR"
echo "🚀 Starte optimierte Migration der Komponenten..."
echo "---------------------------------------------------"

# 3. LOOP FÜR ALLE EINZELNEN BLÖCKE
for BLOCK_DIR in "$BLOCKS_PATH"/*; do
  if [ -d "$BLOCK_DIR" ]; then
    BLOCK_NAME=$(basename "$BLOCK_DIR")
    FILE_PATH="$BLOCK_DIR/index.tsx"

    if [ -f "$FILE_PATH" ]; then
      echo "📦 Verarbeite Block: $BLOCK_NAME"
      echo "📄 Pfad: $FILE_PATH"
      
      # Optimierter Prompt für maximale Geschwindigkeit
      # Nutzt nacheinander die zwei Skills für Design und CMS-Struktur
      PROMPT="Migriere die Komponente '$BLOCK_NAME' aus der Datei $FILE_PATH.
      Schritt 1: Aktiviere den Skill 'nextjs-mui-converter' und wandle den Code der Datei in eine saubere MUI-Komponente für Next.js um. Speichere diese in src/components/$BLOCK_NAME/index.tsx.
      Schritt 2: Aktiviere danach den Skill 'payload-block-generator' für die gerade erstellte Komponente. Erstelle die Block-Konfiguration in src/blocks/$BLOCK_NAME/config.ts, registriere den Block in src/collections/Pages.ts und integriere das Rendering in src/components/PageTemplate.tsx.
      
      WICHTIG FÜR GESCHWINDIGKEIT: 
      Führe ABSOLUT KEIN LINTING (eslint) und KEINE TYPE-CHECKS (tsc) aus. 
      Überspringe die Validierung komplett, um Zeit zu sparen. Erstelle nur die Dateien."

      # -y für automatische Bestätigung (YOLO)
      # -p für automatische Abarbeitung im Hintergrund (Headless)
      gemini -y -p "$PROMPT"
      
      if [ $? -ne 0 ]; then
        echo "❌ Fehler bei der Migration von $BLOCK_NAME! Breche Skript ab."
        exit 1
      fi
      
      echo "✅ $BLOCK_NAME erfolgreich migriert."
      echo "---------------------------------------------------"
    else
      echo "⚠️ Keine index.tsx in $BLOCK_NAME gefunden. Überspringe..."
    fi
  fi
done

# 4. ABSCHLUSS: GLOBALE ELEMENTE (NAVBAR & FOOTER)
echo "🌐 Suche nach globalen Elementen (Navbar/Footer) im Vibe-Projekt..."

GLOBAL_PROMPT="Aktiviere den Skill 'payload-globals-generator'. 
Suche im Vibe-Projekt unter $VIBE_DIR (schau in src/components oder src/App.tsx) nach Header/Navbar und Footer Komponenten.
Konvertiere diese in Material-UI (MUI).
Erstelle dafür Payload Globals (z.B. Header und Footer Globals).
Integriere diese in das globale Frontend-Layout (src/app/(frontend)/layout.tsx), sodass sie auf jeder Unterseite erscheinen.

WICHTIG: Führe ABSOLUT KEIN LINTING (eslint) und KEINE TYPE-CHECKS (tsc) aus."

gemini -y -p "$GLOBAL_PROMPT"

if [ $? -ne 0 ]; then
  echo "⚠️ Fehler bei der Erstellung der globalen Elemente."
else
  echo "✅ Globale Elemente (Header/Footer) erfolgreich integriert."
fi

echo "---------------------------------------------------"
echo "🎉 Migration abgeschlossen!"
echo "🧹 Führe nun den Post-Migration Validator aus (Linting, Typen, Auto-Fixing)..."

VALIDATOR_PROMPT="Aktiviere den Skill 'post-migration-validator'. Führe die dort definierten Schritte (Prettier, ESLint mit --fix, tsc --noEmit) aus und behebe eventuell verbleibende Code- oder Typfehler, die während der Migration entstanden sind."

gemini -y -p "$VALIDATOR_PROMPT"

if [ $? -ne 0 ]; then
  echo "⚠️ Der Validator konnte nicht alle Fehler automatisch beheben. Bitte manuell prüfen."
else
  echo "✅ Alles fehlerfrei! Migration und Validierung komplett abgeschlossen."
fi