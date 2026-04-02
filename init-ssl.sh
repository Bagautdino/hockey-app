#!/bin/bash
set -e
set -a; source .env.prod; set +a

echo "📡 Домен: $DOMAIN → $(dig +short $DOMAIN)"
echo "🖥️  IP сервера: $(curl -s ifconfig.me)"
echo ""

# Проверка что DNS указывает на этот сервер
SERVER_IP=$(curl -4 -s ifconfig.me)
DOMAIN_IP=$(dig +short $DOMAIN | head -1)

if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
  echo "❌ DNS ещё не обновился!"
  echo "   Домен указывает на: $DOMAIN_IP"
  echo "   IP этого сервера:   $SERVER_IP"
  echo "   Подожди 5-10 минут и попробуй снова"
  exit 1
fi

echo "✅ DNS настроен правильно, запускаем certbot..."

# Запустить nginx для HTTP challenge
docker compose -f docker-compose.prod.yml up -d nginx
sleep 3

# Получить сертификат
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email $ADMIN_EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN \
  -d www.$DOMAIN

echo "✅ SSL сертификат получен!"
echo "📁 Сертификаты в: ./certbot/conf/live/$DOMAIN/"
ls -la ./certbot/conf/live/$DOMAIN/