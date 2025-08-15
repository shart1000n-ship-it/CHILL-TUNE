#!/bin/bash
set -e

echo "Starting Vercel build..."

# Install dependencies
echo "Installing dependencies..."
npm ci

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build the application
echo "Building application..."
npm run build

echo "Build completed successfully!"
