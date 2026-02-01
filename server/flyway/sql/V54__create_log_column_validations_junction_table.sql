-- =========================================
-- V54: Create log_column_validations Junction Table
-- =========================================
-- Description: Creates a junction/bridge table to establish a many-to-many relationship
--              between log_columns and validation_functions tables.
--              This relationship is optional on both sides, meaning:
--              - A log_column can exist without any validation functions
--              - A validation_function can exist without being assigned to any log_columns
--              - A log_column can have multiple validation functions
--              - A validation_function can be assigned to multiple log_columns
--
-- Prerequisites:
--   - V51 migration must have been successfully applied (log_columns table exists)
--   - V53 migration must have been successfully applied (validation_functions table exists)
--   - flyway_admin role exists with appropriate permissions
--   - prisma_user role exists for application-level access
--
-- Business Impact:
--   - Enables flexible assignment of validation rules to log columns
--   - Supports reusable validation logic across multiple columns
--   - Allows multiple validation rules per column
--   - Prevents duplicate validation assignments with composite unique constraint
--   - Facilitates dynamic validation rule management
--
-- Safety Measures:
--   - Primary key constraint ensures unique junction records
--   - Foreign key constraints with CASCADE DELETE maintain referential integrity
--   - Composite unique constraint prevents duplicate relationships
--   - NOT NULL constraints prevent incomplete relationship definitions
--   - Defensive programming with existence checks
--
-- PostgreSQL Best Practices Applied:
--   - UUID primary key with automatic generation
--   - Proper constraint naming conventions
--   - Indexes for foreign keys to optimize join performance
--   - Composite unique constraint on foreign key pair
--   - CASCADE DELETE for automatic cleanup of orphaned relationships
--   - Comprehensive documentation via comments
--   - Permission grants following least privilege principle
-- =========================================

-- =========================================
-- STEP 1: Validate Prerequisites
-- =========================================
-- Ensure required tables and roles exist before proceeding

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

-- Verify validation_functions table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'validation_functions'
    ) THEN
        RAISE EXCEPTION 'Prerequisites not met: validation_functions table does not exist. V53 migration must be applied first.';
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
-- STEP 2: Create log_column_validations Junction Table
-- =========================================
-- Create the table to store many-to-many relationships

