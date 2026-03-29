@echo off
setlocal enabledelayedexpansion

echo 🚀 Iniciando WacoPro API...
echo.

REM Levantar PostgreSQL y Redis
echo 📦 Levantando Docker (PostgreSQL + Redis)...
docker-compose up -d postgres redis

REM Esperar a que esten listos
echo ⏳ Esperando 30 segundos para que los servicios esten listos...
timeout /t 30 /nobreak

REM Verificar salud
echo 🏥 Verificando salud de servicios...
docker-compose exec postgres pg_isready -U postgres
docker-compose exec redis redis-cli ping

REM Instalar dependencias
echo 📦 Instalando dependencias...
call npm install

REM Generar Prisma Client
echo 🔧 Generando Prisma Client...
call npx prisma generate

REM Aplicar migraciones
echo 🗄️  Aplicando migraciones...
call npx prisma migrate dev --name init

REM Ejecutar seeders
echo 🌱 Ejecutando seeders...
call npx ts-node prisma/seed.ts
call npx ts-node prisma/seed_training.ts

echo.
echo ✅ ¡Todo listo!
echo 🚀 Iniciando servidor en http://localhost:3000
echo.
call npm run dev
