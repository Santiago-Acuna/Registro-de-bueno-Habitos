-- =========================================
-- V68: Create procrastinating_when_i_wake_up Table
-- =========================================
-- Description: Creates the procrastinating_when_i_wake_up table to log habit
--              entries that track how many minutes were spent procrastinating
--              after waking up. Each row corresponds to exactly one action_logs
--              entry (one-to-one relationship enforced by a UNIQUE constraint on
--              action_id).
--
-- Prerequisites:
--   - V1  migration: action_logs table exists (originally created as actions)
--   - V24 migration: actions table renamed to action_logs
--   - V29 migration: action_logs primary key constraint renamed
--   - flyway_admin role exists with appropriate permissions
--   - prisma_user role exists for application-level access
--
-- Business Impact:
--   - Enables the application to record and analyse how many minutes are lost to
--     morning procrastination per action session
--   - The one-to-one link with action_logs preserves the standard time-window
--     (start_time / end_time / duration_seconds) already stored there, so this
--     table only holds the domain-specific payload (minutes)
--   - minutes column carries a positive-integer CHECK constraint to prevent
--     nonsensical values at the database layer
--
-- Safety Measures:
--   - CREATE TABLE IF NOT EXISTS prevents duplicate-creation errors on re-run
--   - Defensive DO $$ blocks guard prerequisite checks and optional permission grants
--   - All constraints are explicitly named following project conventions
--   - Additive change: no existing tables or data are modified
--
-- PostgreSQL Best Practices Applied:
--   - UUID primary key using gen_random_uuid() (no external extension required)
--   - TIMESTAMPTZ for all timestamp columns (timezone-aware)
--   - Named constraints for every PRIMARY KEY, FOREIGN KEY, UNIQUE, and CHECK
--   - BEFORE UPDATE trigger reuses the existing update_updated_at_column() function
--   - TABLESPACE pg_default declared explicitly
--   - snake_case identifiers throughout
--   - COMMENT ON TABLE/COLUMN for self-documenting schema
-- =========================================


-- =========================================
-- STEP 1: Validate Prerequisites
-- =========================================

-- Verify action_logs table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'action_logs'
    ) THEN
        RAISE EXCEPTION 'Prerequisites not met: action_logs table does not exist. V24 migration must be applied first.';
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

-- Verify prisma_user role exists (non-fatal: permissions will be skipped if absent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_roles
        WHERE rolname = 'prisma_user'
    ) THEN
        RAISE WARNING 'prisma_user role does not exist. Permission grants will be skipped.';
    END IF;
END $$;

-- Verify update_updated_at_column() function exists (required for the trigger)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
        AND p.proname = 'update_updated_at_column'
    ) THEN
        RAISE EXCEPTION 'Prerequisites not met: function public.update_updated_at_column() does not exist. V1 migration must be applied first.';
    END IF;
END $$;


-- =========================================
-- STEP 2: Create Table
-- =========================================

CREATE TABLE IF NOT EXISTS public.procrastinating_when_i_wake_up (
    -- Primary key: UUID with automatic generation
    id UUID NOT NULL DEFAULT gen_random_uuid(),

    -- Domain payload: number of minutes spent procrastinating after waking up
    minutes INTEGER NOT NULL,

    -- Foreign key to action_logs (one-to-one: one session = one log entry)
    action_id UUID NOT NULL,

    -- Audit timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Primary key constraint
    CONSTRAINT procrastinating_when_i_wake_up_pkey PRIMARY KEY (id),

    -- Minutes must be a positive integer
    CONSTRAINT procrastinating_when_i_wake_up_minutes_positive
        CHECK (minutes > 0)
)
TABLESPACE pg_default;


-- =========================================
-- STEP 3: Set Table Ownership
-- =========================================

ALTER TABLE public.procrastinating_when_i_wake_up OWNER TO flyway_admin;


-- =========================================
-- STEP 4: Add Foreign Key Constraint
-- =========================================

ALTER TABLE public.procrastinating_when_i_wake_up
    ADD CONSTRAINT fk_procrastinating_when_i_wake_up_action_id
        FOREIGN KEY (action_id)
        REFERENCES public.action_logs (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE;


-- =========================================
-- STEP 5: Enforce One-to-One Relationship with action_logs
-- =========================================

ALTER TABLE public.procrastinating_when_i_wake_up
    ADD CONSTRAINT procrastinating_when_i_wake_up_action_id_unique
        UNIQUE (action_id);


-- =========================================
-- STEP 6: Create Indexes
-- =========================================

-- Index on action_id to support the FK lookup and the unique constraint scan
CREATE INDEX IF NOT EXISTS idx_procrastinating_when_i_wake_up_action_id
    ON public.procrastinating_when_i_wake_up USING btree (action_id);

-- Index on minutes to support range queries (e.g., "show sessions > 30 min")
CREATE INDEX IF NOT EXISTS idx_procrastinating_when_i_wake_up_minutes
    ON public.procrastinating_when_i_wake_up USING btree (minutes);


-- =========================================
-- STEP 7: Add updated_at Trigger
-- =========================================

CREATE TRIGGER update_procrastinating_when_i_wake_up_updated_at
    BEFORE UPDATE ON public.procrastinating_when_i_wake_up
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();


-- =========================================
-- STEP 8: Grant Permissions
-- =========================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'prisma_user') THEN
        EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE
                 ON TABLE public.procrastinating_when_i_wake_up
                 TO prisma_user';
        RAISE NOTICE 'Permissions granted to prisma_user';
    END IF;
