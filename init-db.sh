#!/bin/bash
set -e
echo "DATABASE_NAME=$DATABASE_NAME"
echo "DATABASE_PASSWORD=$DATABASE_PASSWORD"

psql -U "$POSTGRES_USER" -d postgres -tc "SELECT 1 FROM pg_roles WHERE rolname = '$FLYWAY_USER'" | grep -q 1 || \
psql -U "$POSTGRES_USER" -d postgres -c "CREATE USER $FLYWAY_USER WITH LOGIN PASSWORD '$DATABASE_PASSWORD';"

psql -U "$POSTGRES_USER" -d postgres -tc "SELECT 1 FROM pg_roles WHERE rolname = '$PRISMA_USER'" | grep -q 1 || \
psql -U "$POSTGRES_USER" -d postgres -c "CREATE USER $PRISMA_USER WITH LOGIN PASSWORD '$DATABASE_PASSWORD';"

# Create the main database if it doesn't exist
psql -U "$POSTGRES_USER" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DATABASE_NAME'" | grep -q 1 || \
psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE $DATABASE_NAME;"

# Change ownership
psql -U "$POSTGRES_USER" -d postgres -c "ALTER DATABASE \"$DATABASE_NAME\" OWNER TO $FLYWAY_USER;"
psql -U "$POSTGRES_USER" -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE \"$DATABASE_NAME\" TO $FLYWAY_USER;"

psql -U "$POSTGRES_USER" -d postgres -c "GRANT CONNECT ON DATABASE $DATABASE_NAME TO $PRISMA_USER;"
psql -U "$POSTGRES_USER" -d postgres -c "GRANT USAGE ON SCHEMA public TO $PRISMA_USER;"
psql -U "$POSTGRES_USER" -d postgres -c "GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO $PRISMA_USER;"
psql -U "$POSTGRES_USER" -d postgres -c "GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO $PRISMA_USER;"

# Enable required extensions
for DB in "$DATABASE_NAME"; do
  psql -U "$POSTGRES_USER" -d "$DB" -c "CREATE EXTENSION IF NOT EXISTS \"pg_stat_statements\";"
done