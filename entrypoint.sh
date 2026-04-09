#!/bin/sh
set -e

# Secrets laden (enthaelt u.a. DATABASE_URL und PAYLOAD_SECRET)
if [ -f "/run/secrets/payload_env" ]; then
  echo "Loading environment variables from payload_env secret..."
  set -a
  . /run/secrets/payload_env
  set +a
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
