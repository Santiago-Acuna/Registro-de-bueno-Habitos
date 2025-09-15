ALTER TABLE action_logs DROP CONSTRAINT IF EXISTS actions_pkey;
   ALTER TABLE action_logs ADD CONSTRAINT action_logs_pkey PRIMARY KEY (id);