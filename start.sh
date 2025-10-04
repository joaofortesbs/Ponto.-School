#!/bin/bash

# Start backend server
node api/server.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend
npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
