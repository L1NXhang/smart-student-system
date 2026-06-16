#!/bin/bash
# 智慧学工系统 - 开发环境启动脚本
# 使用: bash start-dev.sh

echo "========================================="
echo "  智慧学工系统 - 开发环境启动"
echo "========================================="

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 1. 检查 SSH 隧道
echo "[1/3] 建立 MySQL SSH 隧道..."
if ssh -O check -S /tmp/sshtunnel 2>/dev/null; then
  echo "  SSH 隧道已存在"
else
  ssh -o StrictHostKeyChecking=no -f -N -M -S /tmp/sshtunnel -L 3306:localhost:3306 \
    -i "D:/TOYCLAUDE/个人网站/mysshkey.pem" ubuntu@124.223.0.187 2>/dev/null
  echo "  SSH 隧道已建立 (localhost:3306 → 124.223.0.187:3306)"
fi

# 2. 启动后端
echo "[2/3] 启动后端服务..."
cd "$PROJECT_DIR/backend"
if [ ! -d "node_modules" ]; then
  npm install
fi
nohup node src/app.js > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
sleep 2
if kill -0 $BACKEND_PID 2>/dev/null; then
  echo "  后端已启动 (PID: $BACKEND_PID, Port: 3000)"
else
  echo "  后端启动失败，查看日志: cat /tmp/backend.log"
  exit 1
fi

# 3. 启动前端
echo "[3/3] 启动前端开发服务器..."
cd "$PROJECT_DIR/frontend"
if [ ! -d "node_modules" ]; then
  npm install
fi
echo "  前端开发服务器启动中..."
echo ""
echo "========================================="
echo "  前端: http://localhost:5173"
echo "  后端: http://localhost:3000/api"
echo "  管理账号: admin / 123456"
echo "  学生账号: 2023010001 / 123456"
echo "========================================="
echo ""
npx vite --host
