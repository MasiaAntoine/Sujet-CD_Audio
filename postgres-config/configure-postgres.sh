#!/bin/bash
set -e

# Attendre que PostgreSQL soit prêt
until pg_isready -U user; do
  sleep 1
done

# Modifier pg_hba.conf pour accepter les connexions externes
echo "host    all             all             0.0.0.0/0               md5" >> /var/lib/postgresql/data/pg_hba.conf
echo "host    all             all             ::/0                    md5" >> /var/lib/postgresql/data/pg_hba.conf

# Recharger la configuration
psql -U user -d cd_database -c "SELECT pg_reload_conf();"

echo "PostgreSQL configuré pour accepter les connexions externes"
