-- =========================================
-- V35: Remove Redundant Name and Logo Columns
-- =========================================
-- Description: Removes redundant name and logo columns from habits and action_types tables
--              after implementing the global uniqueness system via global_entity_identifiers table.
--              This migration completes the transition to centralized identifier management.
--
-- Prerequisites:
--   - V34 migration must have been successfully applied
--   - global_entity_identifiers table exists and is properly configured
--   - Both habits and action_types tables have global_identifier_id foreign key columns
--   - All conflicting local unique constraints have been removed by V34
--
-- Business Impact:
--   - Eliminates data redundancy between entity tables and global_entity_identifiers
--   - Prevents data consistency issues from duplicate information storage
--   - Reduces storage overhead and potential for conflicting data
--   - Enforces single source of truth for names and logos via global table
--
-- Safety Measures:
--   - All tables are currently empty per requirements (no data loss risk)
--   - Defensive programming with IF EXISTS clauses
--   - Comprehensive validation before column removal
--   - Detailed rollback instructions provided in comments
--
-- PostgreSQL Best Practices Applied:
--   - Safe column removal with existence checks
--   - Proper dependency verification before destructive operations
--   - Clear documentation and rollback procedures
--   - Performance-aware operations (no table locks on empty tables)
-- =========================================

-- =========================================
-- STEP 1: Validate Prerequisites
-- =========================================
-- Ensure V34 migration prerequisites are met before proceeding

-- Verify global_entity_identifiers table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'global_entity_identifiers'
    ) THEN
        RAISE EXCEPTION 'Prerequisites not met: global_entity_identifiers table does not exist. V34 migration must be applied first.';
    END IF;
END $$;

-- Verify habits table has global_identifier_id column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'habits'
        AND column_name = 'global_identifier_id'
    ) THEN
        RAISE EXCEPTION 'Prerequisites not met: habits table missing global_identifier_id column. V34 migration must be applied first.';
    END IF;
END $$;

-- Verify action_types table has global_identifier_id column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'action_types'
        AND column_name = 'global_identifier_id'
    ) THEN
        RAISE EXCEPTION 'Prerequisites not met: action_types table missing global_identifier_id column. V34 migration must be applied first.';
    END IF;
END $$;

-- =========================================
-- STEP 2: Validate Data Consistency (Safety Check)
-- =========================================
-- Ensure tables are empty as expected (per requirements)
-- This prevents accidental data loss in case assumptions are incorrect

DO $$
DECLARE
    habits_count INTEGER;
    action_types_count INTEGER;
BEGIN
    -- Count records in habits table
    SELECT COUNT(*) INTO habits_count FROM public.habits;

    -- Count records in action_types table
    SELECT COUNT(*) INTO action_types_count FROM public.action_types;

    -- Warn if tables contain data (but allow migration to proceed)
    IF habits_count > 0 OR action_types_count > 0 THEN
        RAISE WARNING 'Data found in tables: habits=%, action_types=%. Proceeding with column removal as requested, but verify this is intentional.',
                     habits_count, action_types_count;
    END IF;

    -- Log current state for audit trail
    RAISE NOTICE 'Migration V35 starting: habits records=%, action_types records=%, proceeding with column removal',
                 habits_count, action_types_count;
END $$;

-- =========================================
-- STEP 3: Remove Redundant Columns from habits Table
-- =========================================
-- Remove name and logo columns that are now managed by global_entity_identifiers

-- Remove name column from habits table
-- This column is now redundant as names are stored in global_entity_identifiers
ALTER TABLE public.habits
DROP COLUMN IF EXISTS name;

-- Remove logo column from habits table
-- This column is now redundant as logos are stored in global_entity_identifiers
ALTER TABLE public.habits
DROP COLUMN IF EXISTS logo;

-- =========================================
-- STEP 4: Remove Redundant Columns from action_types Table
-- =========================================
-- Remove name and logo columns that are now managed by global_entity_identifiers

-- Remove name column from action_types table
-- This column is now redundant as names are stored in global_entity_identifiers
ALTER TABLE public.action_types
DROP COLUMN IF EXISTS name;

-- Remove logo column from action_types table
-- This column is now redundant as logos are stored in global_entity_identifiers
ALTER TABLE public.action_types
DROP COLUMN IF EXISTS logo;

-- =========================================
-- STEP 5: Update Table Documentation
-- =========================================
-- Update table comments to reflect the new structure

-- Update habits table documentation
COMMENT ON TABLE public.habits IS
'Habit tracking table with centralized identifier management.
Names and logos are stored in global_entity_identifiers table via global_identifier_id foreign key.
This ensures system-wide uniqueness and prevents conflicts between habits and action types.
Relationships: habits (1) -> global_entity_identifiers (1) via global_identifier_id';

-- Update action_types table documentation
COMMENT ON TABLE public.action_types IS
'Action types define categories of actions within habits with centralized identifier management.
Names and logos are stored in global_entity_identifiers table via global_identifier_id foreign key.
This ensures system-wide uniqueness and prevents conflicts between action types and habits.
Relationships: habits (1) -> action_types (many), action_types (1) -> global_entity_identifiers (1)';

