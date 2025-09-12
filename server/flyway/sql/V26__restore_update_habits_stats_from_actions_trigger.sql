CREATE OR REPLACE TRIGGER update_habit_stats_from_actions_trigger
    AFTER INSERT OR DELETE
    ON public.action_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_habit_stats();