CREATE TABLE IF NOT EXISTS public.log_column_validations (
    -- Primary key: UUID with automatic generation
    id UUID NOT NULL DEFAULT gen_random_uuid(),

    -- Foreign key to log_columns table (NOT NULL - relationship must have a log column)
    log_column_id UUID NOT NULL,

    -- Foreign key to validation_functions table (NOT NULL - relationship must have a validation function)
    validation_function_id UUID NOT NULL,

    -- Primary key constraint
    CONSTRAINT log_column_validations_pkey PRIMARY KEY (id),

    -- Foreign key constraint to log_columns with CASCADE DELETE
    -- CASCADE DELETE: When a log_column is deleted, all its validation assignments are automatically removed
    -- This maintains referential integrity and prevents orphaned relationships
    CONSTRAINT fk_log_column_validations_log_column
        FOREIGN KEY (log_column_id)
        REFERENCES public.log_columns (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- Foreign key constraint to validation_functions with CASCADE DELETE
    -- CASCADE DELETE: When a validation_function is deleted, all its assignments are automatically removed
    -- This maintains referential integrity and prevents orphaned relationships
    CONSTRAINT fk_log_column_validations_validation_function
        FOREIGN KEY (validation_function_id)
        REFERENCES public.validation_functions (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- Composite unique constraint to prevent duplicate relationships
    -- Ensures the same validation function cannot be assigned to the same log column multiple times
    CONSTRAINT log_column_validations_unique
        UNIQUE (log_column_id, validation_function_id)
)
TABLESPACE pg_default;

-- =========================================
-- STEP 3: Set Table Ownership
-- =========================================
-- Assign ownership to flyway_admin (following existing pattern)

ALTER TABLE public.log_column_validations OWNER TO flyway_admin;

-- =========================================
-- STEP 4: Create Indexes
-- =========================================
-- Add indexes for efficient querying and join performance

-- Create index on log_column_id for efficient lookups
-- This optimizes queries like: "Find all validation functions for a specific log column"
-- Improves join performance when querying from log_columns side
CREATE INDEX IF NOT EXISTS idx_log_column_validations_log_column_id
    ON public.log_column_validations USING btree (log_column_id);

-- Create index on validation_function_id for efficient lookups
-- This optimizes queries like: "Find all log columns using a specific validation function"
-- Improves join performance when querying from validation_functions side
CREATE INDEX IF NOT EXISTS idx_log_column_validations_validation_function_id
    ON public.log_column_validations USING btree (validation_function_id);

-- Note: No need for composite index on (log_column_id, validation_function_id)
-- because the UNIQUE constraint automatically creates a unique index for that combination

-- =========================================
-- STEP 5: Grant Permissions
-- =========================================
-- Grant appropriate permissions to prisma_user for application access

-- Grant full CRUD permissions to prisma_user (following existing pattern)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'prisma_user') THEN
        EXECUTE 'GRANT SELECT, INSERT, DELETE, UPDATE ON TABLE public.log_column_validations TO prisma_user';
        RAISE NOTICE 'Permissions granted to prisma_user';
    END IF;
END $$;

-- =========================================
-- STEP 6: Add Documentation
-- =========================================
-- Add comprehensive comments for table and columns

COMMENT ON TABLE public.log_column_validations IS
'Junction table establishing many-to-many relationships between log_columns and validation_functions.
This table enables flexible assignment of validation rules to log columns, supporting:
- Multiple validation functions per log column
- Reusable validation functions across multiple log columns
- Dynamic validation rule management without schema changes
The relationship is optional on both sides - log columns and validation functions can exist independently.';

COMMENT ON COLUMN public.log_column_validations.id IS
'Primary key: Unique identifier for each log column validation assignment';

COMMENT ON COLUMN public.log_column_validations.log_column_id IS
'Foreign key to log_columns table. References the log column that has validation rules assigned.
NOT NULL constraint ensures every relationship has a valid log column.
CASCADE DELETE: When the log column is deleted, this relationship record is automatically removed.';

COMMENT ON COLUMN public.log_column_validations.validation_function_id IS
'Foreign key to validation_functions table. References the validation function assigned to the log column.
NOT NULL constraint ensures every relationship has a valid validation function.
CASCADE DELETE: When the validation function is deleted, this relationship record is automatically removed.';

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
        AND table_name = 'log_column_validations'
    ) THEN
        RAISE WARNING 'Table creation verification failed: log_column_validations table not found';
    ELSE
        RAISE NOTICE 'Success: log_column_validations table created';
    END IF;
END $$;

-- Verify all required columns exist with correct types
DO $$
BEGIN
    -- Verify id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'log_column_validations'
        AND column_name = 'id'
        AND udt_name = 'uuid'
        AND is_nullable = 'NO'
    ) THEN
        RAISE WARNING 'Column verification failed: id column not found or has incorrect type/nullability';
    ELSE
        RAISE NOTICE 'Success: id column verified';
    END IF;

    -- Verify log_column_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'log_column_validations'
        AND column_name = 'log_column_id'
        AND udt_name = 'uuid'
        AND is_nullable = 'NO'
    ) THEN
        RAISE WARNING 'Column verification failed: log_column_id column not found or has incorrect type/nullability';
    ELSE
        RAISE NOTICE 'Success: log_column_id column verified';
    END IF;

    -- Verify validation_function_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'log_column_validations'
        AND column_name = 'validation_function_id'
        AND udt_name = 'uuid'
        AND is_nullable = 'NO'
    ) THEN
        RAISE WARNING 'Column verification failed: validation_function_id column not found or has incorrect type/nullability';
    ELSE
        RAISE NOTICE 'Success: validation_function_id column verified';
    END IF;
END $$;

-- Verify primary key constraint was created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'log_column_validations'
        AND constraint_name = 'log_column_validations_pkey'
        AND constraint_type = 'PRIMARY KEY'
    ) THEN
        RAISE WARNING 'Primary key constraint verification failed: log_column_validations_pkey not found';
    ELSE
        RAISE NOTICE 'Success: Primary key constraint log_column_validations_pkey created';
    END IF;
END $$;

