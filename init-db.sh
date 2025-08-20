#!/bin/bash
set -e
echo "DATABASE_USER=$DATABASE_USER"
echo "DATABASE_NAME=$DATABASE_NAME"
echo "DATABASE_PASSWORD=$DATABASE_PASSWORD"

# Create the role if it doesn't exist
psql -U "$POSTGRES_USER" -d postgres -tc "SELECT 1 FROM pg_roles WHERE rolname = '$DATABASE_USER'" | grep -q 1 || \
psql -U "$POSTGRES_USER" -d postgres -c "CREATE ROLE $DATABASE_USER WITH LOGIN PASSWORD '$DATABASE_PASSWORD';"

# Create the main database if it doesn't exist
psql -U "$POSTGRES_USER" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DATABASE_NAME'" | grep -q 1 || \
psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE $DATABASE_NAME;"

# Create the shadow database if it doesn't exist
psql -U "$POSTGRES_USER" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'shadow'" | grep -q 1 || \
psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE shadow;"

# Change ownership of both databases to prisma_user
psql -U "$POSTGRES_USER" -d postgres -c "ALTER DATABASE \"$DATABASE_NAME\" OWNER TO $DATABASE_USER;"
psql -U "$POSTGRES_USER" -d postgres -c "ALTER DATABASE shadow OWNER TO $DATABASE_USER;"

# Enable extensions in both databases
for DB in "$DATABASE_NAME" shadow; do
  psql -U "$POSTGRES_USER" -d "$DB" -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
  psql -U "$POSTGRES_USER" -d "$DB" -c "CREATE EXTENSION IF NOT EXISTS \"pg_stat_statements\";"
done
