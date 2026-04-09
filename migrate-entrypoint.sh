#!/bin/sh
set -e

if [ -f "/run/secrets/payload_env" ]; then
  echo "Loading environment variables from payload_env secret..."
  # Sicher einlesen ohne 'source'/'eval', um Fehler durch Sonderzeichen in Passwörtern zu vermeiden
  while IFS='=' read -r key value; do
    case "$key" in
        '#'*|"") continue ;;
    esac
    value=$(echo "$value" | sed -e "s/^'//" -e "s/'$//" -e 's/^"//' -e 's/"$//')
    export "$key=$value"
  done < "/run/secrets/payload_env"
else
  echo "ERROR: Secret file payload_env not found."
  exit 1
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL ist nicht gesetzt."
  exit 1
fi

if [ -z "${PAYLOAD_SECRET:-}" ]; then
  echo "ERROR: PAYLOAD_SECRET ist nicht gesetzt."
  exit 1
fi

echo "Running Payload migrations..."
ATTEMPTS=0
MAX_ATTEMPTS=30
PAYLOAD_CLI="./node_modules/.bin/payload"

if [ ! -x "$PAYLOAD_CLI" ]; then
  echo "ERROR: Payload CLI not found at $PAYLOAD_CLI"
  exit 1
fi

until NODE_OPTIONS=--no-deprecation "$PAYLOAD_CLI" migrate; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ "$ATTEMPTS" -ge "$MAX_ATTEMPTS" ]; then
    echo "ERROR: Migration failed after ${MAX_ATTEMPTS} attempts."
    exit 1
  fi

  echo "Migration attempt ${ATTEMPTS}/${MAX_ATTEMPTS} failed. Retrying in 2s..."
  sleep 2
done

echo "Payload migrations complete."
