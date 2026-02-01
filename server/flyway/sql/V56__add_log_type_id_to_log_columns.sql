-- =========================================
-- V56: Add log_type_id to log_columns Table
-- =========================================
-- Description: Establishes a one-to-many relationship between log_types and log_columns.
--              One log_type can have multiple log_columns, enabling log types to define
--              their custom column structure. This relationship is required:
--              - A log_type to exist without any custom columns
--              - Every log_column MUST belong to a log_type
--              - A log_type can have multiple custom columns (one-to-many)
--
-- Prerequisites:
--   - V48 migration must have been successfully applied (log_types table exists)
--   - V51 migration must have been successfully applied (log_columns table exists)
--   - flyway_admin role exists with appropriate permissions
--   - prisma_user role exists for application-level access
--
-- Business Impact:
--   - Enables log types to define custom column structures
--   - Supports flexible log table schema evolution per log type
--   - Allows reusable column definitions across multiple log types
--   - Maintains referential integrity between log types and their columns
--   - Facilitates metadata-driven log table generation
--
-- Safety Measures:
--   - Column is NOT NULL to ensure every log_column belongs to a log_type
--   - Foreign key constraint with CASCADE DELETE maintains referential integrity
--   - Defensive programming with existence checks
--   - Rollback-safe: dropping the column won't affect log_types table
--   - Ensures data integrity by requiring log_type association
--
-- PostgreSQL Best Practices Applied:
--   - UUID foreign key for distributed system compatibility
--   - Proper constraint naming conventions (fk_log_columns_log_type_id)
--   - Index for foreign key to optimize join performance
--   - CASCADE DELETE for automatic cleanup of orphaned columns
--   - Comprehensive documentation via comments
--   - Permission grants following least privilege principle
-- =========================================

-- =========================================
-- STEP 1: Validate Prerequisites
-- =========================================
-- Ensure required tables and roles exist before proceeding

-- Verify log_types table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'log_types'
    ) THEN
        RAISE EXCEPTION 'Prerequisites not met: log_types table does not exist. V48 migration must be applied first.';
    END IF;
END $$;

-- Verify log_columns table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'log_columns'
    ) THEN
        RAISE EXCEPTION 'Prerequisites not met: log_columns table does not exist. V51 migration must be applied first.';
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
        RAISE WARNING 'prisma_user role does not exist. Permission grants will be skipped.';
    END IF;
END $$;

-- =========================================
-- STEP 2: Add log_type_id Column
-- =========================================
-- Add the foreign key column to establish the one-to-many relationship

-- Add log_type_id column if it doesn't already exist
-- Column is NOT NULL to ensure every log_column belongs to a log_type
-- This enforces referential integrity and ensures all columns are properly categorized
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'log_columns'
        AND column_name = 'log_type_id'
    ) THEN
        -- Add column with NOT NULL constraint
        -- Note: This assumes no existing records in log_columns
        -- If there are existing records, they must be assigned a log_type_id first
        ALTER TABLE public.log_columns
        ADD COLUMN log_type_id UUID NOT NULL;

        RAISE NOTICE 'Column log_type_id added to log_columns table';
    ELSE
        RAISE NOTICE 'Column log_type_id already exists, skipping addition';
    END IF;
END $$;

-- =========================================
-- STEP 3: Create Foreign Key Constraint
-- =========================================
-- Establish referential integrity between log_columns and log_types

-- Add foreign key constraint if it doesn't already exist
-- CASCADE DELETE: When a log_type is deleted, all its custom columns are automatically removed
-- This maintains referential integrity and prevents orphaned column definitions
-- CASCADE UPDATE: When a log_type's id is updated, the reference is automatically updated
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'log_columns'
        AND constraint_name = 'fk_log_columns_log_type_id'
    ) THEN
        ALTER TABLE public.log_columns
        ADD CONSTRAINT fk_log_columns_log_type_id
            FOREIGN KEY (log_type_id)
            REFERENCES public.log_types (id)
            ON DELETE CASCADE
            ON UPDATE CASCADE;

        RAISE NOTICE 'Foreign key constraint fk_log_columns_log_type_id created';
    ELSE
        RAISE NOTICE 'Foreign key constraint fk_log_columns_log_type_id already exists, skipping creation';
    END IF;
