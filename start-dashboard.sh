#!/bin/bash
# Dashboard Auto-Start Script

DASHBOARD_DIR="/Users/donmeusi/.openclaw/workspace/dashboard"

echo "🚀 Starting OpenClaw Dashboard..."

# Start Backend
cd "$DASHBOARD_DIR"
nohup node server/index.js > server.log 2>&1 &
echo "✅ Backend started on http://localhost:3001"

# Optional: Start Frontend (comment out if not needed)
# cd "$DASHBOARD_DIR/client"
# nohup npm start > client.log 2>&1 &
# echo "✅ Frontend started on http://localhost:3000"

echo "📊 Dashboard is running!"
