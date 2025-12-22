-- =========================================
-- V53: Create validation_functions Table
-- =========================================
-- Description: Creates a table to store JavaScript validation functions used for data validation.
--              This table serves as a repository of reusable validation logic that can be
--              applied to various data fields and inputs across the application.
--              Each validation function record stores a JavaScript function that can be
--              executed to validate data according to specific business rules.
--
-- Prerequisites:
--   - flyway_admin role exists with appropriate permissions
--   - prisma_user role exists for application-level access
--   - PostgreSQL version supports TEXT data type (all versions)
--
-- Business Impact:
--   - Centralizes validation logic in the database
--   - Enables dynamic validation rule management
--   - Supports reusable validation functions across the system
--   - Facilitates runtime validation without application redeployment
--   - Provides versioning capability for validation rules
--
-- Safety Measures:
--   - Primary key constraint ensures unique function records
--   - NOT NULL constraints prevent incomplete function definitions
--   - CHECK constraint validates name is not empty
--   - CHECK constraint validates function code is not empty
--   - Defensive programming with existence checks
--
-- PostgreSQL Best Practices Applied:
--   - UUID primary key with automatic generation
--   - TEXT data type for variable-length JavaScript code storage
--   - Proper constraint naming conventions
--   - Indexes for query performance optimization
--   - Comprehensive documentation via comments
--   - Permission grants following least privilege principle
-- =========================================

-- =========================================
-- STEP 1: Validate Prerequisites
-- =========================================
-- Ensure required roles exist before proceeding

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
-- STEP 2: Create validation_functions Table
-- =========================================
-- Create the table to store JavaScript validation functions

CREATE TABLE IF NOT EXISTS public.validation_functions (
    -- Primary key: UUID with automatic generation
    id UUID NOT NULL DEFAULT gen_random_uuid(),

    -- Function name/identifier (TEXT for flexibility)
    name TEXT NOT NULL,

    -- JavaScript function code (TEXT for variable-length code storage)
    -- TEXT type chosen over VARCHAR because:
    -- 1. No practical length limit (up to ~1GB)
    -- 2. No performance penalty vs VARCHAR
    -- 3. Ideal for storing code which can vary greatly in length
    -- 4. Automatic compression for large values
    function TEXT NOT NULL,

    -- Primary key constraint
    CONSTRAINT validation_functions_pkey PRIMARY KEY (id),

    -- Check constraint to ensure name is not empty
    CONSTRAINT validation_functions_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),

    -- Check constraint to ensure function code is not empty
    CONSTRAINT validation_functions_function_not_empty CHECK (LENGTH(TRIM(function)) > 0)
)
TABLESPACE pg_default;

-- =========================================
-- STEP 3: Set Table Ownership
-- =========================================
-- Assign ownership to flyway_admin (following existing pattern)

ALTER TABLE public.validation_functions OWNER TO flyway_admin;

-- =========================================
-- STEP 4: Create Indexes
-- =========================================
-- Add indexes for efficient querying

-- Create unique index for efficient name lookups and prevent duplicate names
-- This enforces that each validation function has a unique identifier/name
-- Btree index supports efficient equality and range queries
CREATE UNIQUE INDEX IF NOT EXISTS idx_validation_functions_name_unique
    ON public.validation_functions USING btree (name);

-- =========================================
-- STEP 5: Grant Permissions
-- =========================================
-- Grant appropriate permissions to prisma_user for application access

-- Grant full CRUD permissions to prisma_user (following existing pattern)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'prisma_user') THEN
        EXECUTE 'GRANT SELECT, INSERT, DELETE, UPDATE ON TABLE public.validation_functions TO prisma_user';
        RAISE NOTICE 'Permissions granted to prisma_user';
    END IF;
END $$;

-- =========================================
-- STEP 6: Add Documentation
-- =========================================
-- Add comprehensive comments for table and columns

COMMENT ON TABLE public.validation_functions IS
'Repository of JavaScript validation functions used for data validation across the application.
This table stores reusable validation logic that can be applied to various data fields and inputs.
Each record contains a named JavaScript function that can be executed at runtime to validate
data according to specific business rules. Enables dynamic validation rule management without
application redeployment.';

COMMENT ON COLUMN public.validation_functions.id IS
'Primary key: Unique identifier for each validation function';

COMMENT ON COLUMN public.validation_functions.name IS
'Name/identifier for the validation function. Must be unique and non-empty.
Used to reference and retrieve specific validation functions.
Examples: "emailValidator", "phoneNumberValidator", "passwordStrengthValidator"';

