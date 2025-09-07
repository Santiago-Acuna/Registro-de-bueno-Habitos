CREATE INDEX IF NOT EXISTS idx_pronunciation_logs_accuracy
    ON public.pronunciation_logs USING btree
    (accuracy_percentage ASC NULLS LAST)
    TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_pronunciation_logs_action_id
    ON public.pronunciation_logs USING btree
    (action_id ASC NULLS LAST)
    TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_pronunciation_logs_created_at
    ON public.pronunciation_logs USING btree
    (created_at ASC NULLS LAST)
    TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_pronunciation_logs_habit_accuracy
    ON public.pronunciation_logs USING btree
    (habit_id ASC NULLS LAST, accuracy_percentage ASC NULLS LAST)
    TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_pronunciation_logs_habit_id
    ON public.pronunciation_logs USING btree
    (habit_id ASC NULLS LAST)
    TABLESPACE pg_default;