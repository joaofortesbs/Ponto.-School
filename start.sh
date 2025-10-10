#!/bin/bash

# Start backend server
node api/server.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Check if we're in production/deployment mode
if [ "$REPLIT_DEPLOYMENT" = "1" ] || [ "$NODE_ENV" = "production" ]; then
  echo "🚀 Starting production server..."
  # For production, serve the built app
  npm run preview &
  FRONTEND_PID=$!
else
  echo "🔧 Starting development server..."
  # For development, use dev server
  npm run dev &
  FRONTEND_PID=$!
fi

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
