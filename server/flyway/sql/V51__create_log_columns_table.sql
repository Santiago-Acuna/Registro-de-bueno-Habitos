-- =========================================
-- V51: Create log_columns Table
-- =========================================
-- Description: Creates a table to store metadata about columns in various log tables.
--              This table serves as a registry defining the structure and data types
--              of columns that can be used across different log table implementations.
--              Each log_columns record defines a reusable column specification with
--              its name and data type.
--
-- Prerequisites:
--   - V50 migration must have been successfully applied (column_log_type enum exists)
--   - flyway_admin role exists with appropriate permissions
--   - prisma_user role exists for application-level access
--
-- Business Impact:
--   - Centralizes column metadata for log tables
--   - Enables dynamic log table structure management
--   - Provides type safety through column_log_type enum
--   - Facilitates standardization of log column definitions across the system
--   - Supports flexible log table schema evolution
--
-- Safety Measures:
--   - Primary key constraint ensures unique column definitions
--   - NOT NULL constraints prevent incomplete column definitions
--   - CHECK constraint validates name is not empty
--   - Defensive programming with existence checks
--
-- PostgreSQL Best Practices Applied:
--   - UUID primary key with automatic generation
--   - Proper constraint naming conventions
--   - Indexes for query performance optimization
--   - Comprehensive documentation via comments
--   - Permission grants following least privilege principle
-- =========================================

-- =========================================
-- STEP 1: Validate Prerequisites
-- =========================================
-- Ensure required types and roles exist before proceeding

-- Verify column_log_type enum exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type
        WHERE typname = 'column_log_type'
        AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND typtype = 'e'
    ) THEN
        RAISE EXCEPTION 'Prerequisites not met: column_log_type enum does not exist. V50 migration must be applied first.';
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

-- Verify prisma_user role exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_roles
        WHERE rolname = 'prisma_user'
    ) THEN
        RAISE WARNING 'prisma_user role does not exist. Table permission grants will be skipped.';
    END IF;
END $$;

-- =========================================
-- STEP 2: Create log_columns Table
-- =========================================
-- Create the table to store log column metadata

CREATE TABLE IF NOT EXISTS public.log_columns (
    -- Primary key: UUID with automatic generation
    id UUID NOT NULL DEFAULT gen_random_uuid(),

    -- Column name (TEXT for flexibility in naming)
    name TEXT NOT NULL,

    -- Column data type (enum for type safety)
    type public.column_log_type NOT NULL,

    -- Primary key constraint
    CONSTRAINT log_columns_pkey PRIMARY KEY (id),

    -- Check constraint to ensure name is not empty
    CONSTRAINT log_columns_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
)
TABLESPACE pg_default;

-- =========================================
-- STEP 3: Set Table Ownership
-- =========================================
-- Assign ownership to flyway_admin (following existing pattern)

ALTER TABLE public.log_columns OWNER TO flyway_admin;

-- =========================================
-- STEP 4: Create Indexes
-- =========================================
-- Add indexes for efficient querying

-- Create index for efficient name lookups
-- This supports queries filtering or sorting by column name
CREATE INDEX IF NOT EXISTS idx_log_columns_name
    ON public.log_columns USING btree (name);

-- Create index for efficient type-based queries
-- This supports queries filtering by column data type
CREATE INDEX IF NOT EXISTS idx_log_columns_type
    ON public.log_columns USING btree (type);

-- Create composite index for name and type lookups
-- This supports queries filtering by both name and type
CREATE INDEX IF NOT EXISTS idx_log_columns_name_type
    ON public.log_columns USING btree (name, type);

-- =========================================
-- STEP 5: Grant Permissions
-- =========================================
-- Grant appropriate permissions to prisma_user for application access

-- Grant full CRUD permissions to prisma_user (following existing pattern)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'prisma_user') THEN
        EXECUTE 'GRANT SELECT, INSERT, DELETE, UPDATE ON TABLE public.log_columns TO prisma_user';
        RAISE NOTICE 'Permissions granted to prisma_user';
    END IF;
END $$;

-- =========================================
-- STEP 6: Add Documentation
-- =========================================
-- Add comprehensive comments for table and columns

COMMENT ON TABLE public.log_columns IS
'Registry of column metadata for log tables in the system. This table stores
reusable column definitions that specify the name and data type of columns
that can be used across various log table implementations. It enables dynamic
log table structure management and standardization of column definitions.';

COMMENT ON COLUMN public.log_columns.id IS
'Primary key: Unique identifier for each log column definition';

COMMENT ON COLUMN public.log_columns.name IS
'Name of the log column. This is the column name that will be used in log tables.
Must be a non-empty string. No uniqueness constraint to allow reuse of column names
with different types across different contexts.';

COMMENT ON COLUMN public.log_columns.type IS
'Data type of the log column. Must be one of the values defined in column_log_type enum:
text, number, or boolean. This defines what kind of data this column can store.';

