#!/bin/bash

# Prüfen, ob ein Pfad übergeben wurde
VIBE_DIR=$1

if [ -z "$VIBE_DIR" ]; then
  echo "❌ Bitte gib den Pfad zu deinem Vibe-Projekt an."
  echo "💡 Nutzung: ./migrate-vibe-blocks.sh ../dein-vibe-projekt"
  exit 1
fi

BLOCKS_PATH="$VIBE_DIR/src/blocks"

# Prüfen, ob der blocks Ordner existiert
if [ ! -d "$BLOCKS_PATH" ]; then
  echo "❌ Fehler: Ordner $BLOCKS_PATH nicht gefunden."
  exit 1
fi

echo "🔍 Vibe-Projekt gefunden. Starte schrittweise Migration..."
echo "---------------------------------------------------"

# Durchlaufe alle Ordner in src/blocks/
for BLOCK_DIR in "$BLOCKS_PATH"/*; do
  if [ -d "$BLOCK_DIR" ]; then
    BLOCK_NAME=$(basename "$BLOCK_DIR")
    FILE_PATH="$BLOCK_DIR/index.tsx"

    if [ -f "$FILE_PATH" ]; then
      echo "🚀 Starte Migration für Block: $BLOCK_NAME"
      echo "📄 Lese Original-Code: $FILE_PATH"
      
      # Die Anweisung kombiniert nun exakt deine zwei Schritte in einer Session:
      # 1. Konvertierung in MUI
      # 2. Payload-Block Generierung basierend auf dem Ergebnis
      PROMPT="Ich möchte die Komponente '$BLOCK_NAME' aus der Datei $FILE_PATH migrieren.
      Schritt 1: Aktiviere den Skill 'nextjs-mui-converter' und wandle den Code der Datei in eine saubere MUI-Komponente für Next.js um. Speichere diese in src/components/$BLOCK_NAME/index.tsx.
      Schritt 2: Aktiviere danach den Skill 'payload-block-generator' für die gerade erstellte Komponente. Erstelle die Block-Konfiguration in src/blocks/$BLOCK_NAME/config.ts, registriere den Block in src/collections/Pages.ts und integriere das Rendering in src/components/PageTemplate.tsx.
      Gehe exakt so vor wie beschrieben."

      gemini -y -p "$PROMPT"
      
      echo "✅ Migration für $BLOCK_NAME vollständig abgeschlossen."
      echo "---------------------------------------------------"
    else
      echo "⚠️ Keine index.tsx in $BLOCK_NAME gefunden. Überspringe..."
    fi
  fi
done

echo "🎉 Alle Blöcke wurden erfolgreich nach deiner Methode migriert!"
