@echo off
setlocal enabledelayedexpansion
title WacoPro - Limpieza Prisma / Node

echo.
echo ============================================================
echo   WACOPRO FITNESS - LIMPIEZA COMPLETA
echo ============================================================
echo.

:: ── 1. Detener procesos ──────────────────────────────────────
echo [1/5] Deteniendo procesos node.exe y prisma...
taskkill /F /IM node.exe    >nul 2>&1
taskkill /F /IM prisma.exe  >nul 2>&1
taskkill /F /IM prisma-query-engine*.exe >nul 2>&1
echo       OK - Procesos detenidos

:: ── 2. Liberar puertos ───────────────────────────────────────
echo.
echo [2/5] Liberando puertos 3000 / 5432 / 6543...
for %%P in (3000 5432 6543) do (
  for /f "tokens=5" %%A in ('netstat -ano 2^>nul ^| findstr ":%%P "') do (
    if not "%%A"=="" (
      taskkill /F /PID %%A >nul 2>&1
      echo       Puerto %%P liberado (PID %%A)
    )
  )
)
echo       OK - Puertos verificados

:: ── 3. Limpiar caché Prisma ──────────────────────────────────
echo.
echo [3/5] Limpiando cache de Prisma...
if exist "node_modules\.prisma" (
  :: Intentar eliminar con timeout por si hay DLL bloqueada
  timeout /t 2 >nul
  rd /s /q "node_modules\.prisma" >nul 2>&1
  if exist "node_modules\.prisma" (
    echo       AVISO: no se pudo eliminar node_modules\.prisma (DLL bloqueada)
    echo       Cierra PowerShell y vuelve a abrir una terminal NUEVA, luego repite.
  ) else (
    echo       OK - node_modules\.prisma eliminado
  )
) else (
  echo       OK - node_modules\.prisma no existe
)

if exist "node_modules\@prisma\engines" (
  rd /s /q "node_modules\@prisma\engines" >nul 2>&1
  echo       OK - @prisma\engines eliminado
)

:: ── 4. Limpiar archivos temporales de Prisma ─────────────────
echo.
echo [4/5] Eliminando archivos temporales...
del /f /q "%TEMP%\prisma-*" >nul 2>&1
del /f /q "%APPDATA%\prisma\*" >nul 2>&1
echo       OK - Temporales eliminados

:: ── 5. Verificación final ────────────────────────────────────
echo.
echo [5/5] Verificacion final...
tasklist /FI "IMAGENAME eq node.exe" 2>nul | findstr "node.exe" >nul
if %errorlevel%==0 (
  echo       AVISO: todavia hay procesos node.exe corriendo
) else (
  echo       OK - Sin procesos node.exe activos
)

echo.
echo ============================================================
echo   LISTO PARA MIGRAR
echo ============================================================
echo.
echo   Proximos pasos:
echo   1. Abre una terminal PowerShell NUEVA (importante)
echo   2. cd %~dp0..
echo   3. Ejecuta: scripts\migrate.bat
echo.
echo   O directamente:
echo   npx prisma db push
echo   npx prisma generate
echo.
pause