-- Verify foreign key constraints were created
DO $$
BEGIN
    -- Verify log_column_id foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'log_column_validations'
        AND constraint_name = 'fk_log_column_validations_log_column'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        RAISE WARNING 'Foreign key constraint verification failed: fk_log_column_validations_log_column not found';
    ELSE
        RAISE NOTICE 'Success: Foreign key constraint fk_log_column_validations_log_column created';
    END IF;

    -- Verify validation_function_id foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'log_column_validations'
        AND constraint_name = 'fk_log_column_validations_validation_function'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        RAISE WARNING 'Foreign key constraint verification failed: fk_log_column_validations_validation_function not found';
    ELSE
        RAISE NOTICE 'Success: Foreign key constraint fk_log_column_validations_validation_function created';
    END IF;
END $$;

-- Verify unique constraint was created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'log_column_validations'
        AND constraint_name = 'log_column_validations_unique'
        AND constraint_type = 'UNIQUE'
    ) THEN
        RAISE WARNING 'Unique constraint verification failed: log_column_validations_unique not found';
    ELSE
        RAISE NOTICE 'Success: Unique constraint log_column_validations_unique created';
    END IF;
END $$;

-- Verify indexes were created
DO $$
BEGIN
    -- Verify log_column_id index
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'log_column_validations'
        AND indexname = 'idx_log_column_validations_log_column_id'
    ) THEN
        RAISE WARNING 'Index verification failed: idx_log_column_validations_log_column_id not found';
    ELSE
        RAISE NOTICE 'Success: Index idx_log_column_validations_log_column_id created';
    END IF;

    -- Verify validation_function_id index
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'log_column_validations'
        AND indexname = 'idx_log_column_validations_validation_function_id'
    ) THEN
        RAISE WARNING 'Index verification failed: idx_log_column_validations_validation_function_id not found';
    ELSE
        RAISE NOTICE 'Success: Index idx_log_column_validations_validation_function_id created';
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
    AND tablename = 'log_column_validations';

    IF table_owner = 'flyway_admin' THEN
        RAISE NOTICE 'Success: Table ownership verified - owned by flyway_admin';
    ELSE
        RAISE WARNING 'Ownership verification failed: Expected flyway_admin, found %', table_owner;
    END IF;
END $$;

-- Verify CASCADE DELETE behavior on foreign keys
DO $$
DECLARE
    delete_rule_log_column TEXT;
    delete_rule_validation_function TEXT;
BEGIN
    -- Check log_column_id foreign key delete rule
    SELECT rc.delete_rule INTO delete_rule_log_column
    FROM information_schema.referential_constraints rc
    WHERE rc.constraint_schema = 'public'
    AND rc.constraint_name = 'fk_log_column_validations_log_column';

    IF delete_rule_log_column = 'CASCADE' THEN
        RAISE NOTICE 'Success: CASCADE DELETE verified for fk_log_column_validations_log_column';
    ELSE
        RAISE WARNING 'Foreign key delete rule verification failed: Expected CASCADE, found %', delete_rule_log_column;
    END IF;

    -- Check validation_function_id foreign key delete rule
    SELECT rc.delete_rule INTO delete_rule_validation_function
    FROM information_schema.referential_constraints rc
    WHERE rc.constraint_schema = 'public'
    AND rc.constraint_name = 'fk_log_column_validations_validation_function';

    IF delete_rule_validation_function = 'CASCADE' THEN
        RAISE NOTICE 'Success: CASCADE DELETE verified for fk_log_column_validations_validation_function';
    ELSE
        RAISE WARNING 'Foreign key delete rule verification failed: Expected CASCADE, found %', delete_rule_validation_function;
    END IF;
END $$;

