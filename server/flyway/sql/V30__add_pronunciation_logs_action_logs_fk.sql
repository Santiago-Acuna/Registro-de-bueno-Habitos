ALTER TABLE pronunciation_logs
    ADD CONSTRAINT pronunciation_logs_action_logs_fk FOREIGN KEY (action_id) REFERENCES public.action_logs(id) ON UPDATE CASCADE ON DELETE CASCADE;