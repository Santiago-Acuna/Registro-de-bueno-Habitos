-- =========================================
-- V32: Set CURRENT_DATE as default and NOT NULL for action_logs.action_date
-- =========================================
-- Description: Sets the action_date column to automatically use today's date
--              as default value when new records are inserted and enforces
--              NOT NULL constraint to ensure data integrity.
--
-- Timezone Behavior: CURRENT_DATE respects the database's configured timezone
--                     and will return the correct date for the session timezone.
--
-- Impact: Only affects new INSERT operations. Existing records remain unchanged.
--         The NOT NULL constraint ensures all future records have valid dates.
-- =========================================

-- Set default value for action_date column to current date and enforce NOT NULL constraint
-- This will respect the database timezone configuration and ensure data integrity
ALTER TABLE public.action_logs
ALTER COLUMN action_date SET DEFAULT CURRENT_DATE,
ALTER COLUMN action_date SET NOT NULL;

-- Add comment to document the change and NOT NULL constraint
COMMENT ON COLUMN public.action_logs.action_date IS
'Date of the action (defaults to current date in database timezone, NOT NULL enforced for data integrity)';