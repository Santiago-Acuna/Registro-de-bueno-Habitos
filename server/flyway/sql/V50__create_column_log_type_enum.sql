-- =========================================
-- V50: Create column_log_type ENUM Type
-- =========================================
-- Description: Creates a PostgreSQL ENUM type to define the data type of columns
--              in log tables. This enum ensures type safety when defining what kind
--              of data can be stored in log table columns.
--
-- Prerequisites:
--   - PostgreSQL database with enum type support
--   - flyway_admin role exists with appropriate permissions
--   - prisma_user role exists for application-level access
--
-- Business Impact:
--   - Provides type safety for column type definitions in log tables
--   - Constrains column types to valid values: text, number, boolean
--   - Prevents invalid data types from being specified
--   - Enables database-level validation of column type metadata
--
-- PostgreSQL Best Practices Applied:
--   - Use of ENUM type for constrained value sets
--   - Proper schema qualification (public.column_log_type)
--   - Ownership assignment to flyway_admin
--   - Defensive programming with existence checks
--   - Comprehensive documentation via comments
-- =========================================

-- =========================================
-- STEP 1: Validate Prerequisites
-- =========================================
-- Ensure required roles exist before proceeding

-- Verify flyway_admin role exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_roles
        WHERE rolname = 'flyway_admin'
    ) THEN
        RAISE EXCEPTION 'Prerequisites not met: flyway_admin role does not exist.';
    END IF;
END $$;

-- Verify prisma_user role exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_roles
        WHERE rolname = 'prisma_user'
    ) THEN
        RAISE WARNING 'prisma_user role does not exist. USAGE grant will be skipped.';
    END IF;
END $$;

-- =========================================
-- STEP 2: Create ENUM Type
-- =========================================
-- Create the column_log_type enum with three allowed values

-- Create ENUM type for log column data types
-- Values: text (string data), number (numeric data), boolean (true/false)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type
        WHERE typname = 'column_log_type'
        AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        CREATE TYPE public.column_log_type AS ENUM (
            'text',
            'number',
            'boolean'
        );
        RAISE NOTICE 'ENUM type column_log_type created successfully';
    ELSE
        RAISE NOTICE 'ENUM type column_log_type already exists, skipping creation';
    END IF;
END $$;

-- =========================================
-- STEP 3: Set Ownership and Permissions
-- =========================================
-- Assign ownership to flyway_admin and grant usage to prisma_user

-- Set owner to flyway_admin (following existing pattern)
ALTER TYPE public.column_log_type OWNER TO flyway_admin;

-- Grant USAGE permission to prisma_user for application access
-- USAGE on types allows the role to use the type in table definitions and queries
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'prisma_user') THEN
        EXECUTE 'GRANT USAGE ON TYPE public.column_log_type TO prisma_user';
        RAISE NOTICE 'USAGE permission granted to prisma_user';
    END IF;
END $$;

-- =========================================
-- STEP 4: Add Documentation
-- =========================================
-- Add comprehensive comment describing the enum type

COMMENT ON TYPE public.column_log_type IS
'ENUM type defining the allowed data types for columns in log tables.
Valid values:
  - text: String/text data (VARCHAR, TEXT, etc.)
  - number: Numeric data (INTEGER, DECIMAL, FLOAT, etc.)
  - boolean: Boolean true/false values

This type ensures type safety and validation when defining column metadata
for dynamic log table structures.';

-- =========================================
-- STEP 5: Validation and Verification
-- =========================================
-- Verify the migration completed successfully

-- Verify ENUM type was created successfully
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type
        WHERE typname = 'column_log_type'
        AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND typtype = 'e' -- 'e' indicates enum type
    ) THEN
        RAISE WARNING 'ENUM type creation verification failed: column_log_type not found';
    ELSE
        RAISE NOTICE 'Success: ENUM type column_log_type created and verified';
    END IF;
END $$;

-- Verify ENUM has correct values
DO $$
DECLARE
    enum_values TEXT[];
    expected_values TEXT[] := ARRAY['text', 'number', 'boolean'];
BEGIN
    SELECT ARRAY_AGG(enumlabel ORDER BY enumsortorder)
    INTO enum_values
    FROM pg_enum
    WHERE enumtypid = 'public.column_log_type'::regtype;

    IF enum_values = expected_values THEN
        RAISE NOTICE 'Success: ENUM values verified - %', enum_values;
    ELSE
        RAISE WARNING 'ENUM values mismatch. Expected: %, Found: %', expected_values, enum_values;
    END IF;
