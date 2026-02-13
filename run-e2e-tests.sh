#!/bin/bash

echo "🚀 Démarrage de l'environnement pour les tests E2E..."

# Lancer docker-compose.prod.yml
echo "📦 Lancement des conteneurs Docker..."
docker compose -f docker-compose.prod.yml up -d --build

# Attendre que les services soient prêts
echo "⏳ Attente que les services soient prêts..."
sleep 10

# Vérifier que le frontend répond
echo "🔍 Vérification que le frontend est accessible..."
until curl -s http://localhost:3000 > /dev/null; do
  echo "   En attente du frontend..."
  sleep 2
done

echo "✅ Services prêts !"
echo ""
echo "🧪 Lancement des tests E2E..."
echo ""

# Lancer les tests Cypress avec le port 3000 (docker-compose.prod.yml)
CYPRESS_FRONTEND_PORT=3000 npm run test:e2e

# Optionnel : arrêter les conteneurs après les tests
# docker compose -f docker-compose.prod.yml down
