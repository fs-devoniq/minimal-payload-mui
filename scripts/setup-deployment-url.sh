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

echo "📦 IONOS Antwort: $IONOS_RESPONSE"

if [[ "$IONOS_RESPONSE" == \[* ]]; then
  echo "✅ DNS Record erfolgreich angelegt (oder bereits vorhanden)."
elif echo "$IONOS_RESPONSE" | grep -q "ALREADY_EXISTS"; then
  echo "ℹ️ DNS Record existiert bereits bei IONOS."
else
  echo "❌ IONOS FEHLER: $IONOS_RESPONSE"
fi

# 3. NPM Login
echo "🔑 Logge bei Nginx Proxy Manager ein..."
NPM_TOKEN=$(curl -s -X POST "${NPM_HOST}/api/tokens" \
  -H "Content-Type: application/json" \
  -d "{\"identity\": \"$NPM_USER\", \"secret\": \"$NPM_PASS\"}" | jq -r .token)

# 4. NPM Proxy Host prüfen oder erstellen
EXISTING_HOST=$(curl -s -X GET "${NPM_HOST}/api/nginx/proxy-hosts" \
  -H "Authorization: Bearer $NPM_TOKEN" \
  | jq -r ".[]? | select(.domain_names[]? == \"$FULL_DOMAIN\")")

FORWARD_HOST="${STACK_NAME}_app"

if [ -n "$EXISTING_HOST" ]; then
  HOST_ID=$(echo "$EXISTING_HOST" | jq -r .id)
  CERT_ID=$(echo "$EXISTING_HOST" | jq -r .certificate_id)
  echo "ℹ️ Proxy Host existiert (ID: $HOST_ID)."
else
  echo "🌐 Erstelle neuen Proxy Host..."
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
fi

# 5. SSL (Let's Encrypt) mit DNS-Check
if [ "$CERT_ID" == "0" ] || [ "$CERT_ID" == "null" ]; then
  echo "🔐 Prüfe DNS-Auflösung vor SSL-Anforderung..."
  
  MAX_RETRIES=10
  COUNT=0
  RESOLVED=false
  
  while [ $COUNT -lt $MAX_RETRIES ]; do
    # Prüfe ob die Domain auf die richtige IP auflöst (nutzt Cloudflare DNS zum Check)
    CURRENT_IP=$(nslookup "$FULL_DOMAIN" 1.1.1.1 | grep "Address" | tail -n1 | awk '{print $2}')
    
    if [ "$CURRENT_IP" == "$DEPLOY_HOST" ]; then
      echo "✅ DNS erfolgreich aufgelöst auf $CURRENT_IP"
      RESOLVED=true
      break
    fi
    
    echo "⏳ DNS noch nicht bereit (aktuell: '$CURRENT_IP', erwartet: '$DEPLOY_HOST'). Warte 20s... ($((COUNT+1))/$MAX_RETRIES)"
    sleep 20
    COUNT=$((COUNT+1))
  done

  if [ "$RESOLVED" = true ]; then
    echo "🔐 Fordere SSL Zertifikat an..."
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
        \"meta\": { \"letsencrypt_email\": \"$NPM_USER\", \"letsencrypt_agree\": true }
      }")
    
    if echo "$SSL_RESPONSE" | grep -q "certificate_id"; then
      echo "✅ SSL erfolgreich aktiviert."
    else
      echo "❌ SSL FEHLER: $SSL_RESPONSE"
    fi
  else
    echo "⚠️ DNS-Check Timeout. SSL wurde nicht aktiviert, da die Domain noch nicht auf die IP zeigt."
    echo "ℹ️ Sobald DNS aktiv ist, wird der nächste Deployment-Lauf SSL automatisch aktivieren."
  fi
else
  echo "✅ SSL ist bereits aktiv."
fi

echo "✅ Setup abgeschlossen."
echo "DEPLOY_URL=$FULL_DOMAIN" >> $GITHUB_OUTPUT



