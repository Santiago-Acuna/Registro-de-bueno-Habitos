ALTER TABLE public.actions
    ADD COLUMN habit_id uuid NOT NULL;

ALTER TABLE public.actions
    ADD CONSTRAINT fk_actions_habit_id FOREIGN KEY (habit_id)
    REFERENCES public.habits (id) MATCH SIMPLE
    ON UPDATE CASCADE
    ON DELETE CASCADE;