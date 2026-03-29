#!/usr/bin/env bash
# ── WacoPro Fitness — Backups Automáticos ────────────────────────────────
#
# Uso manual:    ./backup.sh
# Cron diario:   0 3 * * * /var/www/wacopro/backup.sh >> /var/www/wacopro/logs/backup.log 2>&1
#
# Qué se respalda:
#   1. Base de datos PostgreSQL/Supabase (pg_dump via DIRECT_URL)
#   2. Archivos de la aplicación (.env, uploads/, configuración)
#
# NOTA: Supabase Pro hace backups automáticos diarios.
#       Este script es un respaldo adicional local/remoto.
# ─────────────────────────────────────────────────────────────────────────

set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_ROOT="/var/backups/wacopro"
DATE="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR="$BACKUP_ROOT/$DATE"
KEEP_DAYS=7

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
err() { log "ERROR: $*"; exit 1; }

# ── Cargar variables de entorno ───────────────────────────────────────────
[[ -f "$APP_DIR/.env" ]] || err ".env no encontrado en $APP_DIR"
set -o allexport
# shellcheck disable=SC1091
source "$APP_DIR/.env"
set +o allexport

mkdir -p "$BACKUP_DIR"

log "=== Iniciando backup WacoPro — $DATE ==="

# ── 1. Backup de la base de datos (PostgreSQL / Supabase) ─────────────────
# Usa DIRECT_URL (puerto 5432, sin PgBouncer) para pg_dump
DB_URL="${DIRECT_URL:-${DATABASE_URL:-}}"
[[ -z "$DB_URL" ]] && err "DATABASE_URL / DIRECT_URL no configurado en .env"

log "1/3 Backup de base de datos..."
if command -v pg_dump &>/dev/null; then
  pg_dump "$DB_URL" \
    --format=custom \
    --no-acl \
    --no-owner \
    --file="$BACKUP_DIR/database.dump" \
    && log "  ✅ pg_dump completado"
else
  log "  ⚠  pg_dump no disponible — instalá con: sudo apt install postgresql-client"
  log "  Saltando backup de DB. Verificá el backup automático de Supabase."
fi

# ── 2. Backup de archivos de la aplicación ───────────────────────────────
log "2/3 Backup de archivos de aplicación..."

# .env (renombrado para evitar que se ejecute accidentalmente)
cp "$APP_DIR/.env" "$BACKUP_DIR/env.backup"

# Uploads (archivos subidos por usuarios, si los hay)
if [[ -d "$APP_DIR/uploads" ]]; then
  tar -czf "$BACKUP_DIR/uploads.tar.gz" -C "$APP_DIR" uploads/
  log "  ✅ uploads/ respaldado"
fi

# ── 3. Comprimir y limpiar ────────────────────────────────────────────────
log "3/3 Comprimiendo y limpiando backups antiguos..."

ARCHIVE="$BACKUP_ROOT/wacopro_backup_$DATE.tar.gz"
tar -czf "$ARCHIVE" -C "$BACKUP_ROOT" "$DATE"
rm -rf "$BACKUP_DIR"

ARCHIVE_SIZE=$(du -sh "$ARCHIVE" | cut -f1)
log "  ✅ Backup guardado: $ARCHIVE ($ARCHIVE_SIZE)"

# Eliminar backups con más de KEEP_DAYS días
find "$BACKUP_ROOT" -name "wacopro_backup_*.tar.gz" -mtime +"$KEEP_DAYS" -delete
REMAINING=$(find "$BACKUP_ROOT" -name "*.tar.gz" | wc -l)
log "  Backups disponibles: $REMAINING (manteniendo últimos $KEEP_DAYS días)"

# ── Opcional: subir a almacenamiento remoto ───────────────────────────────
# Descomentá el bloque correspondiente según tu proveedor:

# AWS S3:
# aws s3 cp "$ARCHIVE" "s3://tu-bucket/wacopro/$(basename "$ARCHIVE")" \
#   && log "  ✅ Subido a S3"

# Backblaze B2:
# b2 upload-file tu-bucket "$ARCHIVE" "wacopro/$(basename "$ARCHIVE")" \
#   && log "  ✅ Subido a Backblaze B2"

# rsync a otro servidor:
# rsync -az "$ARCHIVE" backup-user@backup-server:/backups/wacopro/ \
#   && log "  ✅ Sincronizado con servidor de backup"

log "=== Backup completado: $ARCHIVE ==="

# ── Para restaurar la DB: ─────────────────────────────────────────────────
# pg_restore --dbname="$DIRECT_URL" --clean --if-exists database.dump