COMMENT ON COLUMN public.validation_functions.function IS
'JavaScript function code for validation logic. Must be non-empty.
Stored as TEXT to accommodate variable-length code without size limitations.
Should contain valid JavaScript function code that can be evaluated and executed.
Example: "function(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }"';

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
        AND table_name = 'validation_functions'
    ) THEN
        RAISE WARNING 'Table creation verification failed: validation_functions table not found';
    ELSE
        RAISE NOTICE 'Success: validation_functions table created';
    END IF;
END $$;

-- Verify all required columns exist with correct types
DO $$
BEGIN
    -- Verify id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'validation_functions'
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
        AND table_name = 'validation_functions'
        AND column_name = 'name'
        AND udt_name = 'text'
        AND is_nullable = 'NO'
    ) THEN
        RAISE WARNING 'Column verification failed: name column not found or has incorrect type/nullability';
    ELSE
        RAISE NOTICE 'Success: name column verified';
    END IF;

    -- Verify function column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'validation_functions'
        AND column_name = 'function'
        AND udt_name = 'text'
        AND is_nullable = 'NO'
    ) THEN
        RAISE WARNING 'Column verification failed: function column not found or has incorrect type/nullability';
    ELSE
        RAISE NOTICE 'Success: function column verified';
    END IF;
END $$;

-- Verify primary key constraint was created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'validation_functions'
        AND constraint_name = 'validation_functions_pkey'
        AND constraint_type = 'PRIMARY KEY'
    ) THEN
        RAISE WARNING 'Primary key constraint verification failed: validation_functions_pkey not found';
    ELSE
        RAISE NOTICE 'Success: Primary key constraint validation_functions_pkey created';
    END IF;
END $$;

-- Verify check constraints were created
DO $$
BEGIN
    -- Verify name check constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'validation_functions'
        AND constraint_name = 'validation_functions_name_not_empty'
        AND constraint_type = 'CHECK'
    ) THEN
        RAISE WARNING 'Check constraint verification failed: validation_functions_name_not_empty not found';
    ELSE
        RAISE NOTICE 'Success: Check constraint validation_functions_name_not_empty created';
    END IF;

    -- Verify function check constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'validation_functions'
        AND constraint_name = 'validation_functions_function_not_empty'
        AND constraint_type = 'CHECK'
    ) THEN
        RAISE WARNING 'Check constraint verification failed: validation_functions_function_not_empty not found';
    ELSE
        RAISE NOTICE 'Success: Check constraint validation_functions_function_not_empty created';
    END IF;
END $$;

-- Verify unique index was created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'validation_functions'
        AND indexname = 'idx_validation_functions_name_unique'
    ) THEN
        RAISE WARNING 'Index verification failed: idx_validation_functions_name_unique not found';
    ELSE
        RAISE NOTICE 'Success: Unique index idx_validation_functions_name_unique created';
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
    AND tablename = 'validation_functions';

    IF table_owner = 'flyway_admin' THEN
        RAISE NOTICE 'Success: Table ownership verified - owned by flyway_admin';
    ELSE
        RAISE WARNING 'Ownership verification failed: Expected flyway_admin, found %', table_owner;
    END IF;
END $$;