-- =========================================
-- STEP 7: Validation and Verification
-- =========================================
-- Verify the migration completed successfully

-- Verify table was created successfully
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'log_columns'
    ) THEN
        RAISE WARNING 'Table creation verification failed: log_columns table not found';
    ELSE
        RAISE NOTICE 'Success: log_columns table created';
    END IF;
END $$;

-- Verify all required columns exist with correct types
DO $$
BEGIN
    -- Verify id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'log_columns'
        AND column_name = 'id'
        AND udt_name = 'uuid'
        AND is_nullable = 'NO'
    ) THEN
        RAISE WARNING 'Column verification failed: id column not found or has incorrect type/nullability';
    ELSE
        RAISE NOTICE 'Success: id column verified';
    END IF;

    -- Verify name column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'log_columns'
        AND column_name = 'name'
        AND udt_name = 'text'
        AND is_nullable = 'NO'
    ) THEN
        RAISE WARNING 'Column verification failed: name column not found or has incorrect type/nullability';
    ELSE
        RAISE NOTICE 'Success: name column verified';
    END IF;

    -- Verify type column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'log_columns'
        AND column_name = 'type'
        AND is_nullable = 'NO'
    ) THEN
        RAISE WARNING 'Column verification failed: type column not found or has incorrect nullability';
    ELSE
        RAISE NOTICE 'Success: type column verified';
    END IF;
END $$;

-- Verify primary key constraint was created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'log_columns'
        AND constraint_name = 'log_columns_pkey'
        AND constraint_type = 'PRIMARY KEY'
    ) THEN
        RAISE WARNING 'Primary key constraint verification failed: log_columns_pkey not found';
    ELSE
        RAISE NOTICE 'Success: Primary key constraint log_columns_pkey created';
    END IF;
END $$;

-- Verify check constraint was created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'log_columns'
        AND constraint_name = 'log_columns_name_not_empty'
        AND constraint_type = 'CHECK'
    ) THEN
        RAISE WARNING 'Check constraint verification failed: log_columns_name_not_empty not found';
    ELSE
        RAISE NOTICE 'Success: Check constraint log_columns_name_not_empty created';
    END IF;
END $$;

-- Verify indexes were created
DO $$
BEGIN
    -- Verify name index
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'log_columns'
        AND indexname = 'idx_log_columns_name'
    ) THEN
        RAISE WARNING 'Index verification failed: idx_log_columns_name not found';
    ELSE
        RAISE NOTICE 'Success: Index idx_log_columns_name created';
    END IF;

    -- Verify type index
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'log_columns'
        AND indexname = 'idx_log_columns_type'
    ) THEN
        RAISE WARNING 'Index verification failed: idx_log_columns_type not found';
    ELSE
        RAISE NOTICE 'Success: Index idx_log_columns_type created';
    END IF;

    -- Verify composite index
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'log_columns'
        AND indexname = 'idx_log_columns_name_type'
    ) THEN
        RAISE WARNING 'Index verification failed: idx_log_columns_name_type not found';
    ELSE
        RAISE NOTICE 'Success: Index idx_log_columns_name_type created';
    END IF;
END $$;

-- Verify table ownership
DO $$
DECLARE
    table_owner TEXT;
BEGIN
    SELECT tableowner
    INTO table_owner
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'log_columns';

    IF table_owner = 'flyway_admin' THEN
        RAISE NOTICE 'Success: Table ownership verified - owned by flyway_admin';
    ELSE
        RAISE WARNING 'Ownership verification failed: Expected flyway_admin, found %', table_owner;
    END IF;
END $$;

