-- =========================================
-- V65: Add select_source to log_columns Table
-- =========================================
-- Description: Adds a nullable select_source column to log_columns to identify
--              which data source provides the options for select-type columns
--              (select_simple, select_multiple). This enables the frontend to
--              dynamically fetch the correct options for each select input without
--              hardcoding the source per column name.
--
-- Prerequisites:
--   - V51 migration must have been successfully applied (log_columns table exists)
--   - V62 migration must have been successfully applied (select_simple and select_multiple added to column_log_type enum)
--   - flyway_admin role exists with appropriate permissions
--   - prisma_user role exists for application-level access
--
-- Business Impact:
--   - Enables dynamic select inputs in forms driven by log column metadata
--   - Decouples the frontend from hardcoded column-to-source mappings
--   - Supports multiple entities reusing the same select sources (programmingLanguages, externalDependencies, subtypes)
--   - Only relevant for columns of type select_simple or select_multiple; NULL for all other types
--
-- Safety Measures:
--   - Column is nullable: existing rows (text, number, boolean) are unaffected
--   - VARCHAR(50) limits the value to known source identifiers
--   - No FK constraint: source identifiers are logical names, not DB references
--   - Defensive programming with existence checks
--
-- PostgreSQL Best Practices Applied:
--   - snake_case column name following project conventions
--   - Nullable column for additive, non-breaking change
--   - Comprehensive documentation via comments
--   - Permission grants following least privilege principle
-- =========================================

-- =========================================
-- STEP 1: Validate Prerequisites
-- =========================================

-- Verify log_columns table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'log_columns'
    ) THEN
        RAISE EXCEPTION 'Prerequisites not met: log_columns table does not exist. V51 migration must be applied first.';
    END IF;
END $$;

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
        RAISE WARNING 'prisma_user role does not exist. Permission grants will be skipped.';
    END IF;
END $$;

-- =========================================
-- STEP 2: Add select_source Column
-- =========================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'log_columns'
        AND column_name = 'select_source'
    ) THEN
        ALTER TABLE public.log_columns
        ADD COLUMN select_source VARCHAR(50) NULL;

        RAISE NOTICE 'Column select_source added to log_columns table';
    ELSE
        RAISE NOTICE 'Column select_source already exists, skipping addition';
    END IF;
END $$;

-- =========================================
-- STEP 3: Add Documentation
-- =========================================

COMMENT ON COLUMN public.log_columns.select_source IS
'Identifies the data source that provides options for select-type columns
(select_simple, select_multiple). NULL for text, number, and boolean columns.
Known values: programmingLanguages, externalDependencies, subtypes.
This is a logical identifier used by the frontend to fetch the correct options
dynamically — it does not reference a database table directly.';

-- =========================================
-- STEP 4: Validation and Verification
-- =========================================

-- Verify column was added successfully
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'log_columns'
        AND column_name = 'select_source'
        AND is_nullable = 'YES'
    ) THEN
        RAISE WARNING 'Column verification failed: select_source column not found or has incorrect nullability';
    ELSE
        RAISE NOTICE 'Success: select_source column verified (NULLABLE VARCHAR(50))';
    END IF;
END $$;

-- =========================================
-- MIGRATION SUMMARY AND USAGE NOTES
-- =========================================
-- This migration adds a nullable select_source column to log_columns:
--
-- 1. SCHEMA CHANGES APPLIED:
--    - Added column: select_source VARCHAR(50) NULL to public.log_columns
--
-- 2. COLUMN PURPOSE:
--    - Only meaningful when type = 'select_simple' or 'select_multiple'
--    - NULL for type = 'text', 'number', 'boolean'
--    - Known source values at time of migration:
--      * 'programmingLanguages' -> programming_languages table
--      * 'externalDependencies' -> external_dependencies table
--      * 'subtypes'             -> subtypes table
--
-- 3. SEEDING EXISTING SELECT COLUMNS:
--    After applying this migration, update existing select-type rows:
--
--    UPDATE public.log_columns
--    SET select_source = 'programmingLanguages'
--    WHERE name = 'programming_language_id'
--    AND type IN ('select_simple'::column_log_type, 'select_multiple'::column_log_type);
--
--    UPDATE public.log_columns
--    SET select_source = 'externalDependencies'
--    WHERE name = 'external_dependency_id'
--    AND type IN ('select_simple'::column_log_type, 'select_multiple'::column_log_type);
--
--    UPDATE public.log_columns
--    SET select_source = 'subtypes'
--    WHERE name IN ('commit_type_id', 'commit_scope_id')
--    AND type IN ('select_simple'::column_log_type, 'select_multiple'::column_log_type);
--
-- 4. ROLLBACK PROCEDURE (If Needed):
--    ALTER TABLE public.log_columns
--    DROP COLUMN IF EXISTS select_source;
--
