@echo off
setlocal enabledelayedexpansion
title WacoPro - Migracion Prisma + Supabase
cd /d "%~dp0.."

echo.
echo ============================================================
echo   WACOPRO FITNESS - MIGRACION DE BASE DE DATOS
echo ============================================================
echo.

:: ── Verificar .env ───────────────────────────────────────────
echo [CHECK] Verificando .env...

if not exist ".env" (
  echo   ERROR: No se encontro el archivo .env
  echo   Crea .env con DATABASE_URL y DIRECT_URL antes de continuar.
  pause & exit /b 1
)

findstr /C:"DATABASE_URL" .env >nul
if %errorlevel% neq 0 (
  echo   ERROR: DATABASE_URL no encontrada en .env
  pause & exit /b 1
)

findstr /C:"DIRECT_URL" .env >nul
if %errorlevel% neq 0 (
  echo   ERROR: DIRECT_URL no encontrada en .env
  echo   Necesitas la URL de conexion directa (puerto 5432) para migraciones.
  echo   Busca en Supabase: Settings ^> Database ^> Connection string (URI) ^> Direct connection
  pause & exit /b 1
)

echo   OK - .env verificado (DATABASE_URL + DIRECT_URL presentes)
echo.

:: ── Elegir opcion ────────────────────────────────────────────
echo Elige el metodo de migracion:
echo.
echo   [1] db push (RECOMENDADO - rapido, usa DIRECT_URL automaticamente)
echo       Ideal cuando: ya tienes tablas y solo necesitas anadir nuevas
echo.
echo   [2] migrate dev (crea archivos de migracion versionados)
echo       Ideal cuando: quieres historial de cambios rastreable
echo.
echo   [3] Solo regenerar cliente Prisma (sin tocar la BD)
echo       Ideal cuando: la BD ya esta actualizada
echo.
set /p OPCION="Opcion (1/2/3): "

echo.

if "%OPCION%"=="1" goto OPCION_PUSH
if "%OPCION%"=="2" goto OPCION_MIGRATE
if "%OPCION%"=="3" goto OPCION_GENERATE
echo Opcion invalida. Usando opcion 1 por defecto.
goto OPCION_PUSH

:: ────────────────────────────────────────────────────────────
:OPCION_PUSH
echo [DB PUSH] Ejecutando prisma db push...
echo   Esto usa DIRECT_URL (puerto 5432) para conexion directa.
echo   Puede tardar 10-30 segundos...
echo.
npx prisma db push
if %errorlevel% neq 0 (
  echo.
  echo   ERROR en db push. Posibles causas:
  echo   - DIRECT_URL incorrecta o Supabase pausado
  echo   - Conflicto de schema (ver mensaje arriba)
  echo   Intenta: npx prisma db push --accept-data-loss
  pause & exit /b 1
)
echo   OK - Schema aplicado
goto OPCION_GENERATE

:: ────────────────────────────────────────────────────────────
:OPCION_MIGRATE
echo [MIGRATE DEV] Ejecutando migrate dev con DIRECT_URL...
echo.
set /p MIGRATION_NAME="Nombre de la migracion (ej: phase2-social): "
if "%MIGRATION_NAME%"=="" set MIGRATION_NAME=phase2-features
echo.
echo   Ejecutando: npx prisma migrate dev --name %MIGRATION_NAME%
echo   (Prisma usa DIRECT_URL del .env para migraciones automaticamente)
echo.
npx prisma migrate dev --name %MIGRATION_NAME%
if %errorlevel% neq 0 (
  echo.
  echo   ERROR en migrate dev. Soluciones:
  echo   1. Verifica que DIRECT_URL usa puerto 5432 (no 6543)
  echo   2. Si el error es 'prepared statement already exists':
  echo      La DIRECT_URL sigue apuntando al pooler - revisa Supabase Dashboard
  echo   3. Si el error es WSAStartup:
  echo      Ejecuta scripts\cleanup.bat y abre terminal nueva
  pause & exit /b 1
)
echo   OK - Migracion creada y aplicada
goto OPCION_GENERATE

:: ────────────────────────────────────────────────────────────
:OPCION_GENERATE
echo.
echo [GENERATE] Regenerando Prisma Client...
npx prisma generate
if %errorlevel% neq 0 (
  echo.
  echo   ERROR al generar cliente. Posible causa: DLL bloqueada por otro proceso.
  echo   Ejecuta scripts\cleanup.bat y repite este paso.
  pause & exit /b 1
)
echo   OK - Prisma Client regenerado

:: ── Verificacion rapida ──────────────────────────────────────
echo.
echo [VERIFY] Verificando tablas criticas...
npx ts-node scripts/verify-migration.ts 2>nul
if %errorlevel% neq 0 (
  echo   (Verificacion TypeScript no disponible - instala ts-node si quieres usarla)
)

echo.
echo ============================================================
echo   MIGRACION COMPLETADA EXITOSAMENTE
echo ============================================================
echo.
echo   Ahora puedes iniciar la app:
echo   npm run dev
echo.
pause
