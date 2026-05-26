#!/bin/sh
set -e
echo "Applying database migrations..."
./node_modules/.bin/prisma migrate deploy
echo "Migrations done. Starting server..."
exec node server.js