END $$;

-- Verify ownership
DO $$
DECLARE
    type_owner TEXT;
BEGIN
    SELECT pg_catalog.pg_get_userbyid(t.typowner)
    INTO type_owner
    FROM pg_type t
    WHERE t.typname = 'column_log_type'
    AND t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

    IF type_owner = 'flyway_admin' THEN
        RAISE NOTICE 'Success: ENUM type ownership verified - owned by flyway_admin';
    ELSE
        RAISE WARNING 'Ownership verification failed: Expected flyway_admin, found %', type_owner;
    END IF;
END $$;

-- =========================================
-- MIGRATION SUMMARY AND USAGE NOTES
-- =========================================
-- This migration creates a PostgreSQL ENUM type for log column type definitions:
--
-- 1. ENUM TYPE CREATED:
--    - Name: public.column_log_type
--    - Values: 'text', 'number', 'boolean'
--    - Owner: flyway_admin
--    - Permissions: USAGE granted to prisma_user
--
-- 2. INTENDED USE CASES:
--    - Define column types in log table metadata tables
--    - Ensure type safety when creating dynamic log table structures
--    - Validate column type specifications at database level
--    - Document allowed data types for log columns
--
-- 3. EXAMPLE USAGE IN TABLE DEFINITIONS:
--    CREATE TABLE log_columns (
--        id UUID PRIMARY KEY,
--        column_name VARCHAR(100) NOT NULL,
--        column_type public.column_log_type NOT NULL,
--        is_required BOOLEAN DEFAULT FALSE
--    );
--
--    INSERT INTO log_columns (column_name, column_type, is_required)
--    VALUES ('description', 'text', TRUE),
--           ('quantity', 'number', FALSE),
--           ('is_completed', 'boolean', FALSE);
--
-- 4. QUERYING ENUM VALUES:
--    -- Get all possible enum values
--    SELECT enumlabel
--    FROM pg_enum
--    WHERE enumtypid = 'public.column_log_type'::regtype
--    ORDER BY enumsortorder;
--
--    -- Check if a value is valid
--    SELECT 'text'::public.column_log_type; -- Valid
--    SELECT 'invalid'::public.column_log_type; -- Will raise error
--
-- 5. TYPE CASTING AND VALIDATION:
--    -- Validate a value before casting
--    SELECT CASE
--        WHEN $1::TEXT = ANY(ENUM_RANGE(NULL::public.column_log_type)::TEXT[])
--        THEN $1::public.column_log_type
--        ELSE NULL
--    END;
--
-- 6. MODIFYING ENUM VALUES (Future Migrations):
--    -- Add a new value (e.g., 'date')
--    ALTER TYPE public.column_log_type ADD VALUE 'date';
--
--    -- Note: PostgreSQL does not support removing enum values
--    -- If you need to remove a value, you must:
--    -- 1. Create a new enum type
--    -- 2. Migrate all tables to use the new type
--    -- 3. Drop the old type
--
-- 7. IMPACT ON APPLICATION LAYER:
--    - Prisma schema should define enum with matching values
--    - Application validation should align with enum values
--    - TypeScript types should mirror enum values for type safety
--
-- 8. ROLLBACK PROCEDURE (If Needed):
--    -- WARNING: Only execute if no tables are using this type
--    -- Check for dependent objects first:
--    SELECT
--        n.nspname AS schema,
--        t.relname AS table,
--        a.attname AS column
--    FROM pg_attribute a
--    JOIN pg_class t ON a.attrelid = t.oid
--    JOIN pg_namespace n ON t.relnamespace = n.oid
--    JOIN pg_type ty ON a.atttypid = ty.oid
--    WHERE ty.typname = 'column_log_type'
--    AND n.nspname = 'public';
--
--    -- If no dependencies exist, drop the type:
--    DROP TYPE IF EXISTS public.column_log_type CASCADE;
--
-- 9. MAINTENANCE NOTES:
--    - Enum values are ordered and immutable
--    - Adding values is safe and non-blocking
--    - Removing values requires recreating the enum
--    - Consider application backward compatibility when modifying
--    - Document any changes to enum values in migration files
--
-- 10. RELATED TABLES (Expected Future Usage):
--    - May be used by log column metadata tables
--    - May be used by dynamic log table definition tables
--    - Ensures consistency across all log-related structures
