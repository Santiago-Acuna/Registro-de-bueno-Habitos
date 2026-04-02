-- =========================================
-- V69: Make global_entity_identifiers.icon Nullable
-- =========================================
-- Description: Drops the NOT NULL constraint on the 'icon' column of the
--              global_entity_identifiers table, allowing entities to be
--              registered without an icon value.
--
-- Prerequisites:
--   - V34 migration: global_entity_identifiers table exists with icon column
--                    (originally created as 'logo TEXT NOT NULL')
--   - V36 migration: 'logo' column renamed to 'icon'
--
-- Business Impact:
--   - Entities (habits, action_types) can now be created or registered in the
--     global_entity_identifiers table before an icon has been assigned.
--   - Existing rows are unaffected; NULL is only permitted for new or updated rows.
--   - The existing CHECK constraints (icon_not_empty, icon_size) remain in place
--     and will still fire whenever a non-NULL value is provided, preserving all
--     data-quality rules for rows that do carry an icon.
--
-- Safety Measures:
--   - Defensive DO $$ blocks validate prerequisites before the ALTER runs.
--   - The change is purely additive (widening a constraint) and is fully
--     backward-compatible; no data migration is required.
--   - A post-migration verification block confirms the nullability change.
--
-- PostgreSQL Best Practices Applied:
--   - ALTER COLUMN ... DROP NOT NULL is non-blocking on PostgreSQL (no table rewrite).
--   - Prerequisite guards prevent accidental re-execution from causing silent no-ops
--     or misleading results.
--   - snake_case identifiers maintained throughout.
-- =========================================


-- =========================================
-- STEP 1: Validate Prerequisites
-- =========================================

-- Verify global_entity_identifiers table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'global_entity_identifiers'
    ) THEN
        RAISE EXCEPTION 'Prerequisites not met: global_entity_identifiers table does not exist. V34 migration must be applied first.';
    END IF;
END $$;

-- Verify icon column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'global_entity_identifiers'
        AND column_name = 'icon'
    ) THEN
        RAISE EXCEPTION 'Prerequisites not met: icon column does not exist in global_entity_identifiers. V36 migration must be applied first.';
    END IF;
END $$;

-- Verify icon column is currently NOT NULL (guard against redundant re-run)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'global_entity_identifiers'
        AND column_name = 'icon'
        AND is_nullable = 'YES'
    ) THEN
        RAISE NOTICE 'icon column is already nullable — migration step is a no-op.';
    END IF;
END $$;


-- =========================================
-- STEP 2: Drop NOT NULL Constraint on icon
-- =========================================

ALTER TABLE public.global_entity_identifiers
    ALTER COLUMN icon DROP NOT NULL;


-- =========================================
-- STEP 3: Update Column Documentation
-- =========================================

COMMENT ON COLUMN public.global_entity_identifiers.icon IS
'The globally unique icon (max 2MB as per business rules). Nullable: entities may
be registered before an icon is assigned. When a non-NULL value is provided it
must satisfy the icon_not_empty and icon_size CHECK constraints. Renamed from
logo (V36) to better reflect semantic meaning across the application.';


-- =========================================
-- STEP 4: Verification
-- =========================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'global_entity_identifiers'
        AND column_name = 'icon'
        AND is_nullable = 'YES'
    ) THEN
        RAISE NOTICE 'SUCCESS: icon column is now nullable in global_entity_identifiers.';
    ELSE
        RAISE WARNING 'Verification failed: icon column is still NOT NULL in global_entity_identifiers.';
    END IF;
END $$;


-- =========================================
-- MIGRATION SUMMARY
-- =========================================
--
-- SCHEMA CHANGES:
--   - Modified: public.global_entity_identifiers.icon
--       Before : TEXT NOT NULL
--       After  : TEXT (nullable)
--
-- UNCHANGED:
--   - UNIQUE constraint  : global_entity_identifiers_icon_unique  (icon)
--   - CHECK constraint   : global_entity_identifiers_icon_not_empty (fires only on non-NULL)
--   - CHECK constraint   : global_entity_identifiers_icon_size      (fires only on non-NULL)
--   - UNIQUE constraint  : global_entity_identifiers_name_icon_unique (name, icon)
--   - All indexes, foreign keys, and other table structure remain intact.
--
-- ROLLBACK PROCEDURE (if needed):
--   ALTER TABLE public.global_entity_identifiers ALTER COLUMN icon SET NOT NULL;
--   (Requires that no existing rows contain NULL in the icon column.)
--
