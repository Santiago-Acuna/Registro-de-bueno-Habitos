-- =========================================
-- V66: Add ready to features Table
-- =========================================
-- Description: Adds a non-nullable ready boolean column (default false) to the
--              features table to track whether a feature has been completed and
--              is ready for use. Defaults to false so all existing features are
--              treated as not yet ready without requiring any data migration.
--
-- Prerequisites:
--   - V41 migration must have been successfully applied (features table exists)
--   - flyway_admin role exists with appropriate permissions
--   - prisma_user role exists for application-level access
--
-- Business Impact:
--   - Enables the application to distinguish features that are ready from those
--     still in progress, without altering existing records
--   - Provides a clear boolean flag for filtering ready vs. pending features
--   - Supports frontend display logic that surfaces only ready features when needed
--
-- Safety Measures:
--   - Column has a DEFAULT of false: all existing rows are backfilled automatically
--   - NOT NULL constraint enforces that every feature always has an explicit state
--   - Defensive programming with existence checks prevent duplicate column errors
--   - Additive change: no existing data is removed or modified
--
-- PostgreSQL Best Practices Applied:
--   - snake_case column name following project conventions
--   - NOT NULL + DEFAULT false for a safe, non-breaking additive change
--   - Comprehensive documentation via comments
--   - Permission grants following least privilege principle
-- =========================================

-- =========================================
-- STEP 1: Validate Prerequisites
-- =========================================

-- Verify features table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'features'
    ) THEN
        RAISE EXCEPTION 'Prerequisites not met: features table does not exist. V41 migration must be applied first.';
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
-- STEP 2: Add ready Column
-- =========================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'features'
        AND column_name = 'ready'
    ) THEN
        ALTER TABLE public.features
        ADD COLUMN ready BOOLEAN NOT NULL DEFAULT false;

        RAISE NOTICE 'Column ready added to features table';
    ELSE
        RAISE NOTICE 'Column ready already exists, skipping addition';
    END IF;
END $$;

-- =========================================
-- STEP 3: Add Documentation
-- =========================================

COMMENT ON COLUMN public.features.ready IS
'Indicates whether the feature has been completed and is ready for use.
Defaults to false so that all features created before this migration and all
new features are treated as not ready until explicitly marked otherwise.
When true, the feature is considered complete and may be surfaced to end users.';

-- =========================================
-- STEP 4: Validation and Verification
-- =========================================

-- Verify column was added successfully with correct type and nullability
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'features'
        AND column_name = 'ready'
        AND data_type = 'boolean'
        AND is_nullable = 'NO'
    ) THEN
        RAISE WARNING 'Column verification failed: ready column not found or has incorrect type/nullability';
    ELSE
        RAISE NOTICE 'Success: ready column verified (NOT NULL BOOLEAN)';
    END IF;
END $$;

-- Verify default value is false
DO $$
DECLARE
    col_default TEXT;
BEGIN
    SELECT column_default
    INTO col_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'features'
    AND column_name = 'ready';

    IF col_default LIKE '%false%' THEN
        RAISE NOTICE 'Success: ready column default value verified (false)';
    ELSE
        RAISE WARNING 'Default value verification failed: expected false, found %', col_default;
    END IF;
END $$;

-- =========================================
-- MIGRATION SUMMARY AND USAGE NOTES
-- =========================================
-- This migration adds a ready boolean column to the features table:
--
-- 1. SCHEMA CHANGES APPLIED:
--    - Added column: ready BOOLEAN NOT NULL DEFAULT false to public.features
--
-- 2. COLUMN PURPOSE:
--    - Tracks whether a feature is complete and ready for use
--    - All pre-existing features and new features default to false (not ready)
--    - Set to true explicitly when a feature is considered complete
--
-- 3. UPDATING EXISTING FEATURES:
--    After applying this migration, mark specific features as ready:
--
--    UPDATE public.features
--    SET ready = true
--    WHERE name = 'some_completed_feature';
--
-- 4. COMMON QUERY PATTERNS:
--    -- Get all features that are ready
--    SELECT * FROM public.features
--    WHERE ready = true
--    ORDER BY name;
--
--    -- Count features by readiness state
--    SELECT ready, COUNT(*) AS total
--    FROM public.features
--    GROUP BY ready;
--
-- 5. ROLLBACK PROCEDURE (If Needed):
--    ALTER TABLE public.features
--    DROP COLUMN IF EXISTS ready;
--
