# 🏋️ WacoPro Fitness & Nutrition API

**Estado: En desarrollo**

Es una API REST para la gestión integral de rutinas de entrenamiento, récords personales (PR) y perfil nutricional. 

### Tecnologías:
- **Node.js**: Entorno de ejecución de servidor.
- **Express**: Framework backend robusto.
- **TypeScript**: Estricto tipado estático.
- **Prisma**: ORM moderno para Node.js.
- **PostgreSQL**: Base de datos relacional.
- **Redis**: Capa de caché.

---

## 📋 Requisitos Previos

- **Node.js** 18+
- **Docker** y **Docker Compose**
- **npm** o yarn

---

## ⚡ Instalación Rápida

```bash
# 1. Clonar repositorio
git clone <repo>
cd ServicioDeApps1

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Levantar infraestructura
docker-compose up -d postgres redis

# 4. Esperar 30 segundos
sleep 30

# 5. Instalar dependencias
npm install

# 6. Generar Prisma Client
npx prisma generate

# 7. Aplicar migraciones
npx prisma migrate dev --name init

# 8. Ejecutar seeders
npx ts-node prisma/seed.ts
npx ts-node prisma/seed_training.ts

# 9. Iniciar servidor
npm run dev
```

---

## 🌐 Endpoints Principales

### 🍎 Nutrición
- `POST /api/nutrition/profile` - Crear/actualizar perfil nutricional y macros.
- `GET /api/nutrition/profile/calculate` - Calcular de prueba el TDEE.
- `GET /api/nutrition/foods` - Listar base de alimentos con compatibilidad de *fuzzy search*.
- `POST /api/nutrition/meals/log` - Registrar la ingesta de un alimento con gramos e ID referencial.
- `POST /api/nutrition/meal-plans/generate` - Autogenera planes de alimentación para los `durationDays` seteados en base a targets.
- `GET /api/nutrition/meals/log/summary/daily` - Obtener resumen calórico y de macros diarios.

### 💪 Entrenamiento
- `POST /api/training/profile` - Configurar experiencia, equipo de trabajo e intensidad.
- `POST /api/training/calculator/1rm` - Calcula tu peso en repetición máxima mediante `Epley`, `Brzycki`, etc.
- `GET /api/training/exercises` - Lista toda la galería de ejercicios disponibles mapeados.
- `POST /api/training/workouts/log` - Guarda una sesión completada en el historial.
- `POST /api/training/plans/generate` - Instancia planes de entrenamiento y rutinas específicas (Próximamente autogeneración IA).

---

## 🛠️ Comandos Útiles

```bash
npm run dev          # Iniciar servicio en modo desarrollo (Watch-mode)
npm run build        # Compilar typescript para producción
npm run start        # Iniciar desde el build ejecutando los JS compilados
npm test             # Correr tests vía Jest
npx prisma studio    # UI para visualizar y poder editar la información guardada
npx prisma generate  # Actualizar los typings del ORM luego de un pull global
docker-compose up -d # Levantar la infra al background
docker-compose down  # Apagar y desmontar Docker de manera segura
docker-compose logs -f # Analizar logs en crudo en vivo de los servicios de la API
```

---

## 📂 Estructura del Proyecto

```text
ServicioDeApps1/
├── src/
│   ├── app.ts            # Wrapper general y enrutador maestro.
│   ├── server.ts         # Inyector base portuario.
│   ├── controllers/
│   ├── services/         # Encapsulan el negocio (generación, validación manual).
│   ├── repositories/     # Interfaces transparentes entre código general y llamadas del ORM.
│   ├── routes/           # Mapeo a controllers con sus middlewares protectores de validación y auth.
│   ├── schemas/          # Estructuras de validación anti-error en crudo (Zod).
│   ├── middleware/       # Protectores base del Request API (ej: extracción de Token JWT).
│   └── utils/            # Calculadoras matemáticas, conexión a Redis.
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── seed_training.ts
├── tests/
├── docker-compose.yml
├── Dockerfile
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚑 Solución de Problemas Comunes

- **Puerto ya en uso (`EADDRINUSE`)**: Probable choque con otro proyecto backend corriendo. Modifica `PORT` dentro de tu `.env`.
- **Prisma Client no generado**: Node.js marcará un error importando el módulo. Corre en la consola `npx prisma generate`.
- **Conexión a DB falla**: Postgres puede seguir en arranque o haber fallado. Corre `docker-compose ps` y de ser necesario detén servicios `docker-compose down`.
- **Las Migraciones fallan con errores atascados**: La base de datos local generó incoherencias con un esquema guardado anterior tras algún cambio súbito de Git. Ejecuta `npx prisma migrate reset` para purgar con una instancia limpia **(¡Peligro, destruirá tu data real actual!)**.

---

## 🧪 Testing

```bash
# Para correr tu batería actual de algoritmos funcionales
npm test

# Para analizar en un HTML qué porcentaje del código total de utilidades evalúa el Test actual
npm test -- --coverage
```
El directorio oficial de escritura de casos se ubica bajo `tests/` y es detectado globalmente.
