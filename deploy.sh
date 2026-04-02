#!/bin/bash
set -e

set -a
source .env.prod
set +a

echo "=== Deploying Hockey Parent → $DOMAIN ==="
echo ""

# Replace ${DOMAIN} in nginx configs
for f in nginx/conf.d/app.conf nginx/conf.d/app-ssl.conf; do
    envsubst '${DOMAIN}' < "$f" > "${f}.tmp"
    mv "${f}.tmp" "$f"
done

# Ensure certbot directories exist
mkdir -p certbot/conf certbot/www

# Remove SSL config if cert doesn't exist yet
if [ ! -f "certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo "[1/4] SSL certificate not found. Getting one via HTTP challenge..."

    # Temporarily remove SSL config so nginx starts on port 80 only
    mv nginx/conf.d/app-ssl.conf nginx/conf.d/app-ssl.conf.bak 2>/dev/null || true

    docker compose -f docker-compose.prod.yml up -d nginx
    sleep 5

    docker compose -f docker-compose.prod.yml run --rm certbot certonly \
        --webroot --webroot-path=/var/www/certbot \
        --email "$ADMIN_EMAIL" --agree-tos --no-eff-email \
        -d "$DOMAIN" -d "www.$DOMAIN"

    # Restore SSL config
    mv nginx/conf.d/app-ssl.conf.bak nginx/conf.d/app-ssl.conf 2>/dev/null || true

    docker compose -f docker-compose.prod.yml down
    echo "[1/4] SSL certificate obtained."
else
    echo "[1/4] SSL certificate already exists. Skipping."
fi

echo "[2/4] Building and starting all services..."
docker compose -f docker-compose.prod.yml up -d --build

echo "[3/4] Waiting for services to become healthy..."
sleep 10

echo "[4/4] Reloading nginx..."
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload 2>/dev/null || true

echo ""
echo "=== Done! App running at https://$DOMAIN ==="
echo ""
echo "  Logs:   docker compose -f docker-compose.prod.yml logs -f"
echo "  Status: docker compose -f docker-compose.prod.yml ps"
echo "  Stop:   docker compose -f docker-compose.prod.yml down"
echo ""
