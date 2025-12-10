ALTER TABLE public.development_logs
ADD CONSTRAINT development_logs_action_id_unique UNIQUE (action_id);