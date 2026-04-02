#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Hockey Parent — Production Deployment Script
# ═══════════════════════════════════════════════════════════════
#
# Prerequisites:
#   1. Docker and Docker Compose installed
#   2. .env.prod filled with real passwords and domain
#   3. DNS A-records for DOMAIN and www.DOMAIN pointing to this server
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh          # Build, start, optionally get SSL certs
#
# This script is idempotent — safe to run multiple times.
# It never mutates template files; it generates output files from them.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

COMPOSE="docker compose -f docker-compose.prod.yml"

# ─── 1. Validate .env.prod ───────────────────────────────────
if [ ! -f .env.prod ]; then
    echo "ERROR: .env.prod not found."
    echo "Copy .env.prod.example, fill in passwords, and re-run."
    exit 1
fi

set -a
source .env.prod
set +a

echo "=== Hockey Parent Deployment ==="
echo "    Domain: ${DOMAIN:-NOT SET}"
echo ""

# ─── 2. Ensure directories exist ─────────────────────────────
mkdir -p certbot/conf certbot/www

# ─── 3. Remove any stale generated SSL config ────────────────
# If ssl.conf references certs that don't exist yet, nginx will
# refuse to start. Remove it; we'll regenerate after certs are obtained.
if [ ! -f "certbot/conf/live/${DOMAIN}/fullchain.pem" ]; then
    rm -f nginx/conf.d/ssl.conf
fi

# ─── 4. Clean up any stray containers ────────────────────────
# Prevents "port 80 already allocated" from previous manual docker runs.
echo "[1/5] Cleaning up stale containers..."
$COMPOSE down --remove-orphans 2>/dev/null || true

# ─── 5. Build and start all services ─────────────────────────
echo "[2/5] Building and starting all services..."
$COMPOSE up -d --build

# ─── 6. Wait and verify ──────────────────────────────────────
echo "[3/5] Waiting for services to become healthy..."
sleep 10

echo ""
echo "    Service status:"
$COMPOSE ps --format "table {{.Name}}\t{{.Status}}"
echo ""

# Quick smoke test
if curl -sf http://localhost/api/v1/health > /dev/null 2>&1; then
    echo "    API health check: OK"
else
    echo "    WARNING: API health check failed. Check logs with:"
    echo "    $COMPOSE logs backend"
fi

if curl -sf http://localhost/ > /dev/null 2>&1; then
    echo "    Frontend: OK"
else
    echo "    WARNING: Frontend not responding. Check logs with:"
    echo "    $COMPOSE logs nginx frontend-build"
fi

# ─── 7. SSL certificate (optional) ───────────────────────────
if [ -f "certbot/conf/live/${DOMAIN}/fullchain.pem" ]; then
    echo ""
    echo "[4/5] SSL certificate already exists. Generating ssl.conf..."
    sed "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" nginx/ssl.conf.template > nginx/conf.d/ssl.conf
    $COMPOSE exec nginx nginx -s reload 2>/dev/null || $COMPOSE restart nginx
else
    echo ""
    echo "[4/5] No SSL certificate yet."
    echo "    To obtain one (requires DNS to be pointed at this server):"
    echo ""
    echo "    $COMPOSE run --rm certbot certonly \\"
    echo "      --webroot --webroot-path=/var/www/certbot \\"
    echo "      --email ${ADMIN_EMAIL} --agree-tos --no-eff-email \\"
    echo "      -d ${DOMAIN} -d www.${DOMAIN}"
    echo ""
    echo "    Then re-run ./deploy.sh to activate HTTPS."
fi

# ─── 8. Start certbot renewal daemon if certs exist ──────────
if [ -f "certbot/conf/live/${DOMAIN}/fullchain.pem" ]; then
    echo "[5/5] Starting certbot renewal daemon..."
    $COMPOSE --profile ssl up -d certbot 2>/dev/null || true
else
    echo "[5/5] Skipping certbot daemon (no certs yet)."
fi

echo ""
echo "=== Deployment complete ==="
if [ -f "certbot/conf/live/${DOMAIN}/fullchain.pem" ]; then
    echo "    App: https://${DOMAIN}"
else
    echo "    App: http://${DOMAIN} (HTTP only, no SSL yet)"
fi
echo ""
echo "    Logs:   $COMPOSE logs -f"
echo "    Status: $COMPOSE ps"
echo "    Stop:   $COMPOSE down"
echo ""
