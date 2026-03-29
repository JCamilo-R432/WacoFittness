#!/usr/bin/env bash
# ── WacoPro Fitness — Deploy en Contabo VPS (Ubuntu) ─────────────────────
#
# Uso:
#   Primer deploy:  sudo ./deploy.sh --setup
#   Actualizaciones: ./deploy.sh
#
# Requisitos previos (solo para --setup):
#   - Ubuntu 20.04 / 22.04 / 24.04 fresh install
#   - SSH root o usuario con sudo
# ─────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Colores ───────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$APP_DIR/logs/deploy.log"
SETUP_MODE=false

[[ "${1:-}" == "--setup" ]] && SETUP_MODE=true

mkdir -p "$APP_DIR/logs"
log()  { echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $*" | tee -a "$LOG_FILE"; }
warn() { echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠  $*${NC}" | tee -a "$LOG_FILE"; }
err()  { echo -e "${RED}[$(date '+%H:%M:%S')] ✗  $*${NC}" | tee -a "$LOG_FILE"; exit 1; }
step() { echo -e "\n${YELLOW}━━━ $* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; }

# ═════════════════════════════════════════════════════════════════════════
#  MODO SETUP — Solo se ejecuta con --setup (primera vez en el VPS)
# ═════════════════════════════════════════════════════════════════════════
if $SETUP_MODE; then
  log "=== MODO SETUP: Instalando entorno en Contabo VPS ==="

  step "1/8 Actualizar sistema"
  sudo apt-get update -qq && sudo apt-get upgrade -y -qq
  sudo apt-get install -y -qq curl git wget build-essential ufw fail2ban nginx certbot python3-certbot-nginx

  step "2/8 Instalar Node.js 20.x"
  if ! command -v node &>/dev/null || [[ "$(node -v)" < "v18" ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
  fi
  log "Node: $(node -v) | npm: $(npm -v)"

  step "3/8 Instalar PM2 global"
  sudo npm install -g pm2@latest
  log "PM2: $(pm2 -v)"

  step "4/8 Instalar Redis (opcional — cache y queues)"
  if ! systemctl is-active --quiet redis-server 2>/dev/null; then
    sudo apt-get install -y redis-server
    sudo systemctl enable redis-server
    sudo systemctl start redis-server
    log "Redis instalado y activo"
  else
    log "Redis ya estaba activo"
  fi

  step "5/8 Configurar directorio de la aplicación"
  sudo mkdir -p /var/www/wacopro
  # Si se ejecuta como root, asignar al usuario actual; si hay usuario app, usar ese
  APP_USER="${SUDO_USER:-$(whoami)}"
  sudo chown -R "$APP_USER":"$APP_USER" /var/www/wacopro
  log "Directorio: /var/www/wacopro (owner: $APP_USER)"

  step "6/8 Configurar Nginx"
  sudo cp "$APP_DIR/nginx/wacopro.conf" /etc/nginx/sites-available/wacopro
  sudo ln -sf /etc/nginx/sites-available/wacopro /etc/nginx/sites-enabled/wacopro
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo nginx -t
  sudo systemctl enable nginx
  sudo systemctl restart nginx
  log "Nginx configurado"
  warn "Editá /etc/nginx/sites-available/wacopro y reemplazá 'tudominio.com' con tu dominio real"

  step "7/8 Configurar Firewall (UFW)"
  sudo ufw allow OpenSSH
  sudo ufw allow 'Nginx Full'
  sudo ufw --force enable
  log "Firewall activo — SSH + HTTP/HTTPS permitidos"

  step "8/8 Configurar PM2 startup (reinicio automático del servidor)"
  APP_USER="${SUDO_USER:-$(whoami)}"
  sudo -u "$APP_USER" pm2 startup systemd -u "$APP_USER" --hp "/home/$APP_USER" | tail -1 | sudo bash || true
  log "PM2 configurado para arrancar con el sistema"

  echo ""
  echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║   ✅  SETUP COMPLETADO                       ║${NC}"
  echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
  echo ""
  echo "  Próximos pasos:"
  echo "  1. Configurar .env:  cp .env.example .env && nano .env"
  echo "  2. Deploy inicial:   ./deploy.sh"
  echo "  3. SSL:              sudo certbot --nginx -d tudominio.com"
  echo ""
  exit 0
fi

# ═════════════════════════════════════════════════════════════════════════
#  DEPLOY NORMAL — git pull → build → migrate → pm2 reload
# ═════════════════════════════════════════════════════════════════════════
log "=== Deploy WacoPro Fitness ==="

# Validaciones
[[ -f "$APP_DIR/.env" ]] || err ".env no encontrado. Ejecutá: cp .env.example .env && nano .env"
command -v node &>/dev/null || err "Node.js no está instalado. Ejecutá primero: sudo ./deploy.sh --setup"
command -v pm2  &>/dev/null || err "PM2 no está instalado. Ejecutá primero: sudo ./deploy.sh --setup"

cd "$APP_DIR"

step "1/6 Actualizar código"
git pull origin main
log "Código actualizado"

step "2/6 Instalar dependencias de producción"
npm ci --omit=dev
log "Dependencias instaladas"

step "3/6 Generar Prisma Client"
npx prisma generate
log "Prisma Client generado"

step "4/6 Ejecutar migraciones de base de datos"
# migrate deploy usa DIRECT_URL (conexión directa a Supabase, no PgBouncer)
npx prisma migrate deploy
log "Migraciones aplicadas"

step "5/6 Compilar TypeScript"
npm run build
log "Build completado → dist/"

step "6/6 Reiniciar aplicación con PM2"
if pm2 list | grep -q "wacopro"; then
  # Zero-downtime reload en cluster mode
  pm2 reload ecosystem.config.js --env production
  log "App recargada (zero-downtime)"
else
  pm2 start ecosystem.config.js --env production
  pm2 save
  log "App iniciada por primera vez"
fi

# Recargar Nginx si está disponible
if command -v nginx &>/dev/null; then
  sudo nginx -t && sudo systemctl reload nginx
fi

# Verificar que el servidor responde
sleep 2
if curl -sf http://localhost:3000/api/health >/dev/null; then
  log "✅ Health check OK"
else
  warn "Health check falló — revisá los logs: pm2 logs wacopro"
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅  DEPLOY COMPLETADO                      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo "  pm2 status              → estado de la app"
echo "  pm2 logs wacopro        → logs en tiempo real"
echo "  pm2 monit               → monitor interactivo"
echo "  curl localhost:3000/api/health"
echo ""
