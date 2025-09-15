-- Migration: V21__drop_habit_id_column_from_actions_table.sql
-- Purpose: Remove the habit_id foreign key relationship from actions table
-- This migration removes the direct relationship between actions and habits,
-- as actions are now only linked to habits through reading_logs and pronunciation_logs

-- Drop the trigger that updates habit stats from actions
-- This trigger depends on the habit_id column, so it must be dropped first
DROP TRIGGER IF EXISTS update_habit_stats_from_actions_trigger ON public.actions;

-- Drop the foreign key constraint
-- This must be done before dropping the column
ALTER TABLE IF EXISTS public.actions 
    DROP CONSTRAINT IF EXISTS fk_actions_habit_id;

-- Finally, drop the habit_id column from actions table
-- This removes the direct relationship between actions and habits
ALTER TABLE IF EXISTS public.actions 
    DROP COLUMN IF EXISTS habit_id;

-- Note: The relationship between habits and actions is now maintained through:
-- 1. reading_logs.action_id -> actions.id (for reading actions)
-- 2. pronunciation_logs.action_id -> actions.id (for pronunciation actions)