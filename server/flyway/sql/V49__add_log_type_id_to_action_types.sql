-- =========================================
-- V49: Add Optional One-to-One Relationship Between action_types and log_types
-- =========================================
-- Description: Adds an optional foreign key relationship from action_types to log_types table.
--              This creates a one-to-one optional relationship where an action type can
--              optionally be associated with a specific log type.
--
-- Prerequisites:
--   - V48 migration must have been successfully applied (log_types table exists)
--   - action_types table exists
--   - log_types table exists
--
-- Business Impact:
--   - Enables action types to be associated with specific log types
--   - Relationship is optional (nullable) - action types can exist without a log type
--   - One-to-one relationship enforced via unique constraint
--   - Provides flexibility for categorizing actions by their logging behavior
--
-- Safety Measures:
--   - Nullable foreign key (optional relationship)
--   - ON UPDATE CASCADE ensures referential integrity during log_type updates
--   - ON DELETE SET NULL allows log_types to be deleted without breaking action_types
--   - Index created for query performance
--   - Defensive programming with existence checks
--
-- PostgreSQL Best Practices Applied:
--   - Proper foreign key constraint naming convention
--   - Index for foreign key column performance
--   - Unique constraint to enforce one-to-one relationship
--   - CASCADE and SET NULL policies for referential integrity
--   - Column comments for documentation
-- =========================================

-- =========================================
-- STEP 1: Validate Prerequisites
-- =========================================
-- Ensure required tables exist before proceeding

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

-- =========================================
-- STEP 2: Add log_type_id Column to action_types Table
-- =========================================
-- Add nullable UUID column to store the optional foreign key reference

-- Add log_type_id column (nullable for optional relationship)
ALTER TABLE public.action_types
ADD COLUMN IF NOT EXISTS log_type_id UUID DEFAULT NULL;

-- Add column comment for documentation
COMMENT ON COLUMN public.action_types.log_type_id IS
'Optional foreign key to log_types table. Defines which type of logging is associated with this action type. NULL indicates no specific log type association.';

-- =========================================
-- STEP 3: Create Foreign Key Constraint
-- =========================================
-- Establish referential integrity between action_types and log_types

-- Add foreign key constraint with CASCADE and SET NULL policies
ALTER TABLE public.action_types
ADD CONSTRAINT fk_action_types_log_type_id
FOREIGN KEY (log_type_id)
REFERENCES public.log_types(id)
ON UPDATE CASCADE
ON DELETE SET NULL;

-- =========================================
-- STEP 4: Create Unique Constraint for One-to-One Relationship
-- =========================================
-- Ensure each log_type can only be associated with one action_type

-- Add unique constraint to enforce one-to-one relationship
-- Note: Only non-NULL values are considered for uniqueness
-- Multiple action_types can have NULL log_type_id (no log type)
ALTER TABLE public.action_types
ADD CONSTRAINT action_types_log_type_id_unique
UNIQUE (log_type_id);

-- =========================================
-- STEP 5: Create Index for Performance
-- =========================================
-- Add index on foreign key column for efficient lookups and joins

-- Create index on log_type_id for query performance
-- Partial index excludes NULL values since they won't be used in lookups
CREATE INDEX IF NOT EXISTS idx_action_types_log_type_id
ON public.action_types USING btree (log_type_id)
WHERE log_type_id IS NOT NULL;

-- =========================================
-- STEP 6: Grant Permissions
-- =========================================
-- Ensure prisma_user has appropriate permissions (already granted at table level)

-- No additional grants needed - column-level permissions inherit from table

-- =========================================
-- STEP 7: Validation and Verification
-- =========================================
-- Verify the migration completed successfully

-- Verify column was added successfully
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
        RAISE WARNING 'Column creation verification failed: log_type_id column not found or has incorrect type/nullability';
    ELSE
        RAISE NOTICE 'Success: log_type_id column added to action_types table';
    END IF;
END $$;

-- Verify foreign key constraint was created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'action_types'
        AND constraint_name = 'fk_action_types_log_type_id'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        RAISE WARNING 'Foreign key constraint verification failed: fk_action_types_log_type_id not found';
    ELSE
        RAISE NOTICE 'Success: Foreign key constraint fk_action_types_log_type_id created';
    END IF;
END $$;

