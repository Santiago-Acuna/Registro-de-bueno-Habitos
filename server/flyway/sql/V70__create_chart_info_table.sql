-- Migration: V70__create_chart_info_table.sql
-- Purpose: Create chart_info table to store chart display information linked to log types

CREATE TABLE IF NOT EXISTS public.chart_info (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    log_type_id UUID NOT NULL,

    CONSTRAINT chart_info_pkey PRIMARY KEY (id),
    CONSTRAINT chart_info_log_type_id_fk FOREIGN KEY (log_type_id)
        REFERENCES public.log_types (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
)
TABLESPACE pg_default;

ALTER TABLE public.chart_info OWNER TO flyway_admin;

CREATE INDEX idx_chart_info_log_type_id
    ON public.chart_info USING btree (log_type_id);

GRANT SELECT, INSERT, DELETE, UPDATE ON TABLE public.chart_info TO prisma_user;

COMMENT ON TABLE public.chart_info IS
'Stores chart display information associated with each log type. One log type can have many chart_info entries.';

COMMENT ON COLUMN public.chart_info.id IS 'Primary key: Unique identifier for each chart info entry';
COMMENT ON COLUMN public.chart_info.label IS 'Display label for the chart entry';
COMMENT ON COLUMN public.chart_info.log_type_id IS 'Foreign key referencing the log_types table';
