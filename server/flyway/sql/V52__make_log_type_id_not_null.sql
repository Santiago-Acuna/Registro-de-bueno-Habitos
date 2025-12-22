-- =========================================
-- V52: Make log_type_id Column NOT NULL in action_types Table
-- =========================================
-- Description: Converts the log_type_id column from nullable to NOT NULL.
--              This migration enforces that every action type must be associated with
--              a specific log type, making the relationship mandatory.
--              The one-to-one relationship (unique constraint) is preserved.
--
-- Prerequisites:
--   - V48 migration must have been successfully applied (log_types table exists)
--   - V49 migration must have been successfully applied (log_type_id column exists)
--   - action_types table exists with log_type_id column (nullable)
--   - Foreign key constraint fk_action_types_log_type_id exists
--   - Unique constraint action_types_log_type_id_unique exists
--   - ALL log_type_id values must already be NOT NULL (no NULL values allowed)
--
-- Business Impact:
--   - Changes log_type relationship from optional to mandatory
--   - Ensures all action types have a defined logging mechanism
--   - Prevents creation of action types without log type association
--   - MAINTAINS the one-to-one relationship between action_types and log_types
--
-- Safety Measures:
--   - Prerequisite validation ensures required objects exist
--   - Verification that NO NULL values exist (fails migration if found)
--   - Transaction-safe operations
--   - Verification steps confirm successful migration
--   - Foreign key and unique constraints preserved
-- =========================================

-- =========================================
-- STEP 1: Validate Prerequisites
-- =========================================

-- Verify log_types table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'log_types'
    ) THEN
        RAISE EXCEPTION 'Prerequisites not met: log_types table does not exist. V48 migration must be applied first.';
    END IF;
END $$;

-- Verify action_types table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'action_types'
    ) THEN
        RAISE EXCEPTION 'Prerequisites not met: action_types table does not exist.';
    END IF;
END $$;

-- Verify log_type_id column exists and is currently nullable
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'action_types'
        AND column_name = 'log_type_id'
        AND is_nullable = 'YES'
        AND udt_name = 'uuid'
    ) THEN
        RAISE EXCEPTION 'Prerequisites not met: log_type_id column does not exist, is not nullable, or has incorrect type. V49 migration must be applied first.';
    END IF;
END $$;

-- Verify foreign key constraint exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'action_types'
        AND constraint_name = 'fk_action_types_log_type_id'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        RAISE EXCEPTION 'Prerequisites not met: Foreign key constraint fk_action_types_log_type_id does not exist.';
    END IF;
END $$;

-- Verify unique constraint exists (one-to-one relationship)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'action_types'
        AND constraint_name = 'action_types_log_type_id_unique'
        AND constraint_type = 'UNIQUE'
    ) THEN
        RAISE EXCEPTION 'Prerequisites not met: Unique constraint action_types_log_type_id_unique does not exist.';
    END IF;
END $$;

-- =========================================
-- STEP 2: Verify No NULL Values Exist
-- =========================================

DO $$
DECLARE
    null_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO null_count
    FROM public.action_types
    WHERE log_type_id IS NULL;

    IF null_count > 0 THEN
        RAISE EXCEPTION 'Migration cannot proceed: % action_types record(s) have NULL log_type_id. All values must be populated before applying NOT NULL constraint.', null_count;
    ELSE
        RAISE NOTICE 'Verification passed: All action_types records have non-NULL log_type_id';
    END IF;
END $$;

-- =========================================
-- STEP 3: Apply NOT NULL Constraint
-- =========================================

ALTER TABLE public.action_types
ALTER COLUMN log_type_id SET NOT NULL;

DO $$
BEGIN
    RAISE NOTICE 'NOT NULL constraint successfully applied to action_types.log_type_id column';
END $$;

-- =========================================
-- STEP 4: Verify Migration Success
-- =========================================

-- Verify column is now NOT NULL
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'action_types'
        AND column_name = 'log_type_id'
        AND is_nullable = 'NO'
        AND udt_name = 'uuid'
    ) THEN
        RAISE NOTICE 'Success: log_type_id column is now NOT NULL';
    ELSE
        RAISE EXCEPTION 'Verification failed: log_type_id is still nullable or has incorrect type';
    END IF;
END $$;

-- Verify foreign key constraint still exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'action_types'
        AND constraint_name = 'fk_action_types_log_type_id'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        RAISE NOTICE 'Success: Foreign key constraint fk_action_types_log_type_id maintained';
    ELSE
        RAISE EXCEPTION 'Verification failed: Foreign key constraint fk_action_types_log_type_id not found';
    END IF;
END $$;

-- Verify unique constraint still exists (one-to-one relationship preserved)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'action_types'
        AND constraint_name = 'action_types_log_type_id_unique'
        AND constraint_type = 'UNIQUE'
    ) THEN
        RAISE NOTICE 'Success: Unique constraint action_types_log_type_id_unique maintained (one-to-one relationship preserved)';
    ELSE
        RAISE EXCEPTION 'Verification failed: Unique constraint action_types_log_type_id_unique not found';
    END IF;
END $$;

-- =========================================
-- STEP 5: Update Column Comment
-- =========================================

COMMENT ON COLUMN public.action_types.log_type_id IS
'REQUIRED foreign key to log_types table. Defines which type of logging is associated with this action type. Every action type must have a log type association. One-to-one relationship - each log_type can only be used by one action_type. Made mandatory in V52 migration.';

DO $$
BEGIN
    RAISE NOTICE 'Column comment updated successfully';
END $$;

-- =========================================
-- MIGRATION SUMMARY
-- =========================================
-- This migration converts log_type_id from optional to required:
--
-- 1. SCHEMA CHANGES APPLIED:
--    - action_types.log_type_id: Changed from NULL to NOT NULL
--    - Maintained foreign key constraint: fk_action_types_log_type_id
--    - Maintained unique constraint: action_types_log_type_id_unique
--    - Updated column documentation to reflect mandatory relationship
--
-- 2. RELATIONSHIP:
--    BEFORE: action_types -> log_types (optional, one-to-one)
--    AFTER: action_types -> log_types (required, one-to-one)
--
-- 3. CONSTRAINTS MAINTAINED:
--    - Foreign key constraint: fk_action_types_log_type_id
--    - Unique constraint: action_types_log_type_id_unique (one-to-one)
--    - NOT NULL constraint: Added to log_type_id column
--
-- 4. APPLICATION IMPACT:
--    - INSERT statements for action_types MUST include log_type_id
--    - UPDATE statements cannot set log_type_id to NULL
--    - Each log_type can only be associated with one action_type (one-to-one)
--    - ORM models should mark log_type_id as required (not optional)
--
-- 5. RECOMMENDED PRISMA SCHEMA UPDATE:
--    model actionTypes {
--      // Change from:
--      logTypeId String? @map("log_type_id") @db.Uuid
--      logTypes  logTypes? @relation(...)
--
--      // To:
--      logTypeId String @map("log_type_id") @db.Uuid
--      logTypes  logTypes @relation(...)
--    }
--
-- 6. ROLLBACK PROCEDURE (If Needed):
--    ALTER TABLE public.action_types
--    ALTER COLUMN log_type_id DROP NOT NULL;
--
--    COMMENT ON COLUMN public.action_types.log_type_id IS
--    'Optional foreign key to log_types table. Defines which type of logging is associated with this action type. NULL indicates no specific log type association.';
--