-- =========================================
-- MIGRATION SUMMARY AND USAGE NOTES
-- =========================================
-- This migration creates a junction table for many-to-many relationships:
--
-- 1. SCHEMA CHANGES APPLIED:
--    - Created table: public.log_column_validations
--    - Columns:
--      * id: UUID NOT NULL DEFAULT gen_random_uuid() (PRIMARY KEY)
--      * log_column_id: UUID NOT NULL (foreign key to log_columns)
--      * validation_function_id: UUID NOT NULL (foreign key to validation_functions)
--    - Constraints:
--      * log_column_validations_pkey: Primary key on id
--      * fk_log_column_validations_log_column: Foreign key to log_columns (CASCADE DELETE)
--      * fk_log_column_validations_validation_function: Foreign key to validation_functions (CASCADE DELETE)
--      * log_column_validations_unique: Unique constraint on (log_column_id, validation_function_id)
--    - Indexes:
--      * idx_log_column_validations_log_column_id: Btree index on log_column_id
--      * idx_log_column_validations_validation_function_id: Btree index on validation_function_id
--    - Ownership: flyway_admin
--    - Permissions: SELECT, INSERT, DELETE, UPDATE granted to prisma_user
--
-- 2. RELATIONSHIP MODEL:
--    log_columns (1) ----< log_column_validations >---- (*) validation_functions
--
--    - One log_column can have many validation_functions (through junction table)
--    - One validation_function can be assigned to many log_columns (through junction table)
--    - The relationship is optional on both sides:
--      * log_columns can exist without validation_functions
--      * validation_functions can exist without log_columns
--    - Duplicate assignments are prevented by composite unique constraint
--
-- 3. CASCADE DELETE BEHAVIOR:
--    When a log_column is deleted:
--      - All log_column_validations records for that log_column are automatically deleted
--      - The validation_functions themselves remain intact (can be used by other log_columns)
--
--    When a validation_function is deleted:
--      - All log_column_validations records for that validation_function are automatically deleted
--      - The log_columns themselves remain intact (can use other validation_functions)
--
--    This maintains referential integrity and prevents orphaned relationships.
--
-- 4. DATA ACCESS PATTERNS:
--    - Assign a validation function to a log column:
--      INSERT INTO log_column_validations (log_column_id, validation_function_id)
--      VALUES (
--          'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
--          'a3bb189e-8bf9-3888-9912-ace4e6543002'::uuid
--      );
--
--    - Get all validation functions for a specific log column:
--      SELECT vf.*
--      FROM validation_functions vf
--      JOIN log_column_validations lcv ON vf.id = lcv.validation_function_id
--      WHERE lcv.log_column_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid;
--
--    - Get all log columns using a specific validation function:
--      SELECT lc.*
--      FROM log_columns lc
--      JOIN log_column_validations lcv ON lc.id = lcv.log_column_id
--      WHERE lcv.validation_function_id = 'a3bb189e-8bf9-3888-9912-ace4e6543002'::uuid;
--
--    - Get log columns with their validation functions (LEFT JOIN for optional relationship):
--      SELECT
--          lc.id,
--          lc.name AS column_name,
--          lc.type AS column_type,
--          vf.name AS validation_name,
--          vf.function AS validation_code
--      FROM log_columns lc
--      LEFT JOIN log_column_validations lcv ON lc.id = lcv.log_column_id
--      LEFT JOIN validation_functions vf ON lcv.validation_function_id = vf.id
--      ORDER BY lc.name, vf.name;
--
--    - Remove a validation assignment:
--      DELETE FROM log_column_validations
--      WHERE log_column_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid
--      AND validation_function_id = 'a3bb189e-8bf9-3888-9912-ace4e6543002'::uuid;
--
--    - Remove all validation assignments for a log column:
--      DELETE FROM log_column_validations
--      WHERE log_column_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid;
--
--    - Count validation functions per log column:
--      SELECT
--          lc.name,
--          COUNT(lcv.validation_function_id) AS validation_count
--      FROM log_columns lc
--      LEFT JOIN log_column_validations lcv ON lc.id = lcv.log_column_id
--      GROUP BY lc.id, lc.name
--      ORDER BY validation_count DESC;
--
--    - Find log columns without any validation:
--      SELECT lc.*
--      FROM log_columns lc
--      LEFT JOIN log_column_validations lcv ON lc.id = lcv.log_column_id
--      WHERE lcv.id IS NULL;
--
-- 5. INDEX STRATEGY AND PERFORMANCE:
--    - idx_log_column_validations_log_column_id:
--      * Optimizes queries joining from log_columns to validation_functions
--      * Improves performance when filtering by log_column_id
--      * Supports CASCADE DELETE performance
--      * O(log n) lookup time
--
--    - idx_log_column_validations_validation_function_id:
--      * Optimizes queries joining from validation_functions to log_columns
--      * Improves performance when filtering by validation_function_id
--      * Supports CASCADE DELETE performance
--      * O(log n) lookup time
--
--    - log_column_validations_unique (composite unique constraint):
--      * Automatically creates a unique btree index on (log_column_id, validation_function_id)
--      * Prevents duplicate validation assignments
--      * Optimizes queries filtering by both columns
--      * No separate index needed for this combination
--
-- 6. CONSTRAINTS AND VALIDATION:
--    - id must be a valid UUID (auto-generated by default)
--    - log_column_id must reference an existing log_columns record
--    - validation_function_id must reference an existing validation_functions record
--    - Same validation function cannot be assigned to same log column twice
--    - Foreign key constraints ensure referential integrity
--    - CASCADE DELETE maintains data consistency when parent records are removed
--
-- 7. PERFORMANCE CONSIDERATIONS:
--    - Small junction table expected (hundreds to thousands of rows)
--    - Indexes provide O(log n) join performance
--    - Composite unique constraint prevents duplicate entries efficiently
--    - CASCADE DELETE automatically handled by PostgreSQL foreign key infrastructure
--    - No additional triggers needed for cleanup
--    - UUID primary key ensures distributed system compatibility
--
-- 8. BUSINESS LOGIC IMPLICATIONS:
--    - Multiple validation rules can be applied to a single log column
--    - Validation functions are reusable across different log columns
--    - Order of validation execution should be handled at application layer
--    - Application must handle case where log column has no validations
--    - Consider implementing validation priority/ordering in future migrations
--    - Validation functions should be executed sequentially in application code
--
-- 9. EXAMPLE USE CASES:
--    -- Assign email validation to an email column
--    -- Assuming log_columns has a column with id 'abc...' for 'email' field
--    -- And validation_functions has a function with id 'def...' for 'emailValidator'
--    INSERT INTO log_column_validations (log_column_id, validation_function_id)
--    SELECT lc.id, vf.id
--    FROM log_columns lc, validation_functions vf
--    WHERE lc.name = 'email' AND vf.name = 'emailValidator';
--
--    -- Assign multiple validations to a password column
--    -- Assign both 'passwordStrengthValidator' and 'passwordLengthValidator'
--    INSERT INTO log_column_validations (log_column_id, validation_function_id)
--    SELECT lc.id, vf.id
--    FROM log_columns lc, validation_functions vf
--    WHERE lc.name = 'password'
--    AND vf.name IN ('passwordStrengthValidator', 'passwordLengthValidator');
--
--    -- Get complete validation configuration for a log column
--    SELECT
--        lc.name AS column_name,
--        lc.type AS column_type,
--        ARRAY_AGG(vf.name ORDER BY vf.name) AS validation_functions,
--        ARRAY_AGG(vf.function ORDER BY vf.name) AS validation_code
--    FROM log_columns lc
--    LEFT JOIN log_column_validations lcv ON lc.id = lcv.log_column_id
--    LEFT JOIN validation_functions vf ON lcv.validation_function_id = vf.id
--    WHERE lc.name = 'email'
--    GROUP BY lc.id, lc.name, lc.type;
--
--    -- Find all columns using a specific validation function
--    SELECT lc.name, lc.type
--    FROM log_columns lc
--    JOIN log_column_validations lcv ON lc.id = lcv.log_column_id
--    JOIN validation_functions vf ON lcv.validation_function_id = vf.id
--    WHERE vf.name = 'emailValidator'
--    ORDER BY lc.name;
--
-- 10. INTEGRATION WITH OTHER TABLES:
--    - References log_columns table (V51 migration)
--    - References validation_functions table (V53 migration)
--    - Future migrations may add:
--      * Validation execution order/priority
--      * Validation configuration options
--      * Error message customization
--      * Conditional validation rules
--
-- 11. RECOMMENDED PRISMA SCHEMA:
--    model LogColumns {
--      id                    String                   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
--      name                  String
--      type                  ColumnLogType
--      validations           LogColumnValidations[]   // Many-to-many relationship
--
--      @@map("log_columns")
--    }
--
--    model ValidationFunctions {
--      id                    String                   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
--      name                  String                   @unique
--      function              String                   @db.Text
--      logColumns            LogColumnValidations[]   // Many-to-many relationship
--
--      @@map("validation_functions")
--    }
--
--    model LogColumnValidations {
--      id                    String               @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
--      logColumnId           String               @map("log_column_id") @db.Uuid
--      validationFunctionId  String               @map("validation_function_id") @db.Uuid
--
--      logColumn             LogColumns           @relation(fields: [logColumnId], references: [id], onDelete: Cascade)
--      validationFunction    ValidationFunctions  @relation(fields: [validationFunctionId], references: [id], onDelete: Cascade)
--
--      @@unique([logColumnId, validationFunctionId], name: "log_column_validations_unique")
--      @@map("log_column_validations")
--    }
--
-- 12. ROLLBACK PROCEDURE (If Needed):
--    -- WARNING: This will remove all validation assignments
--    -- No need to check for dependencies as this is a junction table
--
--    -- Drop indexes first (good practice, though CASCADE would handle it)
--    DROP INDEX IF EXISTS public.idx_log_column_validations_validation_function_id;
--    DROP INDEX IF EXISTS public.idx_log_column_validations_log_column_id;
--
--    -- Drop the junction table (CASCADE will drop dependent objects)
--    DROP TABLE IF EXISTS public.log_column_validations CASCADE;
--
-- 13. MAINTENANCE NOTES:
--    - Monitor join performance for queries using this junction table
--    - Regular ANALYZE on table maintains index statistics
--    - Consider adding audit timestamps (created_at) in future migrations
--    - Consider adding validation execution order field in future migrations
--    - Monitor for unused validation assignments and clean up periodically
--    - Ensure application handles multiple validations per column correctly
--    - Document validation execution order in application layer
--
-- 14. QUERY OPTIMIZATION TIPS:
--    - Use LEFT JOIN when log columns may not have validations
--    - Use INNER JOIN when only columns with validations are needed
--    - Consider materializing frequently accessed validation configurations
--    - Use ARRAY_AGG to collect multiple validations in single query
--    - Leverage indexes when filtering by either foreign key
--    - Batch insert validation assignments for better performance
--
-- 15. FUTURE ENHANCEMENTS:
--    - Add execution_order column to control validation sequence
--    - Add enabled/disabled flag for temporary deactivation
--    - Add configuration JSON field for validation parameters
--    - Add error_message customization field
--    - Add validation_group for conditional validation
--    - Add created_at/updated_at timestamps for audit trail
--    - Add created_by/updated_by for user tracking
--    - Consider adding validation result caching mechanism
--
-- 16. SECURITY CONSIDERATIONS:
--    - Ensure only authorized users can create validation assignments
--    - Validate that assigned validation functions are appropriate for column types
--    - Prevent circular validation dependencies in application layer
--    - Monitor for excessive validation assignments that could impact performance
--    - Implement access controls on junction table modifications
--    - Log all changes to validation assignments for audit purposes
--
-- 17. TESTING RECOMMENDATIONS:
--    - Test CASCADE DELETE behavior for both foreign keys
--    - Test unique constraint prevents duplicate assignments
--    - Test performance with multiple validations per column
--    - Test join queries with large datasets
--    - Test edge cases: columns with no validations, unused validation functions
--    - Test concurrent inserts to prevent race conditions
--    - Verify index usage in query execution plans
--
-- 18. APPLICATION INTEGRATION EXAMPLE:
--    -- Node.js/NestJS example for applying validations:
--
--    // 1. Fetch log column with its validation functions
--    const columnWithValidations = await prisma.logColumns.findUnique({
--        where: { id: columnId },
--        include: {
--            validations: {
--                include: {
--                    validationFunction: true
--                }
--            }
--        }
--    });
--
--    // 2. Execute all validation functions for a value
--    const errors = [];
--    for (const validation of columnWithValidations.validations) {
--        const validator = executeInSandbox(validation.validationFunction.function);
--        if (!validator(inputValue)) {
--            errors.push({
--                column: columnWithValidations.name,
--                validator: validation.validationFunction.name,
--                message: `Validation failed: $${validation.validationFunction.name}`
--            });
--        }
--    }
--
--    // 3. Return validation result
--    return {
--        valid: errors.length === 0,
--        errors: errors
--    };
--
