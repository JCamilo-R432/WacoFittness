# WacoPro Fitness — Guía de Migraciones Prisma + Supabase

## ¿Por qué ocurren los errores?

Supabase usa **PgBouncer** como connection pooler entre tu app y la base de datos real.

```
Tu App  →  DATABASE_URL (puerto 6543, PgBouncer)  →  PostgreSQL
                           ↑
                   Optimizado para QUERIES
                   NO soporta prepared statements
                   NO válido para MIGRACIONES

Tu App  →  DIRECT_URL (puerto 5432, conexión directa)  →  PostgreSQL
                       ↑
                 Conexión real a la BD
                 REQUERIDO para migraciones
```

---

## Configuración correcta del .env

> ⚠️ **Error frecuente:** Ambas URLs deben tener **hosts diferentes**, no solo puertos distintos.

```env
# ─── Para queries normales en la app ─────────────────────────
# Host: aws-0-REGION.pooler.supabase.com  Puerto: 6543  (PgBouncer)
# Usuario: postgres.PROYECTO (con el ref del proyecto)
DATABASE_URL="postgresql://postgres.PROYECTO:[PASSWORD]@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# ─── Para migraciones de Prisma ──────────────────────────────
# Host: db.PROYECTO.supabase.co  Puerto: 5432  (conexión directa)
# Usuario: postgres (sin el ref del proyecto)
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.PROYECTO.supabase.co:5432/postgres"
```

### Diferencias clave entre las dos URLs

| | DATABASE_URL | DIRECT_URL |
|---|---|---|
| **Host** | `aws-0-REGION.pooler.supabase.com` | `db.PROYECTO.supabase.co` |
| **Puerto** | `6543` | `5432` |
| **Usuario** | `postgres.PROYECTO` | `postgres` |
| **Params** | `?pgbouncer=true&connection_limit=1` | ninguno |
| **Uso** | Queries en runtime | Migraciones Prisma |

### Cómo obtenerlas en Supabase Dashboard

1. Ve a **supabase.com** → tu proyecto → **Settings** → **Database**
2. Sección **Connection string** → pestaña **URI**:
   - Modo **"Transaction"** o **"Session"** → copia como `DATABASE_URL` (pooler, puerto 6543)
3. Pestaña **"Direct connection"** (o "Connection string" sin pooler):
   - Puerto 5432, host `db.[proyecto].supabase.co` → copia como `DIRECT_URL`

---

## Diagrama de flujo: ¿Qué comando usar?

```
¿Quieres actualizar la BD?
        │
        ├─ Desarrollo / cambios rápidos ──→ npx prisma db push
        │
        ├─ Producción / historial        ──→ npx prisma migrate dev
        │
        └─ Solo regenerar cliente        ──→ npx prisma generate
```

---

## Comandos copy-paste para PowerShell

### Opción A — `db push` (recomendada para desarrollo)

```powershell
# Desde la raíz del proyecto:
npx prisma db push
npx prisma generate
```

Prisma detecta automáticamente `DIRECT_URL` del `.env` para aplicar el push.

**Output exitoso esperado:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database ...
🚀  Your database is now in sync with your Prisma schema.
✔ Generated Prisma Client
```

---

### Opción B — `migrate dev` (historial versionado)

```powershell
npx prisma migrate dev --name phase2-social-body
```

Prisma usa `directUrl` del `schema.prisma` automáticamente para la migración.

**Output exitoso esperado:**
```
Applying migration `20240319_phase2_social_body`
The following migration have been applied:
migrations/
  └─ 20240319_phase2_social_body/
       └─ migration.sql
