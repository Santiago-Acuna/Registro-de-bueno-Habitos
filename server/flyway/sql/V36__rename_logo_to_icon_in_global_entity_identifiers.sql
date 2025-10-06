-- =========================================
-- V36: Rename logo to icon in global_entity_identifiers
-- =========================================
-- Description: Renames the 'logo' column to 'icon' in the global_entity_identifiers table
--              to better reflect the semantic meaning of the field throughout the application.

-- =========================================
-- STEP 1: Validate Prerequisites
-- =========================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'global_entity_identifiers'
    ) THEN
        RAISE EXCEPTION 'Prerequisites not met: global_entity_identifiers table does not exist';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'global_entity_identifiers'
        AND column_name = 'logo'
    ) THEN
        RAISE EXCEPTION 'Prerequisites not met: logo column does not exist in global_entity_identifiers table';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'global_entity_identifiers'
        AND column_name = 'icon'
    ) THEN
        RAISE EXCEPTION 'Migration conflict: icon column already exists in global_entity_identifiers table';
    END IF;

    RAISE NOTICE 'Prerequisites validated: Ready to rename logo column to icon';
END $$;

-- =========================================
-- STEP 2: Rename Column from logo to icon
-- =========================================
ALTER TABLE public.global_entity_identifiers
RENAME COLUMN logo TO icon;

-- =========================================
-- STEP 3: Rename Associated Constraints
-- =========================================
ALTER TABLE public.global_entity_identifiers
RENAME CONSTRAINT global_entity_identifiers_logo_unique TO global_entity_identifiers_icon_unique;

ALTER TABLE public.global_entity_identifiers
RENAME CONSTRAINT global_entity_identifiers_logo_not_empty TO global_entity_identifiers_icon_not_empty;

ALTER TABLE public.global_entity_identifiers
RENAME CONSTRAINT global_entity_identifiers_logo_size TO global_entity_identifiers_icon_size;

ALTER TABLE public.global_entity_identifiers
RENAME CONSTRAINT global_entity_identifiers_name_logo_unique TO global_entity_identifiers_name_icon_unique;

-- =========================================
-- STEP 4: Update Column Documentation
-- =========================================
COMMENT ON COLUMN public.global_entity_identifiers.icon IS
'The globally unique icon (max 2MB as per business rules). Renamed from logo to better reflect semantic meaning as icon across the application.';

-- =========================================
-- STEP 5: Validation
-- =========================================
DO $$
DECLARE
    icon_column_exists BOOLEAN;
    logo_column_exists BOOLEAN;
    icon_constraint_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'global_entity_identifiers'
        AND column_name = 'icon'
    ) INTO icon_column_exists;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'global_entity_identifiers'
        AND column_name = 'logo'
    ) INTO logo_column_exists;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'global_entity_identifiers'
        AND constraint_name = 'global_entity_identifiers_icon_unique'
    ) INTO icon_constraint_exists;

    IF icon_column_exists AND NOT logo_column_exists AND icon_constraint_exists THEN
        RAISE NOTICE 'SUCCESS: Column and constraints successfully renamed from logo to icon';
    ELSE
        RAISE WARNING 'Verification issue - icon exists: %, logo exists: %, icon constraint exists: %',
                     icon_column_exists, logo_column_exists, icon_constraint_exists;
    END IF;
END $$;