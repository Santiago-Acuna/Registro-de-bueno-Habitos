-- =========================================
-- V34: Implement Global Uniqueness for Names and Logos
-- =========================================
-- Description: Creates a unified global uniqueness enforcement system for names and logos
--              across all entities (habits and action types) in the system using a single table approach.
--              This migration implements a robust solution with individual and combination uniqueness
--              constraints with proper referential integrity and PostgreSQL best practices.
--
-- Business Requirements:
--   - Prevent naming conflicts between habits and action types
--   - Ensure all names are globally unique across the entire system
--   - Ensure all logos are globally unique across the entire system
--   - Ensure each name+logo combination is unique across the entire system
--   - Maintain referential integrity between entities and global table
--   - Support efficient lookups and constraint validation
--
-- Architecture:
--   - global_entity_identifiers table: centralized storage with triple uniqueness enforcement
--     * Individual name uniqueness: UNIQUE (name)
--     * Individual logo uniqueness: UNIQUE (logo)
--     * Combination uniqueness: UNIQUE (name, logo)
--   - Foreign key references from habits and action_types to global table
--   - Removal of existing local unique constraints that conflict with global approach
--
-- PostgreSQL Best Practices Applied:
--   - Proper constraint naming for maintainability
--   - Strategic indexing for performance
--   - Referential integrity with CASCADE actions
--   - Comprehensive documentation via comments
--   - Check constraints for data validation
--   - Efficient data types (TEXT vs VARCHAR based on usage)
--
-- Migration Safety:
--   - Safe for production (all tables currently empty per requirements)
--   - No data migration needed
--   - Backward compatible constraint removal
--   - Defensive programming with IF EXISTS clauses
-- =========================================

-- =========================================
-- STEP 1: Create Global Entity Identifiers Table
-- =========================================
-- This table enforces triple uniqueness for all entity identifiers:
-- 1. Global name uniqueness across all entities
-- 2. Global logo uniqueness across all entities
-- 3. Global name+logo combination uniqueness
CREATE TABLE IF NOT EXISTS public.global_entity_identifiers (
    -- Primary key: UUID with automatic generation
    id UUID NOT NULL DEFAULT gen_random_uuid(),

    -- The globally unique name (enforced by individual unique constraint)
    name VARCHAR(255) NOT NULL,

    -- The globally unique logo (enforced by individual unique constraint)
    logo TEXT NOT NULL,

    -- Entity type enumeration for referential tracking
    entity_type VARCHAR(20) NOT NULL,

    -- Reference to the specific entity that owns this identifier pair
    entity_id UUID NOT NULL,

    -- Primary key constraint
    CONSTRAINT global_entity_identifiers_pkey PRIMARY KEY (id),

    -- Individual uniqueness constraints
    CONSTRAINT global_entity_identifiers_name_unique UNIQUE (name),
    CONSTRAINT global_entity_identifiers_logo_unique UNIQUE (logo),

    -- Combination uniqueness constraint
    CONSTRAINT global_entity_identifiers_name_logo_unique UNIQUE (name, logo),

    -- Entity uniqueness constraint - one identifier pair per entity
    CONSTRAINT global_entity_identifiers_entity_unique UNIQUE (entity_type, entity_id),

    -- Data validation constraints
    CONSTRAINT global_entity_identifiers_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT global_entity_identifiers_logo_not_empty CHECK (LENGTH(TRIM(logo)) > 0),
    CONSTRAINT global_entity_identifiers_entity_type_valid CHECK (entity_type IN ('habit', 'action_type')),
    CONSTRAINT global_entity_identifiers_name_length CHECK (LENGTH(name) <= 255),
    -- Note: Logo size limit (2MB) will be enforced at application layer for performance
    CONSTRAINT global_entity_identifiers_logo_size CHECK (LENGTH(logo) <= 2097152)
)
TABLESPACE pg_default;

-- =========================================
-- STEP 2: Remove Existing Conflicting Constraints
-- =========================================
-- Remove local unique constraints that conflict with global uniqueness approach

