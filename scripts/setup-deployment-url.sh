#!/bin/bash
set -e

# Erwartete Umgebungsvariablen:
# IONOS_API_KEY, IONOS_ZONE_ID, NPM_HOST, NPM_USER, NPM_PASS, DEPLOY_HOST, STACK_NAME

# 1. Subdomain aus dem Stack-Namen (Repository-Namen) ableiten
SUBDOMAIN=$(echo "$STACK_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')
FULL_DOMAIN="${SUBDOMAIN}.devoniq.de"

echo "🚀 Starte Setup für $FULL_DOMAIN"

# 2. IONOS DNS Eintrag erstellen
echo "📡 Erstelle IONOS DNS Record für $SUBDOMAIN pointing to $DEPLOY_HOST..."
IONOS_RESPONSE=$(curl -s -X POST "https://api.hosting.ionos.com/dns/v1/zones/$IONOS_ZONE_ID/records" \
     -H "X-API-Key: $IONOS_API_KEY" \
     -H "Content-Type: application/json" \
     -d "[{
       \"name\": \"$SUBDOMAIN\",
       \"type\": \"A\",
       \"content\": \"$DEPLOY_HOST\",
       \"ttl\": 3600,
       \"prio\": 0,
       \"disabled\": false
     }]")

if echo "$IONOS_RESPONSE" | grep -q "id"; then
  echo "✅ DNS Record erfolgreich angelegt."
elif echo "$IONOS_RESPONSE" | grep -q "ALREADY_EXISTS"; then
  echo "ℹ️ DNS Record existiert bereits bei IONOS. Alles okay."
else
  echo "⚠️ IONOS API Antwort: $IONOS_RESPONSE"
fi

# 3. NPM Login & Token holen
echo "🔑 Logge bei Nginx Proxy Manager ein ($NPM_HOST)..."
NPM_TOKEN=$(curl -s -X POST "${NPM_HOST}/api/tokens" \
  -H "Content-Type: application/json" \
  -d "{\"identity\": \"$NPM_USER\", \"secret\": \"$NPM_PASS\"}" | jq -r .token)

if [ "$NPM_TOKEN" == "null" ] || [ -z "$NPM_TOKEN" ]; then
  echo "❌ Fehler: NPM Login fehlgeschlagen!"
  exit 1
fi

# 4. NPM Proxy Host prüfen oder erstellen
echo "🔍 Suche bestehenden Proxy Host in NPM..."
EXISTING_HOST=$(curl -s -X GET "${NPM_HOST}/api/nginx/proxy-hosts" \
  -H "Authorization: Bearer $NPM_TOKEN" \
  | jq -r ".[]? | select(.domain_names[]? == \"$FULL_DOMAIN\")")

FORWARD_HOST="${STACK_NAME}_app"

if [ -n "$EXISTING_HOST" ]; then
  HOST_ID=$(echo "$EXISTING_HOST" | jq -r .id)
  CERT_ID=$(echo "$EXISTING_HOST" | jq -r .certificate_id)
  echo "ℹ️ Proxy Host existiert bereits (ID: $HOST_ID)."
else
  echo "🌐 Erstelle neuen NPM Proxy Host: $FULL_DOMAIN -> http://$FORWARD_HOST:3000"
  CREATE_RESPONSE=$(curl -s -X POST "${NPM_HOST}/api/nginx/proxy-hosts" \
    -H "Authorization: Bearer $NPM_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"domain_names\": [\"$FULL_DOMAIN\"],
      \"forward_scheme\": \"http\",
      \"forward_host\": \"$FORWARD_HOST\",
      \"forward_port\": 3000,
      \"access_list_id\": 0,
      \"certificate_id\": 0,
      \"ssl_forced\": false,
      \"block_exploits\": true,
      \"allow_websocket_upgrade\": true,
      \"meta\": {},
      \"advanced_config\": \"\",
      \"locations\": []
    }")
  HOST_ID=$(echo "$CREATE_RESPONSE" | jq -r .id)
  CERT_ID=0
  echo "✅ Proxy Host erstellt (ID: $HOST_ID)."
fi

# 5. SSL (Let's Encrypt) einrichten, falls noch nicht vorhanden
if [ "$CERT_ID" == "0" ] || [ "$CERT_ID" == "null" ]; then
  echo "🔐 Fordere SSL Zertifikat (Let's Encrypt) an..."
  echo "⏳ Warte 10 Sekunden, damit DNS greifen kann..."
  sleep 10

  # Wir nutzen die PUT Methode auf dem Proxy Host, um SSL zu aktivieren
  # NPM wird versuchen, das Zertifikat automatisch zu generieren
  SSL_RESPONSE=$(curl -s -X PUT "${NPM_HOST}/api/nginx/proxy-hosts/$HOST_ID" \
    -H "Authorization: Bearer $NPM_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"domain_names\": [\"$FULL_DOMAIN\"],
      \"forward_scheme\": \"http\",
      \"forward_host\": \"$FORWARD_HOST\",
      \"forward_port\": 3000,
      \"certificate_id\": \"new\",
      \"ssl_forced\": true,
      \"http2_support\": true,
      \"hsts_enabled\": true,
      \"meta\": {
        \"letsencrypt_email\": \"$NPM_USER\",
        \"letsencrypt_agree\": true
      }
    }")

  if echo "$SSL_RESPONSE" | grep -q "certificate_id"; then
    NEW_CERT_ID=$(echo "$SSL_RESPONSE" | jq -r .certificate_id)
    echo "✅ SSL erfolgreich aktiviert (Zertifikat ID: $NEW_CERT_ID)."
  else
    echo "⚠️ SSL Aktivierung fehlgeschlagen. NPM Antwort: $SSL_RESPONSE"
    echo "ℹ️ Möglicherweise ist DNS noch nicht propagiert. Du kannst SSL später manuell im NPM Dashboard aktivieren."
  fi
else
  echo "✅ SSL ist bereits aktiv."
fi

echo "✅ Setup abgeschlossen."
echo "DEPLOY_URL=$FULL_DOMAIN" >> $GITHUB_OUTPUT
echo "SUBDOMAIN=$SUBDOMAIN" >> $GITHUB_OUTPUT

