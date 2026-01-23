-- =========================================
-- V58: Make development_logs.features_id nullable
-- =========================================
-- Description: Updates the features_id column in development_logs table to:
--              1. Remove the NOT NULL constraint to allow NULL values
--              2. Set NULL as the default value for new records
--              3. Preserve all existing data unchanged
--
-- Migration Strategy: This migration is designed to be safe for production:
--                     - Removes the NOT NULL constraint to allow optional feature assignment
--                     - Ensures default remains NULL
--                     - All existing non-NULL values remain unchanged
--                     - New records will have NULL by default unless explicitly set
--
-- Business Rationale: Allows development logs to be created without an associated feature,
--                     making the column truly optional for commits that don't belong to
--                     a specific feature (e.g., infrastructure, refactoring, or general improvements).
--
-- Rollback Strategy: To rollback this change:
--                     1. UPDATE development_logs SET features_id = <default_feature_uuid> WHERE features_id IS NULL;
--                     2. ALTER TABLE development_logs ALTER COLUMN features_id SET NOT NULL;
-- =========================================

-- Step 1: Remove the NOT NULL constraint (if exists)
-- This allows the column to accept NULL values
ALTER TABLE public.development_logs
ALTER COLUMN features_id DROP NOT NULL;

-- Step 2: Ensure the default value is NULL (should already be set, but ensuring consistency)
-- New records will have NULL unless explicitly specified
ALTER TABLE public.development_logs
ALTER COLUMN features_id SET DEFAULT NULL;

-- Step 3: Update the column comment to reflect the new behavior
COMMENT ON COLUMN public.development_logs.features_id IS
'Foreign key to features table (nullable, defaults to NULL for commits not associated with a specific feature)';