-- =========================================
-- MIGRATION SUMMARY AND USAGE NOTES
-- =========================================
-- This migration creates a table to store log column metadata:
--
-- 1. SCHEMA CHANGES APPLIED:
--    - Created table: public.log_columns
--    - Columns:
--      * id: UUID NOT NULL DEFAULT gen_random_uuid() (PRIMARY KEY)
--      * name: TEXT NOT NULL (column name)
--      * type: column_log_type NOT NULL (data type from enum)
--    - Constraints:
--      * log_columns_pkey: Primary key on id
--      * log_columns_name_not_empty: Check constraint on name
--    - Indexes:
--      * idx_log_columns_name: Btree index on name
--      * idx_log_columns_type: Btree index on type
--      * idx_log_columns_name_type: Composite btree index on (name, type)
--    - Ownership: flyway_admin
--    - Permissions: SELECT, INSERT, DELETE, UPDATE granted to prisma_user
--
-- 2. TABLE PURPOSE AND DESIGN:
--    - Stores reusable column definitions for log tables
--    - name field is TEXT (not VARCHAR) for maximum flexibility
--    - No uniqueness constraint on name to allow same column name with different types
--    - type field uses column_log_type enum for type safety
--    - UUID primary key for distributed system compatibility
--
-- 3. DATA ACCESS PATTERNS:
--    - Create a new log column definition:
--      INSERT INTO log_columns (name, type)
--      VALUES ('description', 'text'::column_log_type);
--
--    - Get all log columns:
--      SELECT * FROM log_columns
--      ORDER BY name;
--
--    - Get all columns of a specific type:
--      SELECT * FROM log_columns
--      WHERE type = 'number'::column_log_type;
--
--    - Find columns by name:
--      SELECT * FROM log_columns
--      WHERE name = 'status';
--
--    - Find columns by name and type:
--      SELECT * FROM log_columns
--      WHERE name = 'count' AND type = 'number'::column_log_type;
--
--    - Update a column definition:
--      UPDATE log_columns
--      SET type = 'boolean'::column_log_type
--      WHERE id = ?;
--
--    - Delete a column definition:
--      DELETE FROM log_columns
--      WHERE id = ?;
--
-- 4. INDEX STRATEGY:
--    - idx_log_columns_name: Optimizes queries filtering/sorting by name
--    - idx_log_columns_type: Optimizes queries filtering by type
--    - idx_log_columns_name_type: Optimizes queries filtering by both name and type
--    - All indexes use btree for range queries and equality comparisons
--
-- 5. CONSTRAINTS AND VALIDATION:
--    - id must be a valid UUID (auto-generated by default)
--    - name must be non-empty after trimming whitespace
--    - type must be a valid column_log_type enum value (text, number, boolean)
--    - No uniqueness constraint on (name, type) to allow flexibility
--
-- 6. PERFORMANCE CONSIDERATIONS:
--    - Indexes provide O(log n) lookup time for common query patterns
--    - Composite index on (name, type) supports multi-column filtering efficiently
--    - UUID primary key ensures global uniqueness and distributed system compatibility
--    - Minimal overhead - table expected to have relatively small cardinality
--
-- 7. BUSINESS LOGIC IMPLICATIONS:
--    - Column definitions are reusable across different log tables
--    - Same column name can exist with different types (e.g., "status" as text or number)
--    - Application layer can enforce additional business rules if needed
--    - Supports dynamic log table schema evolution
--    - Centralizes column metadata for consistency across the system
--
-- 8. EXAMPLE USE CASES:
--    -- Define standard log columns
--    INSERT INTO log_columns (name, type) VALUES
--        ('description', 'text'::column_log_type),
--        ('quantity', 'number'::column_log_type),
--        ('is_completed', 'boolean'::column_log_type),
--        ('notes', 'text'::column_log_type),
--        ('duration_minutes', 'number'::column_log_type),
--        ('is_successful', 'boolean'::column_log_type);
--
--    -- Query all text-type columns
--    SELECT name FROM log_columns
--    WHERE type = 'text'::column_log_type;
--
--    -- Find all column definitions for "status"
--    SELECT id, name, type FROM log_columns
--    WHERE name = 'status';
--
-- 9. INTEGRATION WITH OTHER TABLES:
--    - This table can be referenced by other tables that define log table schemas
--    - Future migrations may add foreign key relationships to this table
--    - Supports building dynamic log table structures
--    - Enables metadata-driven log table generation
--
-- 10. ROLLBACK PROCEDURE (If Needed):
--    -- WARNING: Only execute if no other tables reference log_columns
--    -- Check for foreign key dependencies first:
--    SELECT
--        tc.table_schema,
--        tc.table_name,
--        kcu.column_name,
--        ccu.table_name AS foreign_table_name,
--        ccu.column_name AS foreign_column_name
--    FROM information_schema.table_constraints AS tc
--    JOIN information_schema.key_column_usage AS kcu
--        ON tc.constraint_name = kcu.constraint_name
--    JOIN information_schema.constraint_column_usage AS ccu
--        ON ccu.constraint_name = tc.constraint_name
--    WHERE tc.constraint_type = 'FOREIGN KEY'
--        AND ccu.table_name = 'log_columns';
--
--    -- If no dependencies exist, drop the table:
--    DROP INDEX IF EXISTS public.idx_log_columns_name_type;
--    DROP INDEX IF EXISTS public.idx_log_columns_type;
--    DROP INDEX IF EXISTS public.idx_log_columns_name;
--    DROP TABLE IF EXISTS public.log_columns CASCADE;
--
-- 11. MAINTENANCE NOTES:
--    - Monitor query performance on name and type lookups
--    - Regular ANALYZE on table maintains index statistics
--    - Consider adding unique constraint on (name, type) if business rules change
--    - Ensure application handles column definitions appropriately
--    - Future migrations may add relationships to this table
--    - Document column naming conventions in application layer
--
-- 12. FUTURE ENHANCEMENTS:
--    - Could add validation rules or default values columns
--    - Could add description or metadata fields
--    - Could add relationships to log_types table
--    - Could add constraints like min/max values for number types
--    - Could add ordering or grouping metadata
--
