#!/bin/bash

# Check if we're in production/deployment mode
if [ "$REPLIT_DEPLOYMENT" = "1" ] || [ "$NODE_ENV" = "production" ]; then
  echo "🚀 Starting production server (Express serving built app)..."
  # Em produção, apenas o Express server (ele serve os arquivos estáticos do dist)
  exec node api/server.js
else
  echo "🔧 Starting development servers..."
  # Start backend server
  node api/server.js &
  BACKEND_PID=$!

  # Wait a moment for backend to start
  sleep 2

  # For development, use dev server
  npm run dev &
  FRONTEND_PID=$!

  # Wait for both processes
  wait $BACKEND_PID $FRONTEND_PID
fi