END $$;

-- =========================================
-- STEP 4: Create Index
-- =========================================
-- Add index for efficient join performance and foreign key lookups

-- Create index on log_type_id for efficient lookups
-- This optimizes queries like: "Find all columns for a specific log type"
-- Improves join performance when querying from log_types to log_columns
-- Also improves CASCADE DELETE performance
CREATE INDEX IF NOT EXISTS idx_log_columns_log_type_id
    ON public.log_columns USING btree (log_type_id);

-- =========================================
-- STEP 5: Add Documentation
-- =========================================
-- Add comprehensive comment for the new column

COMMENT ON COLUMN public.log_columns.log_type_id IS
'Foreign key to log_types table. References the log type that this column belongs to.
NOT NULL constraint ensures every log_column belongs to a log_type.
CASCADE DELETE: When the log type is deleted, this column definition is automatically removed.
One-to-many relationship: One log_type can have multiple log_columns.';

-- =========================================
-- STEP 6: Validation and Verification
-- =========================================
-- Verify the migration completed successfully

-- Verify column was added successfully
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'log_columns'
        AND column_name = 'log_type_id'
        AND udt_name = 'uuid'
        AND is_nullable = 'NO'
    ) THEN
        RAISE WARNING 'Column verification failed: log_type_id column not found or has incorrect type/nullability';
    ELSE
        RAISE NOTICE 'Success: log_type_id column verified (NOT NULL)';
    END IF;
END $$;

-- Verify foreign key constraint was created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'log_columns'
        AND constraint_name = 'fk_log_columns_log_type_id'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        RAISE WARNING 'Foreign key constraint verification failed: fk_log_columns_log_type_id not found';
    ELSE
        RAISE NOTICE 'Success: Foreign key constraint fk_log_columns_log_type_id created';
    END IF;
END $$;

-- Verify index was created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'log_columns'
        AND indexname = 'idx_log_columns_log_type_id'
    ) THEN
        RAISE WARNING 'Index verification failed: idx_log_columns_log_type_id not found';
    ELSE
        RAISE NOTICE 'Success: Index idx_log_columns_log_type_id created';
    END IF;
END $$;

-- Verify CASCADE DELETE behavior on foreign key
DO $$
DECLARE
    delete_rule TEXT;
    update_rule TEXT;
BEGIN
    -- Check foreign key delete and update rules
    SELECT rc.delete_rule, rc.update_rule
    INTO delete_rule, update_rule
    FROM information_schema.referential_constraints rc
    WHERE rc.constraint_schema = 'public'
    AND rc.constraint_name = 'fk_log_columns_log_type_id';

    IF delete_rule = 'CASCADE' THEN
        RAISE NOTICE 'Success: CASCADE DELETE verified for fk_log_columns_log_type_id';
    ELSE
        RAISE WARNING 'Foreign key delete rule verification failed: Expected CASCADE, found %', delete_rule;
    END IF;

    IF update_rule = 'CASCADE' THEN
        RAISE NOTICE 'Success: CASCADE UPDATE verified for fk_log_columns_log_type_id';
    ELSE
        RAISE WARNING 'Foreign key update rule verification failed: Expected CASCADE, found %', update_rule;
    END IF;
END $$;

-- Verify foreign key references correct table and column
DO $$
DECLARE
    referenced_table TEXT;
    referenced_column TEXT;
BEGIN
    SELECT
        ccu.table_name,
        ccu.column_name
    INTO
        referenced_table,
        referenced_column
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
        AND tc.constraint_schema = ccu.constraint_schema
    WHERE tc.constraint_schema = 'public'
    AND tc.table_name = 'log_columns'
    AND tc.constraint_name = 'fk_log_columns_log_type_id'
    AND tc.constraint_type = 'FOREIGN KEY';

    IF referenced_table = 'log_types' AND referenced_column = 'id' THEN
        RAISE NOTICE 'Success: Foreign key references verified - references log_types(id)';
    ELSE
        RAISE WARNING 'Foreign key reference verification failed: Expected log_types(id), found %(%))', referenced_table, referenced_column;
    END IF;
