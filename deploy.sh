#!/bin/bash
set -e

if [ ! -f .env.prod ]; then
    echo "ERROR: .env.prod not found. Copy and edit it first."
    exit 1
fi

set -a
source .env.prod
set +a

echo "=== Deploying Hockey Parent ==="
echo "  Domain: $DOMAIN"
echo ""

export VITE_API_URL="https://$DOMAIN"
export CORS_ORIGINS="https://$DOMAIN,https://www.$DOMAIN"

mkdir -p certbot/conf certbot/www

echo "[1/5] Building and starting core services..."
docker compose -f docker-compose.prod.yml up -d --build postgres minio backend frontend nginx
echo "  Waiting for services..."
sleep 15

if [ ! -f "certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo "[2/5] Obtaining SSL certificate..."
    docker compose -f docker-compose.prod.yml run --rm \
        -e DOMAIN="$DOMAIN" \
        certbot certonly \
        --webroot --webroot-path=/var/www/certbot \
        --email "$ADMIN_EMAIL" --agree-tos --no-eff-email \
        -d "$DOMAIN" -d "www.$DOMAIN"
else
    echo "[2/5] SSL certificate already exists. Skipping."
fi

if [ -f "certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo "[3/5] Generating SSL nginx config..."
    sed "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" nginx/ssl.conf.template > nginx/conf.d/ssl.conf
    docker compose -f docker-compose.prod.yml exec nginx nginx -s reload 2>/dev/null || \
        docker compose -f docker-compose.prod.yml restart nginx
else
    echo "[3/5] No SSL cert found, running HTTP only."
fi

echo "[4/5] Starting certbot renewal daemon..."
docker compose -f docker-compose.prod.yml --profile ssl up -d certbot 2>/dev/null || true

echo "[5/5] Verifying services..."
docker compose -f docker-compose.prod.yml ps

echo ""
echo "=== Done! ==="
if [ -f "certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo "  App: https://$DOMAIN"
else
    echo "  App: http://<server-ip> (no SSL yet)"
fi
echo ""
echo "  Logs:   docker compose -f docker-compose.prod.yml logs -f"
echo "  Status: docker compose -f docker-compose.prod.yml ps"
echo "  Stop:   docker compose -f docker-compose.prod.yml down"
echo ""
