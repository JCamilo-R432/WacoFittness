#!/bin/bash
set -e

echo "🚀 Iniciando WacoPro API..."
echo ""

# Levantar PostgreSQL y Redis
echo "📦 Levantando Docker (PostgreSQL + Redis)..."
docker-compose up -d postgres redis

# Esperar a que estén listos
echo "⏳ Esperando 30 segundos para que los servicios estén listos..."
sleep 30

# Verificar salud
echo "🏥 Verificando salud de servicios..."
docker-compose exec postgres pg_isready -U postgres
docker-compose exec redis redis-cli ping

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Generar Prisma Client
echo "🔧 Generando Prisma Client..."
npx prisma generate

# Aplicar migraciones
echo "🗄️  Aplicando migraciones..."
npx prisma migrate dev --name init

# Ejecutar seeders
echo "🌱 Ejecutando seeders..."
npx ts-node prisma/seed.ts
npx ts-node prisma/seed_training.ts

# Iniciar servidor
echo ""
echo "✅ ¡Todo listo!"
echo "🚀 Iniciando servidor en http://localhost:3000"
echo ""
npm run dev
