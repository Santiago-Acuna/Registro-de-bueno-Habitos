-- =========================================
-- V37: Make action_types.last_action_date nullable with NULL default
-- =========================================
-- Description: Updates the last_action_date column in action_types table to:
--              1. Remove the NOT NULL constraint to allow NULL values
--              2. Set NULL as the default value for new records
--              3. Preserve all existing non-NULL data unchanged
--
-- Migration Strategy: This migration is designed to be safe for production:
--                     - Removes the NOT NULL constraint to allow optional dates
--                     - Changes default from CURRENT_DATE to NULL
--                     - All existing non-NULL values remain unchanged
--                     - New records will have NULL by default unless explicitly set
--
-- Business Rationale: Allows action types to be created without an initial action date,
--                     making the column truly optional until the first action occurs.
--
-- Rollback Strategy: To rollback this change:
--                     1. UPDATE action_types SET last_action_date = CURRENT_DATE WHERE last_action_date IS NULL;
--                     2. ALTER TABLE action_types ALTER COLUMN last_action_date SET DEFAULT CURRENT_DATE;
--                     3. ALTER TABLE action_types ALTER COLUMN last_action_date SET NOT NULL;
-- =========================================

-- Step 1: Remove the NOT NULL constraint
-- This allows the column to accept NULL values
ALTER TABLE public.action_types
ALTER COLUMN last_action_date DROP NOT NULL;

-- Step 2: Change the default value to NULL
-- New records will have NULL unless explicitly specified
ALTER TABLE public.action_types
ALTER COLUMN last_action_date SET DEFAULT NULL;

-- Step 3: Update the column comment to reflect the new behavior
COMMENT ON COLUMN public.action_types.last_action_date IS
'Date of the last action for this action type (nullable, defaults to NULL until first action occurs)';
