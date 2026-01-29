-- =========================================
-- V61: Create development_logs_external_dependencies Junction Table
-- =========================================
-- Description: Creates a junction table to establish a many-to-many relationship
--              between development_logs and external_dependencies tables.
--              This replaces the one-to-one relationship (external_dependency_id column)
--              with a proper many-to-many relationship.
--
-- Changes:
--   1. Creates junction table development_logs_external_dependencies
--   2. Migrates existing external_dependency_id data to junction table
--   3. Drops foreign key constraint development_logs_external_dependencies_fk
--   4. Drops external_dependency_id column from development_logs
--
-- Prerequisites:
--   - V38 migration: development_logs table exists
--   - V43 migration: external_dependencies table exists
--   - V46 migration: foreign key constraints exist
--
-- Business Impact:
--   - Enables multiple external dependencies per development log
--   - Allows tracking all libraries/dependencies used in a commit
--   - More accurate representation of real-world development scenarios
-- =========================================

-- =========================================
-- STEP 1: Validate Prerequisites
-- =========================================

-- Verify development_logs table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'development_logs'
    ) THEN
        RAISE EXCEPTION 'Prerequisites not met: development_logs table does not exist.';
    END IF;
END $$;

-- Verify external_dependencies table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'external_dependencies'
    ) THEN
        RAISE EXCEPTION 'Prerequisites not met: external_dependencies table does not exist.';
    END IF;
END $$;

-- Verify flyway_admin role exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_roles
        WHERE rolname = 'flyway_admin'
    ) THEN
        RAISE EXCEPTION 'Prerequisites not met: flyway_admin role does not exist.';
    END IF;
END $$;

-- =========================================
-- STEP 2: Create Junction Table
-- =========================================

