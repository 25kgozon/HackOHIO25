#!/bin/env sh
set -e

# sudo docker compose up db -d

python src/backend/serve.py &
BACKEND_PID=$!
python src/backend/runner.py &
RUNNER_PID=$!


cleanup() {
    echo "Stopping backend (PID: $BACKEND_PID)..."
    kill "$BACKEND_PID" 2>/dev/null || true
    
    echo "Stopping backend (PID: $RUNNER_PID)..."
    kill "$RUNNER_PID" 2>/dev/null || true


}
trap cleanup EXIT INT TERM

cd src/frontend/vite-ui
npm run dev || true
