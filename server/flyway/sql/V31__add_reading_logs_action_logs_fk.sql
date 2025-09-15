ALTER TABLE reading_logs
    ADD CONSTRAINT reading_logs_action_logs_fk FOREIGN KEY (action_id) REFERENCES public.action_logs(id) ON UPDATE CASCADE ON DELETE CASCADE;