-- =========================================
-- MIGRATION SUMMARY AND USAGE NOTES
-- =========================================
-- This migration creates a table to store JavaScript validation functions:
--
-- 1. SCHEMA CHANGES APPLIED:
--    - Created table: public.validation_functions
--    - Columns:
--      * id: UUID NOT NULL DEFAULT gen_random_uuid() (PRIMARY KEY)
--      * name: TEXT NOT NULL (function name/identifier)
--      * function: TEXT NOT NULL (JavaScript function code)
--    - Constraints:
--      * validation_functions_pkey: Primary key on id
--      * validation_functions_name_not_empty: Check constraint on name
--      * validation_functions_function_not_empty: Check constraint on function
--    - Indexes:
--      * idx_validation_functions_name_unique: Unique btree index on name
--    - Ownership: flyway_admin
--    - Permissions: SELECT, INSERT, DELETE, UPDATE granted to prisma_user
--
-- 2. TABLE PURPOSE AND DESIGN:
--    - Stores reusable JavaScript validation functions
--    - name field is TEXT (not VARCHAR) for maximum flexibility
--    - Unique constraint on name ensures no duplicate function identifiers
--    - function field uses TEXT for unlimited code length storage
--    - UUID primary key for distributed system compatibility
--    - Both name and function must be non-empty strings
--
-- 3. DATA TYPE RATIONALE - WHY TEXT?
--    - TEXT is the ideal choice for storing JavaScript code:
--      * No artificial length limit (up to ~1GB vs VARCHAR's 65,535 bytes)
--      * No performance penalty compared to VARCHAR
--      * Automatic compression for large values (TOAST)
--      * Simpler syntax - no need to specify max length
--      * PostgreSQL internally treats TEXT and VARCHAR similarly
--      * Better for variable-length content like code
--      * No need to estimate maximum code length upfront
--
-- 4. DATA ACCESS PATTERNS:
--    - Create a new validation function:
--      INSERT INTO validation_functions (name, function)
--      VALUES ('emailValidator', 'function(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }');
--
--    - Get all validation functions:
--      SELECT * FROM validation_functions
--      ORDER BY name;
--
--    - Find a function by name:
--      SELECT * FROM validation_functions
--      WHERE name = 'emailValidator';
--
--    - Update a validation function:
--      UPDATE validation_functions
--      SET function = 'function(value) { /* updated code */ }'
--      WHERE name = 'emailValidator';
--
--    - Delete a validation function:
--      DELETE FROM validation_functions
--      WHERE name = 'emailValidator';
--
--    - Check if a function name exists:
--      SELECT EXISTS(
--          SELECT 1 FROM validation_functions
--          WHERE name = 'emailValidator'
--      );
--
-- 5. INDEX STRATEGY:
--    - idx_validation_functions_name_unique: Unique btree index on name
--      * Enforces uniqueness of function names
--      * Optimizes queries filtering/sorting by name
--      * O(log n) lookup time for name-based queries
--      * Prevents duplicate validation function identifiers
--
-- 6. CONSTRAINTS AND VALIDATION:
--    - id must be a valid UUID (auto-generated by default)
--    - name must be non-empty after trimming whitespace
--    - name must be unique across all validation functions
--    - function must be non-empty after trimming whitespace
--    - No validation of JavaScript syntax at database level (application responsibility)
--
-- 7. PERFORMANCE CONSIDERATIONS:
--    - Unique index provides O(log n) lookup time for name queries
--    - TEXT type automatically uses TOAST for values > ~2KB (compressed storage)
--    - UUID primary key ensures global uniqueness and distributed system compatibility
--    - Small table cardinality expected (dozens to hundreds of functions)
--    - No heavy write load expected (validation functions are relatively static)
--
-- 8. BUSINESS LOGIC IMPLICATIONS:
--    - Validation functions are uniquely identified by name
--    - Application must handle JavaScript execution and security
--    - Functions should be stateless and side-effect free
--    - Consider sandboxing JavaScript execution (VM2, isolated-vm)
--    - Functions should return boolean or validation result objects
--    - Application layer responsible for syntax validation before storage
--    - Version control should track changes to validation logic
--
-- 9. SECURITY CONSIDERATIONS:
--    - JavaScript code execution poses security risks:
--      * NEVER execute user-provided validation functions without sandboxing
--      * Use VM sandboxing (VM2, isolated-vm, or similar)
--      * Set execution timeouts to prevent infinite loops
--      * Limit memory usage during execution
--      * Validate code before storage (syntax checks, forbidden patterns)
--      * Consider code signing or checksums for integrity
--      * Implement strict access controls on who can create/modify functions
--      * Log all function creation/modification for audit trails
--      * Consider read-only mode for production environments
--
-- 10. EXAMPLE USE CASES:
--    -- Define email validation function
--    INSERT INTO validation_functions (name, function) VALUES
--        ('emailValidator',
--         'function(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }');
--
--    -- Define phone number validation
--    INSERT INTO validation_functions (name, function) VALUES
--        ('phoneValidator',
--         'function(value) { return /^\+?[1-9]\d{1,14}$/.test(value); }');
--
--    -- Define password strength validation
--    INSERT INTO validation_functions (name, function) VALUES
--        ('passwordStrengthValidator',
--         'function(value) { return value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value); }');
--
--    -- Define age range validation
--    INSERT INTO validation_functions (name, function) VALUES
--        ('ageRangeValidator',
--         'function(value) { return value >= 18 && value <= 120; }');
--
--    -- Define URL validation
--    INSERT INTO validation_functions (name, function) VALUES
--        ('urlValidator',
--         'function(value) { try { new URL(value); return true; } catch { return false; } }');
--
--    -- Retrieve a specific validator
--    SELECT function FROM validation_functions
--    WHERE name = 'emailValidator';
--
--    -- List all available validators
--    SELECT name FROM validation_functions
--    ORDER BY name;
--
-- 11. INTEGRATION WITH APPLICATION:
--    -- Node.js/NestJS example usage pattern:
--    -- 1. Retrieve function from database:
--    const validatorRecord = await prisma.validation_functions.findUnique({
--        where: { name: 'emailValidator' }
--    });
--
--    -- 2. Execute in sandboxed environment (VM2):
--    const { VM } = require('vm2');
--    const vm = new VM({ timeout: 1000, sandbox: {} });
--    const validator = vm.run(`(${validatorRecord.function})`);
--    const isValid = validator(emailValue);
--
--    -- 3. Or use isolated-vm for better security:
--    const ivm = require('isolated-vm');
--    const isolate = new ivm.Isolate({ memoryLimit: 8 });
--    const context = await isolate.createContext();
--    const script = await isolate.compileScript(`(${validatorRecord.function})(value)`);
--    const isValid = await script.run(context, { timeout: 1000 });
--
-- 12. FUNCTION SIGNATURE GUIDELINES:
--    - Functions should follow a consistent signature:
--      function(value, options) { /* validation logic */ return boolean; }
--    - Parameters:
--      * value: The value to validate (any type)
--      * options: Optional configuration object
--    - Return value:
--      * boolean: true if valid, false if invalid
--      * OR object: { valid: boolean, message: string, errors: [...] }
--    - Functions should be pure (no side effects)
--    - Functions should handle edge cases (null, undefined, empty strings)
--
-- 13. VERSIONING STRATEGY:
--    - Consider adding version column in future migrations:
--      * version: INTEGER NOT NULL DEFAULT 1
--      * created_at: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
--      * updated_at: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
--    - Track function changes over time
--    - Support rollback to previous versions
--    - Maintain audit trail of modifications
--
-- 14. TESTING RECOMMENDATIONS:
--    - Test all validation functions before deploying to production
--    - Create unit tests for each validation function
--    - Test edge cases: null, undefined, empty strings, extreme values
--    - Test performance with large datasets
--    - Verify timeout handling for infinite loops
--    - Test sandbox escape attempts for security
--    - Validate function syntax before storage
--
-- 15. MONITORING AND OBSERVABILITY:
--    - Log validation function execution time
--    - Monitor validation success/failure rates
--    - Alert on validation function errors or timeouts
--    - Track which functions are most frequently used
--    - Monitor for security issues (sandbox escapes, malicious code)
--
-- 16. ROLLBACK PROCEDURE (If Needed):
--    -- WARNING: Only execute if no other tables reference validation_functions
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
--        AND ccu.table_name = 'validation_functions';
--
--    -- If no dependencies exist, drop the table:
--    DROP INDEX IF EXISTS public.idx_validation_functions_name_unique;
--    DROP TABLE IF EXISTS public.validation_functions CASCADE;
--
-- 17. MAINTENANCE NOTES:
--    - Regular ANALYZE on table maintains index statistics
--    - Monitor function execution performance in application
--    - Review and update validation functions as business rules change
--    - Consider archiving unused validation functions
--    - Document all validation functions in application documentation
--    - Implement code review process for new/modified functions
--    - Use version control to track validation function changes
--    - Consider implementing automated testing for validation functions
--
-- 18. FUTURE ENHANCEMENTS:
--    - Add version tracking (version column, history table)
--    - Add metadata fields (description, author, tags)
--    - Add timestamps (created_at, updated_at)
--    - Add usage statistics (execution_count, last_used)
--    - Add validation function categories or tags
--    - Add support for validation function composition
--    - Add support for async validation functions
--    - Add support for validation function dependencies
--    - Implement validation function testing framework
--    - Add support for multiple programming languages
--
-- 19. RELATED TABLES (Expected Future Usage):
--    - May be used by form field definitions
--    - May be used by API input validation configurations
--    - May be referenced by data integrity rules
--    - Could be linked to log_columns for column-specific validation
--    - Could be used in dynamic form builders
--    - Supports building flexible validation pipelines
--
-- 20. PRISMA SCHEMA RECOMMENDATION:
--    model ValidationFunctions {
--      id       String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
--      name     String @unique
--      function String @db.Text
--
--      @@map("validation_functions")
--    }
--
