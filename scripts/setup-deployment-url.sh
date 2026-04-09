#!/bin/bash
set -e

# Erwartete Umgebungsvariablen:
# IONOS_API_KEY, IONOS_ZONE_ID, NPM_HOST, NPM_USER, NPM_PASS, DEPLOY_HOST, STACK_NAME

# 1. Bereinige DEPLOY_HOST (für den DNS-Check brauchen wir die IP)
CLEAN_IP=$(echo "$DEPLOY_HOST" | sed -e 's|^[^/]*//||' -e 's|/.*$||')

# 2. Subdomain generieren
SUBDOMAIN=$(echo "$STACK_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')
FULL_DOMAIN="${SUBDOMAIN}.devoniq.de"

echo "🚀 Starte Setup für $FULL_DOMAIN (Ziel: CNAME devoniq.de)"

# 3. IONOS DNS Eintrag erstellen (als CNAME)
echo "📡 Erstelle IONOS CNAME Record für $FULL_DOMAIN -> devoniq.de..."
# Wir nutzen wieder den FQDN (vollen Namen), da das bei dir funktioniert hat
JSON_PAYLOAD=$(jq -n --arg name "$FULL_DOMAIN" --arg target "devoniq.de" \
  '[{name: $name, type: "CNAME", content: $target, ttl: 3600, prio: 0, disabled: false}]')

IONOS_RESPONSE=$(curl -s -X POST "https://api.hosting.ionos.com/dns/v1/zones/$IONOS_ZONE_ID/records" \
     -H "X-API-Key: $IONOS_API_KEY" \
     -H "Content-Type: application/json" \
     -d "$JSON_PAYLOAD")

if echo "$IONOS_RESPONSE" | grep -q "\"id\""; then
  echo "✅ CNAME Record erfolgreich angelegt!"
elif echo "$IONOS_RESPONSE" | grep -q "ALREADY_EXISTS"; then
  echo "ℹ️ Record existiert bereits."
else
  echo "❌ IONOS FEHLER: $IONOS_RESPONSE"
fi

# 4. NPM Login
echo "🔑 Logge bei Nginx Proxy Manager ein..."
NPM_TOKEN=$(curl -s -X POST "${NPM_HOST}/api/tokens" \
  -H "Content-Type: application/json" \
  -d "{\"identity\": \"$NPM_USER\", \"secret\": \"$NPM_PASS\"}" | jq -r .token)

# 5. NPM Proxy Host prüfen oder erstellen
EXISTING_HOST=$(curl -s -X GET "${NPM_HOST}/api/nginx/proxy-hosts" \
  -H "Authorization: Bearer $NPM_TOKEN" \
  | jq -r ".[]? | select(.domain_names[]? == \"$FULL_DOMAIN\")")

FORWARD_HOST="${STACK_NAME}_app"

if [ -n "$EXISTING_HOST" ]; then
  HOST_ID=$(echo "$EXISTING_HOST" | jq -r .id)
  CERT_ID=$(echo "$EXISTING_HOST" | jq -r .certificate_id)
  echo "ℹ️ Proxy Host existiert bereits (ID: $HOST_ID)."
else
  echo "🌐 Erstelle neuen NPM Proxy Host für $FULL_DOMAIN..."
  CREATE_RESPONSE=$(curl -s -X POST "${NPM_HOST}/api/nginx/proxy-hosts" \
    -H "Authorization: Bearer $NPM_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"domain_names\": [\"$FULL_DOMAIN\"],
      \"forward_scheme\": \"http\",
      \"forward_host\": \"$FORWARD_HOST\",
      \"forward_port\": 3000,
      \"ssl_forced\": false,
      \"block_exploits\": true,
      \"allow_websocket_upgrade\": true
    }")
  HOST_ID=$(echo "$CREATE_RESPONSE" | jq -r .id)
  CERT_ID=0
  echo "✅ Proxy Host erstellt."
fi

# 6. SSL (Let's Encrypt) mit DNS-Check
if [ "$CERT_ID" == "0" ] || [ "$CERT_ID" == "null" ]; then
  echo "🔐 Prüfe DNS-Auflösung vor SSL-Anforderung..."
  MAX_RETRIES=15
  COUNT=0
  RESOLVED=false
  while [ $COUNT -lt $MAX_RETRIES ]; do
    CURRENT_IP=$(nslookup "$FULL_DOMAIN" 1.1.1.1 | grep "Address" | grep -v "#" | tail -n1 | awk '{print $2}')
    if [ "$CURRENT_IP" == "$CLEAN_IP" ]; then
      echo "✅ DNS erfolgreich aufgelöst auf $CURRENT_IP"
      RESOLVED=true
      break
    fi
    echo "⏳ DNS noch nicht bereit. Warte 20s... ($((COUNT+1))/$MAX_RETRIES)"
    sleep 20
    COUNT=$((COUNT+1))
  done

  if [ "$RESOLVED" = true ]; then
    echo "🔐 Fordere SSL Zertifikat an..."
    curl -s -X PUT "${NPM_HOST}/api/nginx/proxy-hosts/$HOST_ID" \
      -H "Authorization: Bearer $NPM_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"domain_names\": [\"$FULL_DOMAIN\"],
        \"forward_scheme\": \"http\",
        \"forward_host\": \"$FORWARD_HOST\",
        \"forward_port\": 3000,
        \"certificate_id\": \"new\",
        \"ssl_forced\": true,
        \"meta\": { \"letsencrypt_email\": \"$NPM_USER\", \"letsencrypt_agree\": true }
      }" > /dev/null
    echo "✅ SSL angefordert."
  fi
fi

echo "✅ Setup abgeschlossen."
echo "DEPLOY_URL=$FULL_DOMAIN" >> $GITHUB_OUTPUT