✔ Generated Prisma Client
```

---

### Opción C — Solo regenerar el cliente (sin cambios en BD)

```powershell
npx prisma generate
```

---

## Errores comunes y soluciones

### ❌ `prepared statement "s1" already exists`

**Causa:** `DATABASE_URL` apunta al pooler (6543), que no soporta prepared statements en modo sesión.

**Solución:**
```env
# Asegúrate de que DATABASE_URL tenga ?pgbouncer=true&connection_limit=1
DATABASE_URL="postgresql://...@...:6543/postgres?pgbouncer=true&connection_limit=1"
# Y que DIRECT_URL use puerto 5432 SIN parámetros extra
DIRECT_URL="postgresql://...@...:5432/postgres"
```

---

### ❌ `WSAStartup error` (código 10093)

**Causa:** Hay múltiples procesos Node/Prisma activos o la terminal no está limpia.

**Solución paso a paso:**
```powershell
# 1. Desde PowerShell con permisos de administrador:
taskkill /F /IM node.exe
taskkill /F /IM prisma.exe

# 2. Cierra TODAS las terminales PowerShell

# 3. Abre UNA terminal PowerShell nueva

# 4. Ejecuta la migración nuevamente
```

O usa el script automático:
```powershell
scripts\cleanup.bat
```

---

### ❌ `Can't reach database server`

**Causa:** Supabase pausa proyectos gratuitos inactivos.

**Solución:**
1. Ve a [supabase.com](https://supabase.com) → tu proyecto
2. Si ves un botón **"Resume project"** → haz clic
3. Espera 30-60 segundos
4. Vuelve a ejecutar el comando

---

### ❌ `Migration already applied`

**Causa:** Prisma registra que ya aplicó esta migración pero la tabla puede no existir.

**Solución:**
```powershell
# Opción 1: Marcar como aplicada sin ejecutar
npx prisma migrate resolve --applied "NOMBRE_DE_MIGRACION"

# Opción 2: Usar db push que no usa historial
npx prisma db push
```

---

### ❌ `EPERM: operation not permitted, unlink ...dll.node`

**Causa:** Otro proceso (Node/Prisma) tiene bloqueada la DLL del cliente.

**Solución:**
```powershell
# 1. Cierra el servidor si está corriendo (Ctrl+C)
taskkill /F /IM node.exe

# 2. Espera 3 segundos y vuelve a generar
npx prisma generate
```

---

### ❌ `Timeout exceeded`

**Causa:** La conexión a Supabase tarda demasiado.

**Solución** — Agrega timeout en la DIRECT_URL:
```env
DIRECT_URL="postgresql://...@...:5432/postgres?connect_timeout=30&pool_timeout=30"
```

---

## Checklist post-migración

```
[ ] npx prisma db push     → sin errores
[ ] npx prisma generate    → sin errores
[ ] npm run dev            → servidor inicia en puerto 3000
[ ] GET /api/health        → { success: true }
[ ] POST /api/auth/login   → token válido
[ ] GET /api/social/feed   → [] (array vacío, sin error)
[ ] GET /api/analytics/overview → datos de actividad
[ ] npx ts-node scripts/verify-migration.ts → ✅ todas las tablas
```

---

## Flujo completo recomendado (desde cero)

```powershell
# 1. Limpieza
scripts\cleanup.bat

# 2. (En terminal NUEVA) Instalar dependencias
npm install

# 3. Verificar .env
cat .env | Select-String "URL"
# Debe mostrar DATABASE_URL y DIRECT_URL

# 4. Aplicar schema a la BD
npx prisma db push

# 5. Regenerar cliente TypeScript
npx prisma generate

# 6. Verificar tablas
npx ts-node scripts/verify-migration.ts

# 7. Iniciar servidor
npm run dev
```

---

## ¿Por qué `directUrl` en schema.prisma?

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // Pooler - para queries en runtime
  directUrl = env("DIRECT_URL")     // Directo - Prisma lo usa auto en migraciones
}
```

Prisma detecta automáticamente cuándo usar `directUrl`:
- `migrate dev` / `migrate deploy` / `db push` → usa `directUrl`
- Queries normales en la app → usa `url` (pooler)

No necesitas cambiar nada manualmente.
