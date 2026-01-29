-- =========================================
-- V60: Make external_dependencies.programming_language_id nullable
-- =========================================
-- Description: Updates the programming_language_id column in external_dependencies table to:
--              1. Remove the NOT NULL constraint to allow NULL values
--              2. Set NULL as the default value for new records
--              3. Preserve all existing data unchanged
--
-- Migration Strategy: This migration is designed to be safe for production:
--                     - Removes the NOT NULL constraint to allow optional programming language assignment
--                     - Ensures default remains NULL
--                     - All existing non-NULL values remain unchanged
--                     - New records will have NULL by default unless explicitly set
--                     - Foreign key constraint remains intact (ON UPDATE CASCADE ON DELETE CASCADE)
--
-- Business Rationale: Allows external dependencies to be created without an associated programming language,
--                     making the column truly optional for dependencies that are language-agnostic
--                     (e.g., databases, cloud services, generic tools, or infrastructure dependencies).
--
-- Rollback Strategy: To rollback this change:
--                     1. UPDATE external_dependencies SET programming_language_id = <default_language_id> WHERE programming_language_id IS NULL;
--                     2. ALTER TABLE external_dependencies ALTER COLUMN programming_language_id SET NOT NULL;
-- =========================================

-- Step 1: Remove the NOT NULL constraint (if exists)
-- This allows the column to accept NULL values
ALTER TABLE public.external_dependencies
ALTER COLUMN programming_language_id DROP NOT NULL;

-- Step 2: Ensure the default value is NULL (should already be set, but ensuring consistency)
-- New records will have NULL unless explicitly specified
ALTER TABLE public.external_dependencies
ALTER COLUMN programming_language_id SET DEFAULT NULL;

-- Step 3: Update the column comment to reflect the new behavior
COMMENT ON COLUMN public.external_dependencies.programming_language_id IS
'Foreign key to programming_languages table (nullable, defaults to NULL for language-agnostic dependencies)';
