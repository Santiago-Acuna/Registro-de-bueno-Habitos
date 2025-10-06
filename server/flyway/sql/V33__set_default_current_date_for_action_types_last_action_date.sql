-- =========================================
-- V33: Set CURRENT_DATE as default and NOT NULL for action_types.last_action_date
-- =========================================
-- Description: Updates the last_action_date column in action_types table to:
--              1. Update any existing NULL values to CURRENT_DATE
--              2. Set CURRENT_DATE as the default value for new records
--              3. Enforce NOT NULL constraint to ensure data integrity
--
-- Migration Strategy: This migration is designed to be safe for production:
--                     - Updates existing NULL values before applying NOT NULL constraint
--                     - Uses CURRENT_DATE (not CURRENT_TIMESTAMP) to store only date portion
--                     - Preserves existing non-NULL values unchanged
--
-- Timezone Behavior: CURRENT_DATE respects the database's configured timezone
--                     and returns the current date for the session timezone.
--
-- Impact:
--   - Existing NULL values will be set to the current date
--   - New records will automatically use today's date if not specified
--   - All future records must have a valid date (NOT NULL enforced)
-- =========================================

-- Step 1: Update any existing NULL values to current date
-- This ensures we can safely apply the NOT NULL constraint
UPDATE public.action_types
SET last_action_date = CURRENT_DATE
WHERE last_action_date IS NULL;

-- Step 2: Set default value to CURRENT_DATE and enforce NOT NULL constraint
-- The default applies to new INSERT operations
-- The NOT NULL constraint ensures data integrity for all future operations
ALTER TABLE public.action_types
ALTER COLUMN last_action_date SET DEFAULT CURRENT_DATE,
ALTER COLUMN last_action_date SET NOT NULL;

-- Step 3: Add descriptive comment to document the change
COMMENT ON COLUMN public.action_types.last_action_date IS
'Date of the last action for this action type (defaults to current date in database timezone, NOT NULL enforced for data integrity)';