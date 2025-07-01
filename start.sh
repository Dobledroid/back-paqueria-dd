#!/bin/bash
# Script de inicio para producción

# Construir la aplicación
echo "🔨 Building application..."
npm run build

# Verificar que el build fue exitoso
if [ ! -f "dist/index.js" ]; then
    echo "❌ Build failed: dist/index.js not found"
    exit 1
fi

# Iniciar la aplicación
echo "🚀 Starting application..."
node dist/index.js
