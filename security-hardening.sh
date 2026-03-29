#!/usr/bin/env bash
# ── WacoPro Fitness — Endurecimiento de Seguridad del VPS ────────────────
#
# Uso: sudo ./security-hardening.sh
#
# ⚠️  LEER ANTES DE EJECUTAR:
#   - Asegurate de tener una SSH KEY configurada ANTES de deshabilitar passwords
#   - Guardá la IP de tu VPS y tu SSH key en un lugar seguro
#   - Si perdés acceso SSH podés necesitar rescate por consola en Contabo
# ─────────────────────────────────────────────────────────────────────────

set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

step() { echo -e "\n${YELLOW}━━━ $* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; }
ok()   { echo -e "${GREEN}  ✓ $*${NC}"; }
warn() { echo -e "${YELLOW}  ⚠ $*${NC}"; }

[[ $EUID -eq 0 ]] || { echo -e "${RED}Ejecutar con sudo${NC}"; exit 1; }

echo -e "${YELLOW}══════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  Endurecimiento de Seguridad — WacoPro VPS${NC}"
echo -e "${YELLOW}══════════════════════════════════════════════════${NC}"

# ── 1. Fail2Ban — protección SSH + Nginx ─────────────────────────────────
step "1/5 Configurar Fail2Ban"

apt-get install -y -qq fail2ban

cat > /etc/fail2ban/jail.local <<'EOF'
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5
backend  = systemd

[sshd]
enabled  = true
port     = ssh
maxretry = 3
bantime  = 24h

[nginx-http-auth]
enabled  = true
port     = http,https
logpath  = /var/log/nginx/error.log
maxretry = 5

[nginx-limit-req]
enabled  = true
port     = http,https
logpath  = /var/log/nginx/*.error.log
maxretry = 10
EOF

systemctl enable fail2ban
systemctl restart fail2ban
ok "Fail2Ban configurado (SSH: 3 intentos → ban 24h)"

# ── 2. Hardening SSH ─────────────────────────────────────────────────────
step "2/5 Endurecer SSH"

SSH_CFG="/etc/ssh/sshd_config"
cp "$SSH_CFG" "${SSH_CFG}.backup.$(date +%Y%m%d)"

warn "Verificá que tenés SSH key configurada antes de deshabilitar passwords"
echo "¿Deshabilitar autenticación por contraseña SSH? (s/N, default: N)"
read -r -t 10 disable_pass || disable_pass="N"

if [[ "${disable_pass,,}" == "s" ]]; then
  sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' "$SSH_CFG"
  ok "PasswordAuthentication deshabilitado"
else
  warn "Contraseña SSH mantenida habilitada (más seguro deshabilitarla)"
fi

# Deshabilitar login como root por SSH
sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' "$SSH_CFG"
ok "Login root por SSH deshabilitado"

# Reducir tiempo de gracia para login
sed -i 's/^#*LoginGraceTime.*/LoginGraceTime 30/' "$SSH_CFG"

systemctl reload sshd
ok "SSH endurecido"

# ── 3. Swap (importante para VPS con poca RAM) ────────────────────────────
step "3/5 Configurar Swap"

if swapon --show | grep -q .; then
  ok "Swap ya configurado: $(free -h | awk '/^Swap:/ {print $2}')"
else
  SWAP_SIZE="2G"
  fallocate -l $SWAP_SIZE /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile

  # Persistir en /etc/fstab
  if ! grep -q '/swapfile' /etc/fstab; then
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
  fi

  # Reducir swappiness (usar swap solo cuando realmente necesario)
  sysctl vm.swappiness=10
  echo 'vm.swappiness=10' >> /etc/sysctl.conf

  ok "Swap de $SWAP_SIZE creado y configurado (swappiness=10)"
fi

# ── 4. Límites de recursos para la app ───────────────────────────────────
step "4/5 Límites de recursos del sistema"

# Aumentar límite de file descriptors (importante para muchas conexiones)
cat > /etc/security/limits.d/wacopro.conf <<'EOF'
# WacoPro Fitness app limits
*    soft    nofile    65536
*    hard    nofile    65536
*    soft    nproc     4096
*    hard    nproc     4096
EOF

# Aplicar en la sesión actual
ulimit -n 65536 2>/dev/null || warn "No se pudo aplicar ulimit en sesión actual (se aplica en el próximo arranque)"

ok "Límites de file descriptors: 65536"

# ── 5. Actualizaciones de seguridad automáticas ───────────────────────────
step "5/5 Actualizaciones automáticas de seguridad"

apt-get install -y -qq unattended-upgrades

cat > /etc/apt/apt.conf.d/50unattended-upgrades <<'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}";
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Mail "";
EOF

cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF

ok "Parches de seguridad se aplicarán automáticamente"

# ── Resumen ───────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅  Endurecimiento completado                   ${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
echo ""
echo "  Verificar Fail2Ban:  sudo fail2ban-client status sshd"
echo "  IPs baneadas:        sudo fail2ban-client banned"
echo "  Auth logs:           sudo tail -f /var/log/auth.log"
echo ""
warn "Hacé un snapshot del VPS en el panel de Contabo antes de continuar"
