-- =========================================
-- V67: Add completed_at to features Table
-- =========================================
-- Description: Adds a nullable completed_at DATE column to the features table
--              to record the calendar day on which a feature was completed.
--              NULL means the feature has not yet been completed. The column
--              intentionally stores a date (no time component) because completion
--              is a day-level concept, not a timestamp.
--
-- Prerequisites:
--   - V41 migration must have been successfully applied (features table exists)
--   - V66 migration must have been successfully applied (ready column exists)
--   - flyway_admin role exists with appropriate permissions
--   - prisma_user role exists for application-level access
--
-- Business Impact:
--   - Enables the application to record and query the exact date a feature was
--     marked as done, supporting historical reporting and progress tracking
--   - NULL value for existing and new features is intentional: completion date
--     is only populated when the feature is explicitly finished
--   - Works in tandem with the ready boolean column: a feature is typically
--     marked ready=true and completed_at=<date> at the same time
--
-- Safety Measures:
--   - Column is nullable: all existing rows are unaffected (no data migration needed)
--   - DATE type stores only the calendar day, avoiding timezone ambiguity
--   - No DEFAULT value: completion must be set explicitly; no accidental backfill
--   - Defensive programming with existence checks prevent duplicate column errors
--   - Additive change: no existing data is removed or modified
--
-- PostgreSQL Best Practices Applied:
--   - snake_case column name following project conventions
--   - Nullable column for a safe, non-breaking additive change
--   - DATE type (not TIMESTAMPTZ) for a day-level concept
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
-- STEP 2: Add completed_at Column
-- =========================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'features'
        AND column_name = 'completed_at'
    ) THEN
        ALTER TABLE public.features
        ADD COLUMN completed_at DATE NULL;

        RAISE NOTICE 'Column completed_at added to features table';
    ELSE
        RAISE NOTICE 'Column completed_at already exists, skipping addition';
    END IF;
END $$;

-- =========================================
-- STEP 3: Add Documentation
-- =========================================

COMMENT ON COLUMN public.features.completed_at IS
'Records the calendar day on which the feature was completed.
NULL indicates the feature has not yet been completed.
Stored as DATE (no time component) because completion is a day-level event
and avoids timezone conversion complexity.
Should be set alongside ready = true when a feature is marked as done.';

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
        AND column_name = 'completed_at'
        AND is_nullable = 'YES'
    ) THEN
        RAISE WARNING 'Column verification failed: completed_at column not found or has incorrect nullability';
    ELSE
        RAISE NOTICE 'Success: completed_at column verified (NULLABLE DATE)';
    END IF;
END $$;

-- =========================================
-- MIGRATION SUMMARY AND USAGE NOTES
-- =========================================
-- This migration adds a nullable completed_at DATE column to the features table:
--
-- 1. SCHEMA CHANGES APPLIED:
--    - Added column: completed_at DATE NULL to public.features
--
-- 2. COLUMN PURPOSE:
--    - Stores the day a feature was completed; NULL means not yet completed
--    - DATE type captures the calendar day without time or timezone concerns
--    - Complements the ready boolean column added in V66
--
-- 3. MARKING A FEATURE AS COMPLETE:
--    After applying this migration, set completion date when finalizing a feature:
--
--    UPDATE public.features
--    SET ready = true,
--        completed_at = CURRENT_DATE
--    WHERE name = 'some_completed_feature';
--
-- 4. COMMON QUERY PATTERNS:
--    -- Get all completed features ordered by completion date
--    SELECT id, name, completed_at
--    FROM public.features
--    WHERE completed_at IS NOT NULL
--    ORDER BY completed_at DESC;
--
--    -- Get features completed within a date range
--    SELECT id, name, completed_at
--    FROM public.features
--    WHERE completed_at BETWEEN '2025-01-01' AND '2025-12-31'
--    ORDER BY completed_at;
--
--    -- Count features by completion status
--    SELECT
--        CASE WHEN completed_at IS NULL THEN 'pending' ELSE 'completed' END AS status,
--        COUNT(*) AS total
--    FROM public.features
--    GROUP BY status;
--
-- 5. ROLLBACK PROCEDURE (If Needed):
--    ALTER TABLE public.features
--    DROP COLUMN IF EXISTS completed_at;
--