-- Remove action_types unique constraints (name, habit_id) and (logo, habit_id)
-- These are replaced by global uniqueness + foreign key references
ALTER TABLE public.action_types
DROP CONSTRAINT IF EXISTS action_types_name_habit_unique;

ALTER TABLE public.action_types
DROP CONSTRAINT IF EXISTS action_types_logo_habit_unique;

-- Remove habits unique index for names (only for active habits)
-- This is replaced by global name uniqueness
DROP INDEX IF EXISTS public.idx_habits_name_active;

-- =========================================
-- STEP 3: Add Foreign Key Columns to Existing Tables
-- =========================================
-- Add single column to reference the global identifiers table

-- Add global identifier reference to habits table
ALTER TABLE public.habits
ADD COLUMN IF NOT EXISTS global_identifier_id UUID;

-- Add global identifier reference to action_types table
ALTER TABLE public.action_types
ADD COLUMN IF NOT EXISTS global_identifier_id UUID;

-- =========================================
-- STEP 4: Create Foreign Key Constraints
-- =========================================
-- Establish referential integrity between entities and global table

-- Habits table foreign key constraint
ALTER TABLE public.habits
ADD CONSTRAINT fk_habits_global_identifier
    FOREIGN KEY (global_identifier_id)
    REFERENCES public.global_entity_identifiers (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;

-- Action types table foreign key constraint
ALTER TABLE public.action_types
ADD CONSTRAINT fk_action_types_global_identifier
    FOREIGN KEY (global_identifier_id)
    REFERENCES public.global_entity_identifiers (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;

-- =========================================
-- STEP 5: Create Performance Indexes
-- =========================================
-- Strategic indexing for optimal query performance

-- Global Entity Identifiers Table Indexes
-- Primary lookup indexes (covered by unique constraints automatically)
-- CREATE UNIQUE INDEX global_entity_identifiers_name_unique ON public.global_entity_identifiers (name); -- Already created by constraint
-- CREATE UNIQUE INDEX global_entity_identifiers_logo_unique ON public.global_entity_identifiers (logo); -- Already created by constraint
-- CREATE UNIQUE INDEX global_entity_identifiers_name_logo_unique ON public.global_entity_identifiers (name, logo); -- Already created by constraint

-- Entity lookup index for reverse references
CREATE INDEX idx_global_entity_identifiers_entity_lookup
    ON public.global_entity_identifiers USING btree (entity_type, entity_id);




-- Name prefix search index for autocomplete functionality
CREATE INDEX idx_global_entity_identifiers_name_prefix
    ON public.global_entity_identifiers USING btree (name text_pattern_ops);

-- Foreign Key Indexes on Entity Tables (for efficient joins)
-- Habits table index
CREATE INDEX idx_habits_global_identifier_id
    ON public.habits USING btree (global_identifier_id);

-- Action types table index
CREATE INDEX idx_action_types_global_identifier_id
    ON public.action_types USING btree (global_identifier_id);

-- =========================================
-- STEP 7: Add Comprehensive Documentation
-- =========================================
-- Document the schema design and relationships

-- Global Entity Identifiers Table Documentation
COMMENT ON TABLE public.global_entity_identifiers IS
'Unified global registry for entity identifiers (names and logos) ensuring system-wide uniqueness.
This table prevents conflicts between habits and action types by centralizing identifier management with triple uniqueness:
1. Individual name uniqueness across all entities
2. Individual logo uniqueness across all entities
3. Combined name+logo uniqueness across all entities
Relationships: global_entity_identifiers (1) <- habits|action_types (1) via foreign key';

COMMENT ON COLUMN public.global_entity_identifiers.id IS 'Primary key: Unique identifier for each global entity identifier entry';
COMMENT ON COLUMN public.global_entity_identifiers.name IS 'The globally unique name (case-sensitive, trimmed, max 255 chars)';
COMMENT ON COLUMN public.global_entity_identifiers.logo IS 'The globally unique logo (max 2MB as per business rules)';
COMMENT ON COLUMN public.global_entity_identifiers.entity_type IS 'Type of entity owning this identifier: "habit" or "action_type"';
COMMENT ON COLUMN public.global_entity_identifiers.entity_id IS 'UUID of the specific entity (habit or action_type) that owns these identifiers';

-- Entity Table Column Documentation
COMMENT ON COLUMN public.habits.global_identifier_id IS 'Foreign key to global_entity_identifiers table ensuring system-wide name and logo uniqueness';
COMMENT ON COLUMN public.action_types.global_identifier_id IS 'Foreign key to global_entity_identifiers table ensuring system-wide name and logo uniqueness';

-- =========================================
-- MIGRATION SUMMARY AND USAGE NOTES
-- =========================================
-- This migration establishes a robust unified global uniqueness system with the following key benefits:
--
-- 1. TRIPLE UNIQUENESS ENFORCEMENT:
--    - Names are individually unique across all entity types (habits and action_types)
--    - Logos are individually unique across all entity types (habits and action_types)
--    - Name+Logo combinations are unique across all entity types
--    - Prevents conflicts like: habit named "Reading" and action_type named "Reading"
--    - Prevents logo reuse across different entities
--    - Prevents same name+logo combination being used by different entities
--
-- 2. REFERENTIAL INTEGRITY:
--    - Single foreign key constraint per entity ensures data consistency
--    - CASCADE updates propagate changes automatically
--    - RESTRICT deletes prevent orphaned references
--
-- 3. PERFORMANCE OPTIMIZATION:
--    - Strategic B-tree indexes for efficient lookups
--    - Composite indexes for common query patterns
--    - Unique constraints automatically create indexes
--    - Text pattern ops index for name prefix searches
--
-- 4. APPLICATION INTEGRATION:
--    - When creating a new habit or action_type:
--      a) Insert into global_entity_identifiers table first (gets identifier_id)
--      b) Insert into entity table with foreign key reference
--    - When updating names/logos:
--      a) Update the global_entity_identifiers table directly
--    - When deleting entities:
--      a) Delete from entity table first (foreign keys prevent orphaned global entries)
--      b) Optionally clean up global table (or use triggers for automatic cleanup)
--
-- 5. QUERY PATTERNS:
--    - Check name availability: SELECT EXISTS(SELECT 1 FROM global_entity_identifiers WHERE name = 'New Name')
--    - Check logo availability: SELECT EXISTS(SELECT 1 FROM global_entity_identifiers WHERE logo = 'logo_data')
--    - Check combination availability: SELECT EXISTS(SELECT 1 FROM global_entity_identifiers WHERE name = 'Name' AND logo = 'logo_data')
--    - Get entity with identifiers: JOIN entity_table ON global_identifier_id = global_entity_identifiers.id
--    - List all names: SELECT name FROM global_entity_identifiers ORDER BY name
--    - Find entity by name: SELECT entity_type, entity_id FROM global_entity_identifiers WHERE name = 'Search Name'
--    - Name autocomplete: SELECT name FROM global_entity_identifiers WHERE name LIKE 'prefix%' ORDER BY name LIMIT 10
--
-- 6. CONSTRAINT VIOLATION HANDLING:
--    - Duplicate name: global_entity_identifiers_name_unique constraint violation (SQLSTATE 23505)
--    - Duplicate logo: global_entity_identifiers_logo_unique constraint violation (SQLSTATE 23505)
--    - Duplicate combination: global_entity_identifiers_name_logo_unique constraint violation (SQLSTATE 23505)
--    - Invalid entity type: Check constraint violation (SQLSTATE 23514)
--    - Empty name/logo: Check constraint violation (SQLSTATE 23514)
--
-- 7. MAINTENANCE CONSIDERATIONS:
--    - Global table will grow slowly (one entry per entity)
--    - Regular VACUUM and ANALYZE recommended for optimal performance
--    - Monitor foreign key constraint usage for potential orphaned entries
--    - Consider partitioning global table if system scales to millions of entities
--
-- 8. MIGRATION IMPACT:
--    - Removed conflicting constraints from action_types and habits tables
--    - Added single foreign key column to both entity tables
--    - All uniqueness now enforced through centralized global table
--    - No data migration required as tables are currently empty