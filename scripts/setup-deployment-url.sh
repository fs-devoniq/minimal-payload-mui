#!/bin/bash
set -e

# Erwartete Umgebungsvariablen:
# IONOS_API_KEY, IONOS_ZONE_ID, NPM_HOST, NPM_USER, NPM_PASS, DEPLOY_HOST, STACK_NAME

# 1. Subdomain aus dem Stack-Namen (Repository-Namen) ableiten
# Macht alles klein und ersetzt ungültige Zeichen durch Bindestriche
SUBDOMAIN=$(echo "$STACK_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')
FULL_DOMAIN="${SUBDOMAIN}.devoniq.de"

echo "🚀 Starte Setup für $FULL_DOMAIN"

# 2. IONOS DNS Eintrag erstellen (Fehler ignorieren, falls er schon existiert)
echo "📡 Erstelle IONOS DNS Record für $SUBDOMAIN pointing to $DEPLOY_HOST..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "https://api.hosting.ionos.com/dns/v1/zones/$IONOS_ZONE_ID/records" \
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

if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 201 ] || [ "$HTTP_STATUS" -eq 202 ]; then
  echo "✅ DNS Record angelegt."
else
  echo "ℹ️ DNS Record API gab Status $HTTP_STATUS zurück. (Existiert wahrscheinlich bereits - wird übersprungen)."
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

# 4. NPM Proxy Host prüfen & erstellen
echo "🔍 Prüfe, ob Proxy Host bereits in NPM existiert..."
EXISTING_HOST_ID=$(curl -s -X GET "${NPM_HOST}/api/nginx/proxy-hosts" \
  -H "Authorization: Bearer $NPM_TOKEN" \
  | jq -r ".[]? | select(.domain_names[]? == \"$FULL_DOMAIN\") | .id")

FORWARD_HOST="${STACK_NAME}_app"

if [ -n "$EXISTING_HOST_ID" ]; then
  echo "ℹ️ Proxy Host existiert bereits (ID: $EXISTING_HOST_ID). Überspringe Neuerstellung."
else
  echo "🌐 Erstelle neuen NPM Proxy Host: $FULL_DOMAIN -> http://$FORWARD_HOST:3000"
  curl -s -X POST "${NPM_HOST}/api/nginx/proxy-hosts" \
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
    }" > /dev/null
  echo "✅ Proxy Host erfolgreich erstellt."
fi

echo "✅ Setup abgeschlossen."
echo "DEPLOY_URL=$FULL_DOMAIN" >> $GITHUB_OUTPUT
echo "SUBDOMAIN=$SUBDOMAIN" >> $GITHUB_OUTPUT
