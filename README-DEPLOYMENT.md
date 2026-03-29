# 🚀 WacoPro Fitness — Deploy en Contabo VPS (Ubuntu)

## Requisitos del VPS

| Componente | Mínimo recomendado |
|---|---|
| OS | Ubuntu 20.04 / 22.04 / 24.04 |
| RAM | 2 GB (4 GB recomendado) |
| Disco | 20 GB SSD |
| Node.js | 20.x (el script lo instala) |
| Base de datos | Supabase (remoto) — ya configurado |

---

## Paso a Paso

### 1. Conectarse al VPS

```bash
ssh root@IP_DEL_VPS
# o con usuario y key:
ssh -i ~/.ssh/tu_key usuario@IP_DEL_VPS
```

### 2. Clonar el repositorio

```bash
mkdir -p /var/www/wacopro
cd /var/www/wacopro
git clone https://github.com/TU_USUARIO/TU_REPO.git .
```

### 3. Setup inicial (solo la primera vez)

```bash
chmod +x deploy.sh backup.sh monitor.sh security-hardening.sh
sudo ./deploy.sh --setup
```

Esto instala automáticamente: Node.js 20, PM2, Redis, Nginx, Certbot, UFW.

### 4. Configurar variables de entorno

```bash
cp .env.example .env
nano .env
```

Variables críticas a completar:

```bash
# Base de datos Supabase
DATABASE_URL="postgresql://postgres.REF:PASS@pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:PASS@db.REF.supabase.co:5432/postgres"

# JWT
JWT_SECRET=genera_con__openssl rand -hex 32

# OpenAI
OPENAI_API_KEY=sk-...

# Cifrado de datos de salud (WacoCoach)
ENCRYPTION_KEY=genera_con__node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Producción
NODE_ENV=production
CORS_ORIGIN=https://tudominio.com
```

### 5. Deploy inicial

```bash
./deploy.sh
```

### 6. Configurar SSL con Let's Encrypt

Primero, apuntá tu dominio a la IP del VPS (registro A en tu DNS).
Luego esperá 5–10 minutos para propagación y ejecutá:

```bash
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

Certbot renueva el certificado automáticamente cada 90 días.

### 7. Endurecer la seguridad (recomendado)

```bash
# ⚠️ Antes: asegurate de tener SSH key configurada
sudo ./security-hardening.sh
```

### 8. Configurar backups automáticos

```bash
# Editar crontab
crontab -e

# Agregar esta línea (backup todos los días a las 3am):
0 3 * * * /var/www/wacopro/backup.sh >> /var/www/wacopro/logs/backup.log 2>&1
```

---

## Comandos Diarios

```bash
# Estado de la app
./monitor.sh

# Logs en tiempo real
pm2 logs wacopro

# Reiniciar app
pm2 restart wacopro

# Deploy de actualización (después de git push)
./deploy.sh

# Monitor interactivo PM2
pm2 monit
```

---

## Nginx — Actualizar dominio

Editar `/etc/nginx/sites-available/wacopro` y reemplazar `tudominio.com` con tu dominio real:

```bash
sudo nano /etc/nginx/sites-available/wacopro
sudo nginx -t && sudo systemctl reload nginx
```

---

## Troubleshooting

| Problema | Solución |
|---|---|
| App no inicia | `pm2 logs wacopro` — ver el error exacto |
| Puerto 3000 no responde | `pm2 status` — verificar que el proceso está `online` |
| Error de DB | Verificar `DATABASE_URL` en `.env` y conectividad a Supabase |
| Error de Prisma | `npx prisma generate` y volver a hacer `npm run build` |
| Nginx 502 | App no está corriendo — `pm2 start ecosystem.config.js --env production` |
| SSL falló | Verificar que el dominio apunta a la IP correcta: `dig +short tudominio.com` |
| App usa mucha RAM | Ajustar `max_memory_restart` en `ecosystem.config.js` |

---

## Arquitectura en el VPS

```
Internet → Nginx (443/80) → Node.js/PM2 (3000) → Supabase (remoto)
                                                 → Redis (local, opcional)
```

- **Nginx** termina SSL y actúa como reverse proxy
- **PM2** gestiona el proceso Node.js (cluster mode, auto-restart)
- **Supabase** es la base de datos PostgreSQL (remota, gestionada)
- **Redis** para cache y colas Bull (local, opcional en producción pequeña)
