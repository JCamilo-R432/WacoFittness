# WacoPro Fitness — Guía de Migración Fase 2 → Fase 3

## Resumen de cambios

| Área | Qué se agregó |
|------|--------------|
| Schema | `UserSubscription`, `Payment`, `AuditLog`, `SupportTicket`, `SupportTicketReply` + campos en `User` |
| Deps | `stripe`, `@sendgrid/mail`, `otplib`, `qrcode`, `bull`, `ioredis`, `express-rate-limit`, `pino`, `prom-client` |
| Rutas | `/api/payments/*`, `/api/webhooks/*`, `/api/security/*`, `/api/admin/*` |
| Frontend | `pricing.html`, `billing.html`, `security-settings.html`, `admin-dashboard.html` |
| CI/CD | `.github/workflows/ci-cd.yml` |

---

## Paso 1: Instalar dependencias

```powershell
npm install
```

Esto instalará: `stripe`, `@sendgrid/mail`, `otplib`, `qrcode`, `bull`, `ioredis`,
`express-rate-limit`, `pino`, `pino-http`, `prom-client`

---

## Paso 2: Migrar la base de datos

```powershell
# Aplicar schema (añade 5 nuevas tablas + campos en User)
npx prisma db push

# Regenerar cliente TypeScript
npx prisma generate
```

### Nuevas tablas que se crearán:
- `user_subscriptions` — Suscripciones activas
- `payments` — Historial de pagos
- `audit_logs` — Registro de auditoría
- `support_tickets` — Tickets de soporte
- `support_ticket_replies` — Respuestas a tickets

### Nuevos campos en `users`:
- `role` (default: `user`)
- `stripeCustomerId`
- `twoFASecret`, `twoFAEnabled`, `twoFABackupCodes`
- `isBanned`, `bannedAt`, `bannedReason`

---

## Paso 3: Configurar Stripe

