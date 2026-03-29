#!/bin/bash
set -e

echo "🧪 Corriendo tests..."
echo ""

npm test -- --coverage

echo ""
echo "📊 Reporte de coverage generado en coverage/"
echo "🌐 Abrir con: open coverage/index.html (Mac) o xdg-open coverage/index.html (Linux)"
