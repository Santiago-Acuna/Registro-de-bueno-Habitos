CREATE INDEX IF NOT EXISTS idx_reading_logs_habit_date
    ON public.reading_logs USING btree
    (habit_id ASC NULLS LAST, reading_date ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_reading_logs_habit_id
    ON public.reading_logs USING btree
    (habit_id ASC NULLS LAST)
    TABLESPACE pg_default;