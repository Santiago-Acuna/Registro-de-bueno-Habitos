-- Migration: V22__create_action_types_table.sql
-- Purpose: Create action_types table to categorize and track different types of actions
-- This table will contain action type definitions (e.g., "Reading", "Pronunciation Practice", "Exercise")
-- and maintain aggregated statistics for each action type within a habit

-- Create the action_types table
CREATE TABLE IF NOT EXISTS public.action_types (
    -- Primary key: UUID with automatic generation
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    
    -- Action type identification
    name TEXT NOT NULL,
    logo TEXT NOT NULL,
    
    -- Statistical tracking fields
    last_action_date TIMESTAMP WITH TIME ZONE,
    total_actions_count INTEGER DEFAULT 0 NOT NULL,
    
    -- Audit timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key to habits table (one habit can have many action_types)
    habit_id UUID NOT NULL,
    
    -- Primary key constraint
    CONSTRAINT action_types_pkey PRIMARY KEY (id),
    
    -- Foreign key constraint to habits table
    CONSTRAINT fk_action_types_habit_id FOREIGN KEY (habit_id)
        REFERENCES public.habits (id)
        ON UPDATE CASCADE 
        ON DELETE CASCADE,
    
    -- Unique constraints to ensure data integrity
    CONSTRAINT action_types_name_habit_unique UNIQUE (name, habit_id),
    CONSTRAINT action_types_logo_habit_unique UNIQUE (logo, habit_id),
    
    -- Check constraints for data validation
    CONSTRAINT action_types_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT action_types_logo_not_empty CHECK (LENGTH(TRIM(logo)) > 0),
    CONSTRAINT action_types_logo_size CHECK (LENGTH(logo) <= 2097152),
    CONSTRAINT action_types_total_actions_non_negative CHECK (total_actions_count >= 0)
)
TABLESPACE pg_default;

-- Create performance indexes
-- Index for querying action types by habit
CREATE INDEX idx_action_types_habit_id 
    ON public.action_types USING btree (habit_id);

-- Index for querying by last action date (for recent activity queries)
CREATE INDEX idx_action_types_last_action_date 
    ON public.action_types USING btree (last_action_date DESC) 
    WHERE last_action_date IS NOT NULL;

-- Index for querying by action count (for statistics and rankings)
CREATE INDEX idx_action_types_total_actions_count 
    ON public.action_types USING btree (total_actions_count DESC);

-- Composite index for habit-specific queries with action count ordering
CREATE INDEX idx_action_types_habit_actions_count 
    ON public.action_types USING btree (habit_id, total_actions_count DESC);

-- Index for active action types ordered by creation date
CREATE INDEX idx_action_types_created_at 
    ON public.action_types USING btree (created_at);

-- Add trigger to automatically update updated_at timestamp
CREATE TRIGGER update_action_types_updated_at 
    BEFORE UPDATE ON public.action_types 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments explaining the table structure and relationships
COMMENT ON TABLE public.action_types IS 
'Action types define categories of actions within habits (e.g., Reading, Pronunciation Practice).
Each habit can have multiple action types, and each action type tracks aggregated statistics.
Relationships: habits (1) -> action_types (many)';

COMMENT ON COLUMN public.action_types.id IS 'Primary key: Unique identifier for each action type';
COMMENT ON COLUMN public.action_types.name IS 'Action type name (e.g., "Reading Session", "Pronunciation Practice")';
COMMENT ON COLUMN public.action_types.logo IS 'Logo or icon identifier for the action type';
COMMENT ON COLUMN public.action_types.last_action_date IS 'Timestamp of the most recent action of this type';
COMMENT ON COLUMN public.action_types.total_actions_count IS 'Total number of actions performed for this action type';
COMMENT ON COLUMN public.action_types.habit_id IS 'Foreign key reference to the parent habit';
COMMENT ON COLUMN public.action_types.created_at IS 'Timestamp when this action type was created';
COMMENT ON COLUMN public.action_types.updated_at IS 'Timestamp when this action type was last modified';

-- Note: To establish the many-to-one relationship between actions and action_types,
-- a future migration should add action_type_id column to the actions table.
-- This follows proper database normalization principles:
-- actions (many) -> action_types (one) via action_type_id foreign key