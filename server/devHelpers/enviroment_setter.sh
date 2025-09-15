#!/bin/bash

# Name: switch-env.sh
# Usage: ./switch-env.sh dev  OR  ./switch-env.sh prod

ENV_FILE="./.env"

# Check if argument is given
if [ $# -ne 1 ]; then
  echo "❌ Error: Missing argument."
  echo "Usage: $0 [dev|prod]"
  exit 1
fi

ARG="$1"

# Validate argument
if [ "$ARG" != "dev" ] && [ "$ARG" != "prod" ]; then
  echo "❌ Error: Invalid argument '$ARG'"
  echo "Argument must be 'dev' or 'prod'."
  exit 1
fi

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Error: $ENV_FILE not found in current directory."
  exit 1
fi

# Replace or add ENVIRONMENT line
if [ "$1" != "prod" ]; then
    # For 'dev' environment
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://prisma_user:prisma_pass@localhost:5433/habits_test|" .env
else
    # For 'prod' environment
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://prisma_user:prisma_pass@localhost:5432/habits|" .env
fi

echo "✅ Updated ENVIRONMENT to '$ARG' in $ENV_FILE"

if [ "$2" == "run" ]; then
    if [ "$ARG" == "prod" ]; then
        echo "🚀 Starting application in production mode..."
        # Command to start your application in production mode
        npm run start
    else
        echo "🔧 Starting application in development mode..."
        # Command to start your application in development mode
        npm run dev
    fi
fi
