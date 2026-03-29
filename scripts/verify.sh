#!/bin/bash

echo "=== VERIFICANDO INFRAESTRUCTURA ==="
echo ""

# 1. Verificar archivos
echo "1. Archivos existentes:"
if [ -f "docker-compose.yml" ] && [ -f ".env" ] && [ -f "Dockerfile" ]; then
    echo "✅ Todos los archivos de infraestructura existen"
else
    echo "❌ Faltan archivos de infraestructura"
    exit 1
fi

# 2. Docker status
echo ""
echo "2. Docker status:"
docker-compose ps

# 3. Conexión PostgreSQL
echo ""
echo "3. Conexión PostgreSQL:"
docker-compose exec postgres pg_isready -U postgres

# 4. Conexión Redis
echo ""
echo "4. Conexión Redis:"
docker-compose exec redis redis-cli ping

# 5. Servidor
echo ""
echo "5. Servidor:"
if curl -s http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ Servidor respondiendo en http://localhost:3000"
else
    echo "❌ Servidor no responde"
fi

echo ""
echo "=== VERIFICACIÓN COMPLETADA ==="