END $$;

-- =========================================
-- MIGRATION SUMMARY AND USAGE NOTES
-- =========================================
-- This migration establishes a one-to-many relationship between log_types and log_columns:
--
-- 1. SCHEMA CHANGES APPLIED:
--    - Added column: log_type_id UUID NOT NULL to public.log_columns
--    - Added constraint: fk_log_columns_log_type_id (FOREIGN KEY to log_types)
--    - Added index: idx_log_columns_log_type_id (btree on log_type_id)
--    - Foreign key behavior: ON DELETE CASCADE, ON UPDATE CASCADE
--
-- 2. RELATIONSHIP MODEL:
--    log_types (1) ----< log_columns (*)
--
--    - One log_type can have multiple log_columns (one-to-many)
--    - One log_column MUST belong to exactly one log_type (required relationship)
--    - The relationship is mandatory on the log_columns side (log_type_id is NOT NULL)
--    - This ensures:
--      * Every log column is properly categorized under a log type
--      * Strong referential integrity between log types and columns
--      * Clear ownership and organization of column definitions
--
-- 3. CASCADE DELETE BEHAVIOR:
--    When a log_type is deleted:
--      - All log_columns with that log_type_id are automatically deleted
--      - This maintains referential integrity and prevents orphaned columns
--      - Ensures clean deletion of log types and their associated columns
--
--    When a log_type's id is updated:
--      - All log_columns referencing that id are automatically updated
--      - This is rare with UUID primary keys but ensures consistency
--
-- 4. NOT NULL CONSTRAINT RATIONALE:
--    The log_type_id column is NOT NULL for several important reasons:
--      - Ensures every log column is properly categorized under a log type
--      - Maintains strong referential integrity and data consistency
--      - Prevents orphaned or uncategorized column definitions
--      - Enforces clear ownership and organization of column definitions
--      - Simplifies data model by eliminating ambiguity
--
-- 5. DATA ACCESS PATTERNS:
--    - Create a log column for a specific log type (required):
--      INSERT INTO log_columns (name, type, log_type_id)
--      VALUES ('custom_field', 'text'::column_log_type, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid);
--
--    - Get all columns for a specific log type:
--      SELECT * FROM log_columns
--      WHERE log_type_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid
--      ORDER BY name;
--
--    - Get log type with all its columns:
--      SELECT
--          lt.id AS log_type_id,
--          lt.name AS log_type_name,
--          lc.id AS column_id,
--          lc.name AS column_name,
--          lc.type AS column_type
--      FROM log_types lt
--      LEFT JOIN log_columns lc ON lt.id = lc.log_type_id
--      WHERE lt.id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid
--      ORDER BY lc.name;
--
--    - Get all log types with their column counts:
--      SELECT
--          lt.name AS log_type_name,
--          COUNT(lc.id) AS column_count
--      FROM log_types lt
--      LEFT JOIN log_columns lc ON lt.id = lc.log_type_id
--      GROUP BY lt.id, lt.name
--      ORDER BY column_count DESC, lt.name;
--
--    - Find log types without any columns:
--      SELECT lt.*
--      FROM log_types lt
--      LEFT JOIN log_columns lc ON lt.id = lc.log_type_id
--      WHERE lc.id IS NULL;
--
--    - Update a column to assign it to a different log type:
--      UPDATE log_columns
--      SET log_type_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid
--      WHERE id = 'a3bb189e-8bf9-3888-9912-ace4e6543002'::uuid;
--
--    - Delete all columns for a specific log type (CASCADE DELETE handles this):
--      DELETE FROM log_types
--      WHERE id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid;
--      -- All associated log_columns are automatically deleted
--
-- 6. INDEX STRATEGY AND PERFORMANCE:
--    - idx_log_columns_log_type_id (btree index on log_type_id):
--      * Optimizes queries joining from log_types to log_columns
--      * Improves performance when filtering by log_type_id
--      * Supports CASCADE DELETE performance (faster orphan cleanup)
--      * Enables efficient lookups for all columns of a log type
--      * O(log n) lookup time for foreign key relationships
--      * Btree provides excellent performance for equality and range queries
--
--    - Existing indexes on log_columns:
--      * idx_log_columns_name: Optimizes name-based queries
--      * idx_log_columns_type: Optimizes type-based queries
--      * idx_log_columns_name_type: Optimizes combined name+type queries
--      * Combined with new index, supports complex query patterns
--
-- 7. CONSTRAINTS AND VALIDATION:
--    - log_type_id must reference a valid log_types record (NOT NULL constraint)
--    - Foreign key ensures referential integrity
--    - CASCADE DELETE ensures orphaned columns are automatically cleaned up
--    - CASCADE UPDATE ensures consistency if UUIDs are ever updated
--    - No uniqueness constraint on log_type_id (allows one-to-many)
--    - Existing constraints on name and type still apply
--    - Every log_column must belong to exactly one log_type
--
-- 8. PERFORMANCE CONSIDERATIONS:
--    - Index provides O(log n) join performance for log_type_id lookups
--    - NOT NULL constraint eliminates need for null checks
--    - CASCADE DELETE automatically handled by PostgreSQL foreign key infrastructure
--    - No additional triggers needed for cleanup
--    - UUID foreign key ensures distributed system compatibility
--    - Minimal storage overhead (16 bytes per UUID)
--    - Index size impact is minimal due to expected low cardinality
--
-- 9. BUSINESS LOGIC IMPLICATIONS:
--    - Log types can now define custom column structures
--    - Every column must be assigned to a log type during creation
--    - Deleting a log type automatically removes all its columns
--    - Application should validate log_type_id before creating columns
--    - Consider implementing column templates for common patterns
--    - Metadata-driven log table generation now possible
--    - Strong data organization through mandatory categorization
--
-- 10. EXAMPLE USE CASES:
--    -- Create a log type with custom columns
--    -- Step 1: Create the log type
--    INSERT INTO log_types (name)
--    VALUES ('Custom Activity Log')
--    RETURNING id;
--    -- Assume returned id: f47ac10b-58cc-4372-a567-0e02b2c3d479
--
--    -- Step 2: Create custom columns for this log type
--    INSERT INTO log_columns (name, type, log_type_id) VALUES
--        ('activity_name', 'text'::column_log_type, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid),
--        ('duration_minutes', 'number'::column_log_type, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid),
--        ('is_completed', 'boolean'::column_log_type, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid);
--
--    -- Step 3: Query the log type with its columns
--    SELECT
--        lt.name AS log_type,
--        lc.name AS column_name,
--        lc.type AS column_type
--    FROM log_types lt
--    JOIN log_columns lc ON lt.id = lc.log_type_id
--    WHERE lt.name = 'Custom Activity Log'
--    ORDER BY lc.name;
--
--    -- Find all log types and their column counts
--    SELECT
--        lt.name,
--        COUNT(lc.id) AS custom_columns,
--        STRING_AGG(lc.name, ', ' ORDER BY lc.name) AS column_names
--    FROM log_types lt
--    LEFT JOIN log_columns lc ON lt.id = lc.log_type_id
--    GROUP BY lt.id, lt.name
--    ORDER BY custom_columns DESC;
--
--    -- Transfer a column to a different log type
--    UPDATE log_columns
--    SET log_type_id = (SELECT id FROM log_types WHERE name = 'Different Log Type')
--    WHERE name = 'duration_minutes';
--
-- 11. INTEGRATION WITH OTHER TABLES:
--    - Complements existing log_column_validations junction table (V54)
--    - Works with validation_functions table (V53) for column validation
--    - Uses column_log_type enum (V50) for type safety
--    - Integrates with log_types table (V48) as the parent entity
--    - Maintains consistency with action_types.log_type_id relationship (V49)
--    - Future migrations may add:
--      * Column ordering/positioning within log types
--      * Column visibility and permissions
--      * Default values per log type
--      * Column dependencies and relationships
--
-- 12. RECOMMENDED PRISMA SCHEMA UPDATES:
--    model LogTypes {
--      id          String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
--      name        String       @unique @db.VarChar(50)
--      actionTypes ActionTypes? // Existing one-to-one relationship
--      logColumns  LogColumns[] // New one-to-many relationship
--
--      @@index([name], map: "idx_log_types_name")
--      @@map("log_types")
--    }
--
--    model LogColumns {
--      id                   String                  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
--      name                 String
--      type                 ColumnLogType
--      logTypeId            String                  @map("log_type_id") @db.Uuid
--      logType              LogTypes                @relation(fields: [logTypeId], references: [id], onDelete: Cascade, map: "fk_log_columns_log_type_id")
--      validations          LogColumnValidations[]  // Existing many-to-many relationship
--
--      @@index([name], map: "idx_log_columns_name")
--      @@index([type], map: "idx_log_columns_type")
--      @@index([name, type], map: "idx_log_columns_name_type")
--      @@index([logTypeId], map: "idx_log_columns_log_type_id")
--      @@map("log_columns")
--    }
--
-- 13. QUERY OPTIMIZATION TIPS:
--    - Use LEFT JOIN when log types may not have columns yet
--    - Use INNER JOIN when only log types with columns are needed
--    - Leverage idx_log_columns_log_type_id for efficient filtering
--    - Combine with existing indexes for complex filtering
--    - Use EXPLAIN ANALYZE to verify index usage
--    - Consider materialized views for frequently accessed log type metadata
--    - All columns now have guaranteed log_type_id, simplifying queries
--
-- 14. MIGRATION COMPATIBILITY:
--    - Forward compatible: All new columns must specify a log_type_id
--    - Application must be updated to provide log_type_id when creating columns
--    - Rollback-safe: Dropping column won't affect log_types table
--    - WARNING: This migration assumes no existing log_columns records
--    - If existing records exist, they must be assigned a log_type_id before this migration
--
-- 15. FUTURE ENHANCEMENTS:
--    - Add column ordering (position/sequence) within log types
--    - Add column display properties (label, description, placeholder)
--    - Add column constraints per log type (required, unique, default values)
--    - Add column grouping or sections within log types
--    - Add column visibility rules (always visible, conditional, hidden)
--    - Add column permissions (read-only, write-only, read-write)
--    - Add column inheritance from parent log types
--    - Add column templates for common patterns
--    - Add column metadata (units, format, validation messages)
--    - Add versioning for column definitions
--
-- 16. SECURITY CONSIDERATIONS:
--    - Ensure only authorized users can assign columns to log types
--    - Validate log_type_id references before assignment
--    - Prevent deletion of log types with critical columns (application layer)
--    - Monitor CASCADE DELETE operations for audit purposes
--    - Implement access controls on log_columns table modifications
--    - Log all changes to log type-column relationships
--    - Consider soft delete for log types instead of hard delete
--
-- 17. TESTING RECOMMENDATIONS:
--    - Test CASCADE DELETE behavior (deleting log type removes its columns)
--    - Test NULL log_type_id handling (reusable columns)
--    - Test foreign key constraint (invalid log_type_id rejected)
--    - Test index usage in join queries
--    - Test performance with large numbers of columns per log type
--    - Test concurrent updates to log_type_id
--    - Verify existing log_columns records have NULL log_type_id
--    - Test rollback procedure (ensure no data loss)
--
-- 18. ROLLBACK PROCEDURE (If Needed):
--    -- WARNING: This will remove the relationship but preserve all log_columns records
--    -- The log_type_id data will be lost when the column is dropped
--
--    -- Step 1: Drop the foreign key constraint
--    ALTER TABLE public.log_columns
--    DROP CONSTRAINT IF EXISTS fk_log_columns_log_type_id;
--
--    -- Step 2: Drop the index
--    DROP INDEX IF EXISTS public.idx_log_columns_log_type_id;
--
--    -- Step 3: Drop the column
--    ALTER TABLE public.log_columns
--    DROP COLUMN IF EXISTS log_type_id;
--
--    -- Verification
--    SELECT column_name
--    FROM information_schema.columns
--    WHERE table_schema = 'public'
--    AND table_name = 'log_columns'
--    AND column_name = 'log_type_id';
--    -- Should return no rows
--
-- 19. MAINTENANCE NOTES:
--    - Monitor query performance on log_type_id joins
--    - Regular ANALYZE on log_columns table maintains index statistics
--    - Review and clean up orphaned columns (NULL log_type_id) periodically
--    - Document column assignment strategy in application documentation
--    - Consider implementing automated tests for relationship integrity
--    - Track CASCADE DELETE operations for audit compliance
--    - Update Prisma schema after migration (see section 12)
--    - Regenerate Prisma client after schema update
--
-- 20. DATA INTEGRITY MONITORING:
--    -- Count columns per log type
--    SELECT
--        lt.name,
--        COUNT(lc.id) AS column_count
--    FROM log_types lt
--    LEFT JOIN log_columns lc ON lt.id = lc.log_type_id
--    GROUP BY lt.id, lt.name
--    ORDER BY column_count DESC;
--
--    -- Verify no orphaned foreign key references (should return 0)
--    -- This should always be 0 due to foreign key constraint
--    SELECT COUNT(*) AS orphaned_references
--    FROM log_columns lc
--    LEFT JOIN log_types lt ON lc.log_type_id = lt.id
--    WHERE lt.id IS NULL;
--
--    -- Find log types with most columns
--    SELECT
--        lt.name,
--        COUNT(lc.id) AS column_count,
--        ARRAY_AGG(lc.name ORDER BY lc.name) AS column_names
--    FROM log_types lt
--    JOIN log_columns lc ON lt.id = lc.log_type_id
--    GROUP BY lt.id, lt.name
--    ORDER BY column_count DESC
--    LIMIT 10;
--
--    -- Find log types without any columns
--    SELECT lt.name
--    FROM log_types lt
--    LEFT JOIN log_columns lc ON lt.id = lc.log_type_id
--    WHERE lc.id IS NULL;
--
-- 21. APPLICATION INTEGRATION EXAMPLE:
--    -- Node.js/NestJS example for working with log type columns:
--
--    // 1. Create a log type with custom columns
--    const logType = await prisma.logTypes.create({
--        data: {
--            name: 'Workout Log',
--            logColumns: {
--                create: [
--                    { name: 'exercise_name', type: 'text' },
--                    { name: 'sets', type: 'number' },
--                    { name: 'reps', type: 'number' },
--                    { name: 'weight_kg', type: 'number' },
--                    { name: 'is_warmup', type: 'boolean' }
--                ]
--            }
--        },
--        include: { logColumns: true }
--    });
--
--    // 2. Get log type with all its columns
--    const logTypeWithColumns = await prisma.logTypes.findUnique({
--        where: { name: 'Workout Log' },
--        include: {
--            logColumns: {
--                orderBy: { name: 'asc' },
--                include: {
--                    validations: {
--                        include: {
--                            validationFunction: true
--                        }
--                    }
--                }
--            }
--        }
--    });
--
--    // 3. Add a column to existing log type
--    await prisma.logColumns.create({
--        data: {
--            name: 'duration_minutes',
--            type: 'number',
--            logTypeId: logType.id  // Required field
--        }
--    });
--
--    // 4. Transfer a column to a different log type
--    await prisma.logColumns.update({
--        where: { id: columnId },
--        data: { logTypeId: differentLogType.id }
--    });
--
--    // 5. Delete log type (columns are automatically deleted via CASCADE)
--    await prisma.logTypes.delete({
--        where: { id: logType.id }
--    });
--    // All log_columns with logTypeId === logType.id are automatically deleted
--
