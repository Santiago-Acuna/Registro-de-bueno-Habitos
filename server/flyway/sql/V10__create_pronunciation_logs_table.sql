CREATE TABLE IF NOT EXISTS public.pronunciation_logs
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    habit_id uuid NOT NULL,
    action_id uuid NOT NULL,
    original_text text COLLATE pg_catalog."default" NOT NULL,
    speech_to_text_result text COLLATE pg_catalog."default" NOT NULL,
    accuracy_percentage numeric(5,2) NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pronunciation_logs_pkey PRIMARY KEY (id),
    CONSTRAINT pronunciation_logs_action_id_key UNIQUE (action_id),
    CONSTRAINT fk_pronunciation_logs_action_id FOREIGN KEY (action_id)
        REFERENCES public.actions (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_pronunciation_logs_habit_id FOREIGN KEY (habit_id)
        REFERENCES public.habits (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT pronunciation_logs_accuracy_percentage_check CHECK (accuracy_percentage >= 0::numeric AND accuracy_percentage <= 100::numeric)
)

TABLESPACE pg_default;

