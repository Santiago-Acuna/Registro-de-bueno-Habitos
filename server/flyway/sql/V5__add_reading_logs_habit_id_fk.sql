ALTER TABLE IF EXISTS public.reading_logs
    ADD CONSTRAINT fk_reading_logs_habit_id FOREIGN KEY (habit_id)
    REFERENCES public.habits (id) MATCH SIMPLE
    ON UPDATE CASCADE
    ON DELETE CASCADE;