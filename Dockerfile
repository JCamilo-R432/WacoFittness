FROM node:21-alpine

WORKDIR /app

# Instalar dependencias del sistema necesarias para compilar paquetes
RUN apk add --no-cache python3 make g++ openssl

# Copiar archivos de dependencias primero para aprovechar la caché de Docker
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar carpeta prisma y generar cliente
COPY prisma ./prisma/
RUN npx prisma generate

# Copiar el resto del código fuente
COPY . .

EXPOSE 3000

# Script de inicio en desarrollo
CMD ["npm", "run", "dev"]
