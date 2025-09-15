CREATE OR REPLACE TRIGGER update_habit_stats_from_pronunciation_trigger
    AFTER INSERT OR DELETE
    ON public.pronunciation_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_habit_stats();