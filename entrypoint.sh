#!/bin/sh
set -e

# Secrets laden (enthaelt u.a. DATABASE_URL und PAYLOAD_SECRET)
if [ -f "/run/secrets/minimal-payload-mui_env" ]; then
  echo "Loading environment variables from minimal-payload-mui_env secret..."
  set -a
  . /run/secrets/minimal-payload-mui_env
  set +a
else
  echo "Secret file minimal-payload-mui_env not found. Skipping secret injection."
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
