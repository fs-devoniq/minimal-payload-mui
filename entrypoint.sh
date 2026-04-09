#!/bin/sh
set -e

# Secrets laden (enthaelt u.a. DATABASE_URL und PAYLOAD_SECRET)
if [ -f "/run/secrets/payload_env" ]; then
  echo "Loading environment variables from payload_env secret..."
  # Sicher einlesen ohne 'source'/'eval', um Fehler durch Sonderzeichen in Passwörtern zu vermeiden
  while IFS='=' read -r key value; do
    # Ignoriere leere Zeilen und Kommentare
    case "$key" in
        '#'*|"") continue ;;
    esac
    
    # Entferne eventuelle umschließende Anführungszeichen (einfach oder doppelt)
    value=$(echo "$value" | sed -e "s/^'//" -e "s/'$//" -e 's/^"//' -e 's/"$//')
    
    export "$key=$value"
  done < "/run/secrets/payload_env"
else
  echo "Secret file payload_env not found. Skipping secret injection."
fi

# Pflichtwerte validieren, damit Fehler direkt sichtbar sind
if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL ist nicht gesetzt."
  exit 1
fi

if [ -z "${PAYLOAD_SECRET:-}" ]; then
  echo "ERROR: PAYLOAD_SECRET ist nicht gesetzt."
  exit 1
fi

# Upload-Pfade sicherstellen
mkdir -p /app/uploads/media

exec "$@"
