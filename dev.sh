#!/bin/env sh
set -e

python backend/serve.py &
BACKEND_PID=$!
python backend/runner.py &
RUNNER_PID=$!

cleanup() {
    echo "Stopping backend (PID: $BACKEND_PID)..."
    kill "$BACKEND_PID" 2>/dev/null || true
    
    echo "Stopping backend (PID: $RUNNER_PID)..."
    kill "$runner_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

cd vite-ui
npm run dev || true
