CREATE OR REPLACE TRIGGER update_habit_stats_from_reading_trigger
    AFTER INSERT OR DELETE
    ON public.reading_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_habit_stats();