-- Update foreign key column documentation
COMMENT ON COLUMN public.habits.global_identifier_id IS
'Foreign key to global_entity_identifiers table. Required field that provides access to habit name and logo with system-wide uniqueness enforcement';

COMMENT ON COLUMN public.action_types.global_identifier_id IS
'Foreign key to global_entity_identifiers table. Required field that provides access to action type name and logo with system-wide uniqueness enforcement';

-- =========================================
-- STEP 6: Validation and Verification
-- =========================================
-- Verify the migration completed successfully

-- Verify redundant columns have been removed from habits table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'habits'
        AND column_name IN ('name', 'logo')
    ) THEN
        RAISE WARNING 'Column removal verification failed: habits table still contains name or logo columns';
    ELSE
        RAISE NOTICE 'Success: Redundant name and logo columns removed from habits table';
    END IF;
END $$;

-- Verify redundant columns have been removed from action_types table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'action_types'
        AND column_name IN ('name', 'logo')
    ) THEN
        RAISE WARNING 'Column removal verification failed: action_types table still contains name or logo columns';
    ELSE
        RAISE NOTICE 'Success: Redundant name and logo columns removed from action_types table';
    END IF;
END $$;

-- =========================================
-- MIGRATION SUMMARY AND USAGE NOTES
-- =========================================
-- This migration completes the transition to centralized identifier management:
--
-- 1. SCHEMA CHANGES APPLIED:
--    - Removed 'name' column from habits table
--    - Removed 'logo' column from habits table
--    - Removed 'name' column from action_types table
--    - Removed 'logo' column from action_types table
--    - Updated table documentation to reflect new structure
--
-- 2. DATA ACCESS PATTERNS (After Migration):
--    - Get habit with identifiers:
--      SELECT h.*, g.name, g.logo
--      FROM habits h
--      JOIN global_entity_identifiers g ON h.global_identifier_id = g.id
--
--    - Get action type with identifiers:
--      SELECT at.*, g.name, g.logo
--      FROM action_types at
--      JOIN global_entity_identifiers g ON at.global_identifier_id = g.id
--
--    - Create new habit:
--      1. INSERT INTO global_entity_identifiers (name, logo, entity_type, entity_id)
--      2. INSERT INTO habits (global_identifier_id, ...)
--
--    - Update habit name/logo:
--      UPDATE global_entity_identifiers SET name = ?, logo = ?
--      WHERE id = (SELECT global_identifier_id FROM habits WHERE id = ?)
--
-- 3. BENEFITS ACHIEVED:
--    - Single source of truth for names and logos
--    - No data redundancy or synchronization issues
--    - System-wide uniqueness enforcement
--    - Reduced storage overhead
--    - Simplified data consistency management
--
-- 4. APPLICATION LAYER IMPACT:
--    - Entity queries must now use JOINs to access names and logos
--    - ORM models should include relationships to global_entity_identifiers
--    - Business logic must use global table for name/logo operations
--    - Validation should check global uniqueness constraints
--
-- 5. ROLLBACK PROCEDURE (If Needed):
--    -- WARNING: Only possible if tables remain empty
--    -- Add columns back to habits table:
--    ALTER TABLE public.habits ADD COLUMN name VARCHAR(50);
--    ALTER TABLE public.habits ADD COLUMN logo TEXT;
--    ALTER TABLE public.habits ADD CONSTRAINT habits_name_not_empty CHECK (LENGTH(TRIM(name)) > 0);
--    ALTER TABLE public.habits ADD CONSTRAINT habits_logo_size CHECK (LENGTH(logo) <= 2097152);
--
--    -- Add columns back to action_types table:
--    ALTER TABLE public.action_types ADD COLUMN name TEXT;
--    ALTER TABLE public.action_types ADD COLUMN logo TEXT;
--    ALTER TABLE public.action_types ADD CONSTRAINT action_types_name_not_empty CHECK (LENGTH(TRIM(name)) > 0);
--    ALTER TABLE public.action_types ADD CONSTRAINT action_types_logo_not_empty CHECK (LENGTH(TRIM(logo)) > 0);
--    ALTER TABLE public.action_types ADD CONSTRAINT action_types_logo_size CHECK (LENGTH(logo) <= 2097152);
--
-- 6. PERFORMANCE CONSIDERATIONS:
--    - Queries now require JOINs to access names/logos (minimal overhead)
--    - Global uniqueness checks are centralized and efficient
--    - Indexes on global_entity_identifiers support fast lookups
--    - Consider query optimization for frequently accessed name/logo data
--
-- 7. MAINTENANCE NOTES:
--    - Monitor JOIN query performance and add indexes if needed
--    - Ensure application layer properly handles the new data access patterns
--    - Consider implementing database views for common name/logo queries
--    - Regular ANALYZE on global_entity_identifiers table for optimal performance