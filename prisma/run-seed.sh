#!/bin/sh
set -e
apk add --no-cache libc6-compat > /dev/null 2>&1
mkdir -p /workspace
cp /src/package.json /workspace/
cp /src/package-lock.json /workspace/ 2>/dev/null || true
cp /src/tsconfig.json /workspace/
cp /src/prisma.config.ts /workspace/ 2>/dev/null || true
mkdir -p /workspace/prisma
cp /src/prisma/schema.prisma /workspace/prisma/
cp /src/prisma/seed.ts /workspace/prisma/
cd /workspace
echo 'Installing dependencies...'
npm install --prefer-offline 2>&1 | tail -3
echo 'Generating Prisma client...'
npx prisma generate 2>&1 | tail -5
echo 'Running seed...'
node_modules/.bin/tsx prisma/seed.ts
