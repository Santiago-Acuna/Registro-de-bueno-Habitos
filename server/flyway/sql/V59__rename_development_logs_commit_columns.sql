-- =========================================
-- V59: Rename development_logs columns for better semantic clarity
-- =========================================
-- Description: Renames columns in the development_logs table to better reflect their purpose:
--              1. commit_importance -> commit_type (describes the nature of the commit)
--              2. commit_size -> commit_scope (describes the extent/reach of the commit)
--
-- Migration Strategy: This is a schema-only migration that:
--                     - Renames columns without changing data
--                     - Automatically updates foreign key constraints (PostgreSQL handles this)
--                     - Preserves all existing data and relationships
--                     - Does not require application downtime (backwards incompatible)
--
-- Business Rationale: The new names better align with git commit conventions and semantic versioning:
--                     - "commit_type" clarifies that this field categorizes the commit (feat, fix, docs, etc.)
--                     - "commit_scope" indicates the breadth of changes (component, feature, system-wide, etc.)
--
-- Foreign Key Impact: The following constraints are automatically updated by PostgreSQL:
--                     - development_logs_commit_importance_fk -> references commit_type_id
--                     - development_logs_commit_size_fk -> references commit_scope_id
--
-- Rollback Strategy: To rollback this change, run:
--                     ALTER TABLE public.development_logs RENAME COLUMN commit_type_id TO commit_importance_id;
--                     ALTER TABLE public.development_logs RENAME COLUMN commit_scope_id TO commit_size_id;
-- =========================================

-- Step 1: Rename commit_importance_id to commit_type_id
-- This column categorizes the type/nature of the commit (e.g., feature, bugfix, documentation)
ALTER TABLE public.development_logs
RENAME COLUMN commit_importance_id TO commit_type_id;

-- Step 2: Rename commit_size_id to commit_scope_id
-- This column describes the scope/extent of the commit (e.g., component-level, feature-level, system-wide)
ALTER TABLE public.development_logs
RENAME COLUMN commit_size_id TO commit_scope_id;

-- Step 3: Update column comments to reflect the new semantics
COMMENT ON COLUMN public.development_logs.commit_type_id IS
'Foreign key to subtypes table indicating the type/category of the commit (e.g., feat, fix, docs, refactor)';

COMMENT ON COLUMN public.development_logs.commit_scope_id IS
'Foreign key to subtypes table indicating the scope/extent of the commit (e.g., component, feature, system-wide)';
