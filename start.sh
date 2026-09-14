#!/usr/bin/env bash
# Start een lokale HTTP-server voor LuantiStudio
PORT=${1:-8080}
echo "LuantiStudio → http://localhost:$PORT"
if command -v python3 &>/dev/null; then
  python3 -m http.server $PORT
elif command -v npx &>/dev/null; then
  npx serve . -l $PORT
else
  echo "Geen python3 of npx gevonden. Installeer een van beide."
  exit 1
fi