-- Verify unique constraint was created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'action_types'
        AND constraint_name = 'action_types_log_type_id_unique'
        AND constraint_type = 'UNIQUE'
    ) THEN
        RAISE WARNING 'Unique constraint verification failed: action_types_log_type_id_unique not found';
    ELSE
        RAISE NOTICE 'Success: Unique constraint action_types_log_type_id_unique created';
    END IF;
END $$;

-- Verify index was created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'action_types'
        AND indexname = 'idx_action_types_log_type_id'
    ) THEN
        RAISE WARNING 'Index verification failed: idx_action_types_log_type_id not found';
    ELSE
        RAISE NOTICE 'Success: Index idx_action_types_log_type_id created';
    END IF;
END $$;

-- =========================================
-- MIGRATION SUMMARY AND USAGE NOTES
-- =========================================
-- This migration adds an optional one-to-one relationship:
--
-- 1. SCHEMA CHANGES APPLIED:
--    - Added 'log_type_id' column to action_types table (UUID, nullable)
--    - Created foreign key constraint: fk_action_types_log_type_id
--    - Created unique constraint: action_types_log_type_id_unique (one-to-one)
--    - Created partial index: idx_action_types_log_type_id
--    - Added column documentation comment
--
-- 2. RELATIONSHIP CHARACTERISTICS:
--    - Direction: action_types -> log_types (action_types owns the foreign key)
--    - Cardinality: One-to-One (enforced by unique constraint)
--    - Optionality: Optional (nullable foreign key)
--    - Referential Actions:
--      * ON UPDATE CASCADE: Updates propagate from log_types to action_types
--      * ON DELETE SET NULL: Deleting a log_type sets action_types.log_type_id to NULL
--
-- 3. DATA ACCESS PATTERNS:
--    - Get action type with associated log type:
--      SELECT at.*, lt.name as log_type_name
--      FROM action_types at
--      LEFT JOIN log_types lt ON at.log_type_id = lt.id
--      WHERE at.id = ?
--
--    - Find all action types for a specific log type:
--      SELECT at.*
--      FROM action_types at
--      WHERE at.log_type_id = ?
--
--    - Find action types without a log type:
--      SELECT at.*
--      FROM action_types at
--      WHERE at.log_type_id IS NULL
--
--    - Associate an action type with a log type:
--      UPDATE action_types
--      SET log_type_id = ?
--      WHERE id = ?
--
--    - Remove log type association:
--      UPDATE action_types
--      SET log_type_id = NULL
--      WHERE id = ?
--
-- 4. CONSTRAINTS AND VALIDATION:
--    - log_type_id must reference a valid log_types.id if not NULL
--    - Each log_type can be associated with at most ONE action_type (one-to-one)
--    - Multiple action_types can have log_type_id = NULL (no association)
--    - Updates to log_types.id automatically cascade to action_types.log_type_id
--    - Deleting a log_type sets associated action_types.log_type_id to NULL
--
-- 5. PERFORMANCE CONSIDERATIONS:
--    - Partial index on log_type_id (WHERE NOT NULL) optimizes JOIN queries
--    - Index supports fast lookups of action_types by log_type_id
--    - Unique constraint provides additional query optimization opportunities
--    - Minimal overhead since most queries will use the index
--
-- 6. BUSINESS LOGIC IMPLICATIONS:
--    - Action types can exist independently without a log type
--    - Each log type can have zero or one associated action type
--    - Deleting a log type does not cascade to action types (SET NULL policy)
--    - Application layer can enforce additional business rules if needed
--
-- 7. ROLLBACK PROCEDURE (If Needed):
--    -- Drop foreign key constraint, unique constraint, and column
--    ALTER TABLE public.action_types DROP CONSTRAINT IF EXISTS fk_action_types_log_type_id;
--    ALTER TABLE public.action_types DROP CONSTRAINT IF EXISTS action_types_log_type_id_unique;
--    DROP INDEX IF EXISTS public.idx_action_types_log_type_id;
--    ALTER TABLE public.action_types DROP COLUMN IF EXISTS log_type_id;
--
-- 8. MAINTENANCE NOTES:
--    - Monitor query performance on JOIN operations
--    - Consider application-level caching for frequently accessed log type associations
--    - Ensure application handles NULL log_type_id appropriately
--    - Regular ANALYZE on action_types table maintains index statistics
--    - Validate that one-to-one constraint aligns with business requirements
