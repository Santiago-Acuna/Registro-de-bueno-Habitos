CREATE OR REPLACE TRIGGER trigger_prevent_pronunciation_logs_update
    BEFORE UPDATE 
    ON public.pronunciation_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_pronunciation_logs_update();