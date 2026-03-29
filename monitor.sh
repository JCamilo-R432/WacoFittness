#!/usr/bin/env bash
# ── WacoPro Fitness — Monitor Rápido ─────────────────────────────────────
# Uso: ./monitor.sh
# Para watch continuo: watch -n 5 ./monitor.sh

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

CYAN='\033[0;36m'; GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'

header() { echo -e "\n${CYAN}▶ $*${NC}"; }
ok()     { echo -e "  ${GREEN}✓${NC} $*"; }
fail()   { echo -e "  ${RED}✗${NC} $*"; }
warn()   { echo -e "  ${YELLOW}⚠${NC} $*"; }

echo -e "${CYAN}══════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  WacoPro Fitness — Monitor  $(date '+%Y-%m-%d %H:%M:%S')  ${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════${NC}"

# ── App (PM2) ─────────────────────────────────────────────────────────────
header "Aplicación (PM2)"
if command -v pm2 &>/dev/null; then
  pm2 list --no-color 2>/dev/null | grep -E "wacopro|Name|─" || warn "Proceso 'wacopro' no encontrado en PM2"
else
  fail "PM2 no instalado"
fi

# ── Health Check ──────────────────────────────────────────────────────────
header "Health Check API"
if curl -sf http://localhost:3000/api/health | grep -q '"success":true'; then
  ok "http://localhost:3000/api/health → OK"
else
  fail "Health check falló (¿app corriendo?)"
fi

# ── Nginx ─────────────────────────────────────────────────────────────────
header "Nginx"
if systemctl is-active --quiet nginx; then
  ok "nginx.service activo"
else
  fail "nginx no está corriendo"
fi

# ── Redis ─────────────────────────────────────────────────────────────────
header "Redis"
if systemctl is-active --quiet redis-server 2>/dev/null || systemctl is-active --quiet redis 2>/dev/null; then
  if command -v redis-cli &>/dev/null && redis-cli ping 2>/dev/null | grep -q PONG; then
    ok "redis activo — PONG recibido"
  else
    ok "redis.service activo"
  fi
else
  warn "Redis no está corriendo (opcional para desarrollo)"
fi

# ── Memoria ───────────────────────────────────────────────────────────────
header "Memoria"
TOTAL=$(free -m | awk '/^Mem:/ {print $2}')
USED=$(free -m  | awk '/^Mem:/ {print $3}')
FREE=$(free -m  | awk '/^Mem:/ {print $7}')
PCT=$((USED * 100 / TOTAL))
MEM_LINE="  ${USED}MB usados / ${TOTAL}MB totales — ${FREE}MB disponibles (${PCT}% uso)"
if   (( PCT < 70 )); then echo -e "${GREEN}$MEM_LINE${NC}"
elif (( PCT < 90 )); then echo -e "${YELLOW}$MEM_LINE${NC}"
else                      echo -e "${RED}$MEM_LINE${NC}"
fi

# ── Disco ─────────────────────────────────────────────────────────────────
header "Disco (/var/www)"
df -h /var/www 2>/dev/null || df -h /

# ── Puerto 3000 ───────────────────────────────────────────────────────────
header "Conexiones en puerto 3000"
CONNS=$(ss -tn 2>/dev/null | grep ':3000' | wc -l || echo "?")
echo "  Conexiones activas: $CONNS"

# ── Logs recientes (errores) ──────────────────────────────────────────────
header "Últimos errores PM2 (5 líneas)"
if [[ -f "$APP_DIR/logs/pm2-err.log" ]]; then
  tail -5 "$APP_DIR/logs/pm2-err.log" 2>/dev/null || echo "  (sin errores recientes)"
else
  echo "  (log no encontrado)"
fi

echo -e "\n${CYAN}══════════════════════════════════════════════════${NC}"
echo "  pm2 logs wacopro --lines 50   → logs completos"
echo "  pm2 monit                     → monitor interactivo"
echo -e "${CYAN}══════════════════════════════════════════════════${NC}"
