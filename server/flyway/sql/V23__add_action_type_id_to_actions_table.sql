-- Migration: V23__add_action_type_id_to_actions_table.sql
-- Purpose: Add action_type_id column to actions table to establish many-to-one relationship
-- This migration creates the normalized relationship: actions (many) -> action_types (one)
-- Each action will be categorized by an action_type, replacing the previous array-based approach

-- Add the action_type_id column to the actions table
-- Making it NOT NULL to ensure all actions must have an action type
ALTER TABLE IF EXISTS public.actions 
    ADD COLUMN action_type_id UUID NOT NULL;

-- Add foreign key constraint linking actions to action_types
-- Using CASCADE for UPDATE and RESTRICT for DELETE since action_type_id is NOT NULL
ALTER TABLE IF EXISTS public.actions 
    ADD CONSTRAINT fk_actions_action_type_id 
    FOREIGN KEY (action_type_id) 
    REFERENCES public.action_types (id) 
    ON UPDATE CASCADE 
    ON DELETE RESTRICT;

-- Create performance index on the new foreign key column
-- This index will optimize queries filtering/joining actions by action_type
CREATE INDEX IF NOT EXISTS idx_actions_action_type_id 
    ON public.actions USING btree (action_type_id);

-- Create composite index for efficient habit-based action type queries
-- This supports queries like "show all actions of a specific type within a habit"
-- The index uses action_type_id first since it's more selective than action_date
CREATE INDEX IF NOT EXISTS idx_actions_action_type_date 
    ON public.actions USING btree (action_type_id, action_date DESC)
    WHERE action_date IS NOT NULL;

-- Create composite index for time-series queries by action type
-- Optimizes queries for recent actions of specific types
CREATE INDEX IF NOT EXISTS idx_actions_action_type_start_time 
    ON public.actions USING btree (action_type_id, start_time DESC);

-- Add column comment explaining the relationship
COMMENT ON COLUMN public.actions.action_type_id IS 
'Foreign key reference to action_types.id. Establishes many-to-one relationship where 
multiple actions can belong to one action type. NOT NULL constraint ensures all actions 
must be categorized by an action type.';

-- Add table comment explaining the updated relationship structure
COMMENT ON TABLE public.actions IS 
'Actions represent time-tracked activities within the habit tracking system.
Relationships:
- actions (many) -> action_types (one) via action_type_id [NEW in V23]
- actions (1) -> reading_logs (0..1) via action_id
- actions (1) -> pronunciation_logs (0..1) via action_id
Each action is now categorized by an action_type, enabling better organization and reporting.';

-- Performance and data integrity notes:
-- 1. action_type_id is NOT NULL ensuring data integrity and requiring all actions to be categorized
-- 2. ON DELETE RESTRICT prevents deletion of action types that have associated actions
-- 3. Indexes optimize common query patterns for action type analytics
-- 4. The relationship enables normalized data storage replacing previous array-based approaches

-- Future considerations:
-- 1. May need triggers to automatically update action_types statistics when actions are modified
-- 2. Application logic must ensure valid action_type_id when creating new actions
-- 3. Consider adding default action types for system-generated actions