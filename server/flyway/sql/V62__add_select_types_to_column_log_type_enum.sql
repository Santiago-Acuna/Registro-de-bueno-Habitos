-- =========================================
-- V62: Add select_simple and select_multiple to column_log_type ENUM
-- =========================================
-- Description: Extends the column_log_type ENUM with two new values for
--              select-based input types. These allow log columns to support
--              single-choice and multiple-choice selection fields.
--
-- Prerequisites:
--   - V50 migration executed (column_log_type ENUM exists)
--   - PostgreSQL database with enum type support
--
-- Business Impact:
--   - Enables select/dropdown column types in log tables
--   - select_simple: Single selection from a list of options
--   - select_multiple: Multiple selections from a list of options
--   - Expands the flexibility of dynamic log table definitions
--
-- PostgreSQL Best Practices Applied:
--   - Use of ALTER TYPE ADD VALUE for enum extension
--   - IF NOT EXISTS for idempotent migration
--   - Comprehensive validation and verification
-- =========================================

-- =========================================
-- STEP 1: Validate Prerequisites
-- =========================================
-- Ensure the column_log_type ENUM exists before attempting to modify it

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type
        WHERE typname = 'column_log_type'
        AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND typtype = 'e'
    ) THEN
        RAISE EXCEPTION 'Prerequisites not met: column_log_type ENUM does not exist. Run V50 first.';
    END IF;
END $$;

-- =========================================
-- STEP 2: Add New ENUM Values
-- =========================================
-- Add select_simple and select_multiple values to the enum
-- Note: ALTER TYPE ADD VALUE cannot run inside a transaction block in older PostgreSQL
-- but Flyway handles this correctly

-- Add 'select_simple' value if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = 'public.column_log_type'::regtype
        AND enumlabel = 'select_simple'
    ) THEN
        ALTER TYPE public.column_log_type ADD VALUE 'select_simple';
        RAISE NOTICE 'Added select_simple to column_log_type enum';
    ELSE
        RAISE NOTICE 'select_simple already exists in column_log_type enum, skipping';
    END IF;
END $$;

-- Add 'select_multiple' value if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = 'public.column_log_type'::regtype
        AND enumlabel = 'select_multiple'
    ) THEN
        ALTER TYPE public.column_log_type ADD VALUE 'select_multiple';
        RAISE NOTICE 'Added select_multiple to column_log_type enum';
    ELSE
        RAISE NOTICE 'select_multiple already exists in column_log_type enum, skipping';
    END IF;
END $$;

-- =========================================
-- STEP 3: Update Documentation
-- =========================================
-- Update the comment to reflect the new enum values

COMMENT ON TYPE public.column_log_type IS
'ENUM type defining the allowed data types for columns in log tables.
Valid values:
  - text: String/text data (VARCHAR, TEXT, etc.)
  - number: Numeric data (INTEGER, DECIMAL, FLOAT, etc.)
  - boolean: Boolean true/false values
  - select_simple: Single selection from a predefined list of options
  - select_multiple: Multiple selections from a predefined list of options

This type ensures type safety and validation when defining column metadata
for dynamic log table structures.';

-- =========================================
-- STEP 4: Validation and Verification
-- =========================================
-- Verify the new enum values were added successfully

DO $$
DECLARE
    enum_values TEXT[];
    expected_values TEXT[] := ARRAY['text', 'number', 'boolean', 'select_simple', 'select_multiple'];
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

-- Verify specific new values exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = 'public.column_log_type'::regtype
        AND enumlabel = 'select_simple'
    ) AND EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = 'public.column_log_type'::regtype
        AND enumlabel = 'select_multiple'
    ) THEN
        RAISE NOTICE 'Success: Both select_simple and select_multiple values verified';
    ELSE
        RAISE WARNING 'Verification failed: One or both new enum values not found';
    END IF;
END $$;

-- =========================================
-- MIGRATION SUMMARY
-- =========================================
-- This migration extends the column_log_type ENUM with select types:
--
-- 1. NEW VALUES ADDED:
--    - select_simple: For single-choice dropdown/select fields
--    - select_multiple: For multi-choice checkbox/select fields
--
-- 2. UPDATED ENUM VALUES:
--    Original: ['text', 'number', 'boolean']
--    Updated:  ['text', 'number', 'boolean', 'select_simple', 'select_multiple']
--
-- 3. USE CASES:
--    - Log columns that require selection from predefined options
--    - Dynamic form generation with dropdown/checkbox fields
--    - Survey or questionnaire type log entries
--
-- 4. EXAMPLE USAGE:
--    INSERT INTO log_columns (column_name, column_type, is_required)
--    VALUES ('priority', 'select_simple', TRUE),
--           ('tags', 'select_multiple', FALSE);
--
-- 5. PRISMA SCHEMA UPDATE REQUIRED:
--    enum columnLogType {
--      text
--      number
--      boolean
--      select_simple    @map("select_simple")
--      select_multiple  @map("select_multiple")
--      @@map("column_log_type")
--    }
--
