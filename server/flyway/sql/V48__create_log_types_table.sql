-- Migration: V48__create_log_types_table.sql
-- Purpose: Create log_types table to store a registry of all log type tables in the system
-- This table serves as a catalog of different logging mechanisms available
-- (e.g., "Development Logs", "Reading Logs", "Pronunciation Logs", "Action Logs")

-- Create the log_types table
CREATE TABLE IF NOT EXISTS public.log_types (
    -- Primary key: UUID with automatic generation
    id UUID NOT NULL DEFAULT gen_random_uuid(),

    -- Log type name with 50 character constraint
    name VARCHAR(50) NOT NULL,

    -- Primary key constraint
    CONSTRAINT log_types_pkey PRIMARY KEY (id),

    -- Unique constraint to prevent duplicate log type names
    CONSTRAINT log_types_name_unique UNIQUE (name),

    -- Check constraint to ensure name is not empty
    CONSTRAINT log_types_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
)
TABLESPACE pg_default;

-- Set table owner to flyway_admin (following existing pattern)
ALTER TABLE public.log_types OWNER TO flyway_admin;

-- Create index for efficient name lookups
CREATE INDEX idx_log_types_name
    ON public.log_types USING btree (name);

-- Grant permissions to prisma_user (following existing pattern from schema)
GRANT SELECT, INSERT, DELETE, UPDATE ON TABLE public.log_types TO prisma_user;

-- Add table and column comments for documentation
COMMENT ON TABLE public.log_types IS
'Registry of all log type tables in the system. This table serves as a catalog
of different logging mechanisms available in the application, such as development logs,
reading logs, pronunciation logs, and action logs.';

COMMENT ON COLUMN public.log_types.id IS 'Primary key: Unique identifier for each log type';
COMMENT ON COLUMN public.log_types.name IS 'Name of the log type table (max 50 characters, unique)';