CREATE TABLE IF NOT EXISTS public.development_logs_external_dependencies (
    -- Primary key: UUID with automatic generation
    id UUID NOT NULL DEFAULT gen_random_uuid(),

    -- Foreign key to development_logs table
    development_log_id UUID NOT NULL,

    -- Foreign key to external_dependencies table
    external_dependency_id INTEGER NOT NULL,

    -- Timestamp for when the relationship was created
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Primary key constraint
    CONSTRAINT development_logs_external_dependencies_pkey PRIMARY KEY (id),

    -- Foreign key constraint to development_logs with CASCADE DELETE
    CONSTRAINT fk_dev_logs_ext_deps_development_log
        FOREIGN KEY (development_log_id)
        REFERENCES public.development_logs (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- Foreign key constraint to external_dependencies with CASCADE DELETE
    CONSTRAINT fk_dev_logs_ext_deps_external_dependency
        FOREIGN KEY (external_dependency_id)
        REFERENCES public.external_dependencies (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- Composite unique constraint to prevent duplicate relationships
    CONSTRAINT development_logs_external_dependencies_unique
        UNIQUE (development_log_id, external_dependency_id)
)
TABLESPACE pg_default;

-- =========================================
-- STEP 3: Set Table Ownership
-- =========================================

ALTER TABLE public.development_logs_external_dependencies OWNER TO flyway_admin;

-- =========================================
-- STEP 4: Create Indexes
-- =========================================

-- Index on development_log_id for efficient lookups
CREATE INDEX IF NOT EXISTS idx_dev_logs_ext_deps_development_log_id
    ON public.development_logs_external_dependencies USING btree (development_log_id);

-- Index on external_dependency_id for efficient lookups
CREATE INDEX IF NOT EXISTS idx_dev_logs_ext_deps_external_dependency_id
    ON public.development_logs_external_dependencies USING btree (external_dependency_id);

-- =========================================
-- STEP 5: Migrate Existing Data
-- =========================================
-- Move existing external_dependency_id relationships to junction table

INSERT INTO public.development_logs_external_dependencies (development_log_id, external_dependency_id)
SELECT id, external_dependency_id
FROM public.development_logs
WHERE external_dependency_id IS NOT NULL;

-- Log the number of migrated records
DO $$
DECLARE
    migrated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO migrated_count
    FROM public.development_logs_external_dependencies;

    RAISE NOTICE 'Migrated % existing external dependency relationships to junction table', migrated_count;
END $$;

-- =========================================
-- STEP 6: Drop Old Foreign Key and Column
-- =========================================

-- Drop the foreign key constraint first
ALTER TABLE public.development_logs
    DROP CONSTRAINT IF EXISTS development_logs_external_dependencies_fk;

-- Drop the external_dependency_id column
ALTER TABLE public.development_logs
    DROP COLUMN IF EXISTS external_dependency_id;

-- =========================================
-- STEP 7: Grant Permissions
-- =========================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'prisma_user') THEN
        EXECUTE 'GRANT SELECT, INSERT, DELETE, UPDATE ON TABLE public.development_logs_external_dependencies TO prisma_user';
        RAISE NOTICE 'Permissions granted to prisma_user';
    END IF;
END $$;

-- =========================================
-- STEP 8: Add Documentation
-- =========================================

COMMENT ON TABLE public.development_logs_external_dependencies IS
'Junction table establishing many-to-many relationships between development_logs and external_dependencies.
Enables tracking multiple external dependencies (libraries, packages, frameworks) used in each development log entry.
Replaces the previous one-to-one relationship via external_dependency_id column.';

COMMENT ON COLUMN public.development_logs_external_dependencies.id IS
'Primary key: Unique identifier for each relationship';

COMMENT ON COLUMN public.development_logs_external_dependencies.development_log_id IS
'Foreign key to development_logs table. CASCADE DELETE removes relationships when log is deleted.';

COMMENT ON COLUMN public.development_logs_external_dependencies.external_dependency_id IS
'Foreign key to external_dependencies table. CASCADE DELETE removes relationships when dependency is deleted.';

COMMENT ON COLUMN public.development_logs_external_dependencies.created_at IS
'Timestamp when this relationship was created.';

-- =========================================
-- STEP 9: Verification
-- =========================================

-- Verify table was created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'development_logs_external_dependencies'
    ) THEN
        RAISE WARNING 'Table creation verification failed: development_logs_external_dependencies table not found';
    ELSE
        RAISE NOTICE 'Success: development_logs_external_dependencies table created';
    END IF;
END $$;

-- Verify external_dependency_id column was dropped from development_logs
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'development_logs'
        AND column_name = 'external_dependency_id'
    ) THEN
        RAISE WARNING 'Column removal verification failed: external_dependency_id still exists in development_logs';
    ELSE
        RAISE NOTICE 'Success: external_dependency_id column removed from development_logs';
    END IF;
END $$;

-- =========================================
-- MIGRATION SUMMARY
-- =========================================
--
-- SCHEMA CHANGES:
--   - Created: development_logs_external_dependencies junction table
--   - Dropped: development_logs.external_dependency_id column
--   - Dropped: development_logs_external_dependencies_fk constraint
--
-- NEW RELATIONSHIP:
--   development_logs (*) ----< development_logs_external_dependencies >---- (*) external_dependencies
--
-- DATA ACCESS PATTERNS:
--
--   -- Get all external dependencies for a development log:
--   SELECT ed.*
--   FROM external_dependencies ed
--   JOIN development_logs_external_dependencies dled ON ed.id = dled.external_dependency_id
--   WHERE dled.development_log_id = 'uuid-here';
--
--   -- Add a new dependency to a development log:
--   INSERT INTO development_logs_external_dependencies (development_log_id, external_dependency_id)
--   VALUES ('dev-log-uuid', 1);
--
--   -- Get development logs using a specific dependency:
--   SELECT dl.*
--   FROM development_logs dl
--   JOIN development_logs_external_dependencies dled ON dl.id = dled.development_log_id
--   WHERE dled.external_dependency_id = 1;
--