END $$;


-- =========================================
-- STEP 9: Add Documentation
-- =========================================

COMMENT ON TABLE public.procrastinating_when_i_wake_up IS
'Logs how many minutes were spent procrastinating after waking up for each
habit action session. Each row maps one-to-one to a row in action_logs via
the action_id column (enforced by a UNIQUE constraint). The temporal context
(start_time, end_time, duration_seconds) is stored in action_logs; this table
holds only the domain-specific payload.';

COMMENT ON COLUMN public.procrastinating_when_i_wake_up.id IS
'Primary key: unique identifier for each procrastination log entry.
Generated automatically via gen_random_uuid().';

COMMENT ON COLUMN public.procrastinating_when_i_wake_up.minutes IS
'Number of minutes spent procrastinating after waking up during this session.
Must be a positive integer (> 0). Stored as INTEGER because sub-minute
granularity is not required for this habit.';

COMMENT ON COLUMN public.procrastinating_when_i_wake_up.action_id IS
'Foreign key to public.action_logs(id). Enforced as UNIQUE to maintain a
one-to-one relationship: every action session can have at most one
procrastination log entry. Cascades on UPDATE and DELETE.';

COMMENT ON COLUMN public.procrastinating_when_i_wake_up.created_at IS
'Timestamp when this log entry was first inserted. Timezone-aware (TIMESTAMPTZ).';

COMMENT ON COLUMN public.procrastinating_when_i_wake_up.updated_at IS
'Timestamp of the last update to this row. Automatically maintained by the
update_procrastinating_when_i_wake_up_updated_at BEFORE UPDATE trigger.';


-- =========================================
-- STEP 10: Verification
-- =========================================

-- Verify table was created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'procrastinating_when_i_wake_up'
    ) THEN
        RAISE WARNING 'Table creation verification failed: procrastinating_when_i_wake_up table not found';
    ELSE
        RAISE NOTICE 'Success: procrastinating_when_i_wake_up table created';
    END IF;
END $$;

-- Verify action_id unique constraint exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'procrastinating_when_i_wake_up'
        AND constraint_name = 'procrastinating_when_i_wake_up_action_id_unique'
        AND constraint_type = 'UNIQUE'
    ) THEN
        RAISE WARNING 'Constraint verification failed: procrastinating_when_i_wake_up_action_id_unique not found';
    ELSE
        RAISE NOTICE 'Success: action_id unique constraint verified';
    END IF;
END $$;

-- Verify minutes CHECK constraint exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'procrastinating_when_i_wake_up'
        AND constraint_name = 'procrastinating_when_i_wake_up_minutes_positive'
        AND constraint_type = 'CHECK'
    ) THEN
        RAISE WARNING 'Constraint verification failed: procrastinating_when_i_wake_up_minutes_positive not found';
    ELSE
        RAISE NOTICE 'Success: minutes positive CHECK constraint verified';
    END IF;
END $$;


-- =========================================
-- MIGRATION SUMMARY
-- =========================================
--
-- SCHEMA CHANGES:
--   - Created: public.procrastinating_when_i_wake_up
--       Columns : id, minutes, action_id, created_at, updated_at
--       PK      : procrastinating_when_i_wake_up_pkey (id)
--       FK      : fk_procrastinating_when_i_wake_up_action_id -> action_logs(id)
--       UNIQUE  : procrastinating_when_i_wake_up_action_id_unique (action_id)
--       CHECK   : procrastinating_when_i_wake_up_minutes_positive (minutes > 0)
--       Trigger : update_procrastinating_when_i_wake_up_updated_at (BEFORE UPDATE)
--       Indexes : idx_procrastinating_when_i_wake_up_action_id
--                 idx_procrastinating_when_i_wake_up_minutes
--
-- RELATIONSHIP DIAGRAM:
--   action_logs (1) ---< procrastinating_when_i_wake_up (0..1)
--   (one action session may have zero or one procrastination log entry)
--
-- COMMON QUERY PATTERNS:
--
--   -- Get all procrastination logs with their action date:
--   SELECT p.id, p.minutes, al.action_date, al.duration_seconds
--   FROM public.procrastinating_when_i_wake_up p
--   JOIN public.action_logs al ON al.id = p.action_id
--   ORDER BY al.action_date DESC;
--
--   -- Average procrastination minutes per day:
--   SELECT al.action_date, AVG(p.minutes)::NUMERIC(5,2) AS avg_minutes
--   FROM public.procrastinating_when_i_wake_up p
--   JOIN public.action_logs al ON al.id = p.action_id
--   GROUP BY al.action_date
--   ORDER BY al.action_date DESC;
--
-- ROLLBACK PROCEDURE (if needed):
--   DROP TABLE IF EXISTS public.procrastinating_when_i_wake_up;
--