### 3.1 Crear cuenta y obtener claves
1. Ve a [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Developers → API keys** → copia `sk_test_...` y `pk_test_...`
3. Agrega al `.env`:
```env
STRIPE_SECRET_KEY=sk_test_XXXX
STRIPE_PUBLISHABLE_KEY=pk_test_XXXX
```

### 3.2 Crear productos y precios
1. **Products → Add product** → crea "WacoPro Pro" ($9.99/mes recurrente)
2. Copia el **Price ID** (ej: `price_1ABC...`)
3. Repite para "WacoPro Premium" ($19.99/mes)
4. Agrega al `.env`:
```env
STRIPE_PRICE_PRO=price_XXXX
STRIPE_PRICE_PREMIUM=price_XXXX
```

### 3.3 Configurar Webhook
1. **Developers → Webhooks → Add endpoint**
2. URL: `https://tuapp.com/api/webhooks/stripe`
3. Eventos a escuchar:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
4. Copia el **Signing secret** (`whsec_...`)
5. Agrega al `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_XXXX
```

### 3.4 Probar webhooks localmente
```powershell
# Instalar Stripe CLI
# https://stripe.com/docs/stripe-cli

stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Paso 4: Configurar SendGrid (Email)

1. Ve a [sendgrid.com](https://app.sendgrid.com)
2. **Settings → API Keys → Create API Key** (permisos: Mail Send)
3. Verifica tu dominio en **Settings → Sender Authentication**
4. Agrega al `.env`:
```env
SENDGRID_API_KEY=SG.XXXX
FROM_EMAIL=noreply@tudominio.com
FROM_NAME=WacoPro Fitness
```

> **Alternativa sin SendGrid:** En desarrollo, sin `SENDGRID_API_KEY` configurada,
> los emails se loggean en consola en lugar de enviarse. La app funciona normalmente.

---

## Paso 5: Crear primer Admin

```powershell
# Después de registrarte como usuario normal:
npx ts-node -e "
const prisma = require('./src/config/database').default;
prisma.user.update({
  where: { email: 'tu@email.com' },
  data: { role: 'superadmin' }
}).then(() => { console.log('Admin creado'); prisma.\$disconnect(); });
"
```

---

## Paso 6: Verificar instalación

```powershell
# 1. Iniciar servidor
npm run dev

# 2. Verificar health
curl http://localhost:3000/api/health

# 3. Ver planes
curl http://localhost:3000/api/payments/plans

# 4. Acceder a páginas nuevas
# http://localhost:3000/pricing
# http://localhost:3000/billing
# http://localhost:3000/security-settings
# http://localhost:3000/admin-dashboard

# 5. Verificar métricas Prometheus
curl http://localhost:3000/metrics
```

---

## Endpoints nuevos — API Reference

### Payments
```
GET  /api/payments/plans          → Lista de planes (público)
GET  /api/payments/subscription   → Suscripción actual del usuario
POST /api/payments/checkout       → Crear sesión de checkout Stripe
POST /api/payments/portal         → Abrir billing portal de Stripe
DELETE /api/payments/subscription → Cancelar suscripción
GET  /api/payments/history        → Historial de pagos
```

### Webhooks
```
POST /api/webhooks/stripe         → Eventos de Stripe (raw body)
```

### Security (2FA)
```
GET    /api/security/2fa/status                       → Estado de 2FA
POST   /api/security/2fa/setup                        → Iniciar setup (obtener QR)
POST   /api/security/2fa/verify                       → Verificar código y activar
DELETE /api/security/2fa/disable                      → Desactivar 2FA
POST   /api/security/2fa/backup-codes/regenerate      → Regenerar backup codes
GET    /api/security/audit-log                        → Mis acciones recientes
POST   /api/security/tickets                          → Crear ticket de soporte
GET    /api/security/tickets                          → Mis tickets
```

### Admin (requiere rol admin o superadmin)
```
GET  /api/admin/stats             → Métricas globales del dashboard
GET  /api/admin/revenue           → Métricas de revenue (MRR, ARR)
GET  /api/admin/users             → Lista de usuarios con filtros
GET  /api/admin/users/:id         → Detalle de usuario
PUT  /api/admin/users/:id         → Editar usuario (rol, estado)
POST /api/admin/users/:id/ban     → Banear usuario
POST /api/admin/users/:id/unban   → Desbanear usuario
GET  /api/admin/tickets           → Todos los tickets de soporte
POST /api/admin/tickets/:id/reply → Responder ticket
POST /api/admin/tickets/:id/close → Cerrar ticket
GET  /api/admin/audit-logs        → Audit log global con filtros
```

---

## RBAC — Roles disponibles

| Rol | Acceso |
|-----|--------|
| `user` | Features básicos (plan Free) |
| `pro` | Features plan Pro |
| `premium` | Features plan Premium |
| `support` | Ver tickets, no gestionar usuarios |
| `admin` | Gestión completa de usuarios y contenido |
| `superadmin` | Acceso total al sistema |

> Los roles se asignan automáticamente cuando el usuario suscribe a un plan.
> Para roles `admin`/`superadmin`, asignar manualmente en BD.

---

## 2FA — Flujo de autenticación

El sistema 2FA usa TOTP (Time-based One-Time Password), compatible con:
- Google Authenticator
- Authy
- Microsoft Authenticator
- 1Password (función TOTP)

### Flujo de setup:
1. Usuario va a `/security-settings`
2. Hace click en "Activar 2FA"
3. Backend genera secret + QR → frontend lo muestra
4. Usuario escanea con su app
5. Introduce el código de 6 dígitos
6. Backend verifica y activa → envía backup codes por email

### Flujo de login con 2FA activo:
> **NOTA:** El flujo de login existente en `auth.controller.ts` necesita ser actualizado
> para verificar 2FA después de la contraseña. Ver `src/services/twofa.service.ts`
> método `verifyLogin(userId, code)`.

---

## CI/CD — GitHub Actions

### Secrets necesarios en GitHub:
- `DATABASE_URL_TEST` — BD de test
- `DIRECT_URL_TEST` — Conexión directa test
- `VERCEL_TOKEN` — Token de Vercel
- `VERCEL_ORG_ID` — ID de organización en Vercel
- `VERCEL_PROJECT_ID` — ID del proyecto en Vercel
- `SNYK_TOKEN` — Para security scan (opcional)
- `SLACK_WEBHOOK_URL` — Para notificaciones (opcional)

### Flujo:
- `develop` branch → deploy automático a staging
- `main` branch → deploy a production (requiere aprobación en GitHub)
- Cada PR → lint + tests + security scan

---

## Redis — Configuración opcional

Sin Redis configurado, el Queue Service ejecuta jobs síncronamente
(email se envía directamente). Redis es **recomendado en producción** para:
- Reintentos automáticos de emails fallidos
- Jobs asíncronos sin bloquear requests
- Caching distribuido

```env
# Opstash gratuito: upstash.com
REDIS_URL=redis://default:PASSWORD@HOST.upstash.io:6379
```

---

## Checklist de verificación

```
[ ] npm install completado sin errores
[ ] npx prisma db push completado (5 tablas nuevas)
[ ] npx prisma generate completado
[ ] npm run dev inicia sin errores TypeScript
[ ] GET /api/payments/plans devuelve 3 planes
[ ] http://localhost:3000/pricing carga correctamente
[ ] http://localhost:3000/admin-dashboard redirige a login (no 404)
[ ] Primer admin creado en BD
[ ] http://localhost:3000/admin-dashboard carga stats (como admin)
[ ] STRIPE_SECRET_KEY configurada y checkout funciona
[ ] SENDGRID_API_KEY configurada (o emails en consola en dev)
```
