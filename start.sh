#!/bin/bash
echo "Starting Photo Manager..."

cd "$(dirname "$0")"

# Start backend
cd backend/PhotoManager.API
dotnet run --urls http://localhost:5000 &
BACKEND_PID=$!
cd ../..

sleep 3

# Start frontend
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
