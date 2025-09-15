ALTER TABLE IF EXISTS public.actions DROP COLUMN IF EXISTS habit_id;
ALTER TABLE IF EXISTS public.actions DROP CONSTRAINT IF EXISTS fk_actions_habit_id;
DROP INDEX IF EXISTS public.idx_actions_habit_id;
DROP INDEX IF EXISTS public.idx_actions_habit_start_time;
DROP INDEX IF EXISTS public.idx_actions_habit_duration;
DROP INDEX IF EXISTS public.idx_actions_habit_date;
DROP TRIGGER IF EXISTS update_habit_stats_trigger ON public.actions;