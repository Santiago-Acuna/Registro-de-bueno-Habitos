-- =========================================
-- V55: Add is_for_front Column to validation_functions Table
-- =========================================
-- Description: Adds a boolean column 'is_for_front' to the validation_functions table to indicate
--              whether a validation function is intended for frontend validation.
--              This allows the system to distinguish between:
--              - Frontend validations (executed in the browser for immediate user feedback)
--              - Backend validations (executed on the server for security and data integrity)
--              - Shared validations (used in both frontend and backend)
--
-- Prerequisites:
--   - V53 migration must have been successfully applied (validation_functions table exists)
--   - flyway_admin role exists with appropriate permissions
--   - PostgreSQL version supports BOOLEAN data type (all versions)
--
-- Business Impact:
--   - Enables selective loading of validation functions for frontend vs backend
--   - Improves frontend performance by loading only relevant validations
--   - Supports better separation of concerns between client and server validation
--   - Allows optimization of validation strategy based on execution context
--   - Maintains backward compatibility with existing validation functions
--
-- Safety Measures:
--   - Default value (FALSE) provided for existing rows to prevent NULL violations
--   - NOT NULL constraint ensures data integrity
--   - Defensive programming with existence checks
--   - Comprehensive validation and verification blocks
--
-- PostgreSQL Best Practices Applied:
--   - BOOLEAN data type for efficient storage (1 byte per value)
--   - NOT NULL constraint prevents incomplete data
--   - Default value handles existing records gracefully
--   - Proper column documentation via comments
--   - Permission management following least privilege principle
-- =========================================

-- =========================================
-- STEP 1: Validate Prerequisites
-- =========================================
-- Ensure validation_functions table exists before proceeding

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

-- =========================================
-- STEP 2: Check if Column Already Exists
-- =========================================
-- Prevent duplicate column creation if migration is re-run

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'validation_functions'
        AND column_name = 'is_for_front'
    ) THEN
        RAISE WARNING 'Column is_for_front already exists in validation_functions table. Skipping column creation.';
    END IF;
END $$;

-- =========================================
-- STEP 3: Add is_for_front Column
-- =========================================
-- Add the new column with NOT NULL constraint and default value

-- Add column with default value to handle existing rows
-- BOOLEAN type chosen because:
-- 1. Efficient storage (1 byte per value vs 4 bytes for INT)
-- 2. Clear semantic meaning (TRUE/FALSE)
-- 3. Built-in PostgreSQL support and optimization
-- 4. Type-safe at database level
-- 5. Prevents invalid values (only TRUE/FALSE/NULL allowed)
--
-- DEFAULT FALSE chosen because:
-- 1. Most existing validation functions are likely backend-focused
-- 2. Conservative approach - frontend validations should be explicitly marked
-- 3. Maintains existing behavior until explicitly changed
-- 4. Safer default for security-critical validations
ALTER TABLE public.validation_functions
ADD COLUMN IF NOT EXISTS is_for_front BOOLEAN NOT NULL DEFAULT FALSE;

-- =========================================
-- STEP 4: Update Existing Data (Optional)
-- =========================================
-- This section is optional but demonstrates how to set the flag for existing records
-- Uncomment and modify if you need to update existing validation functions

-- Example: Mark specific validation functions as frontend-suitable
-- UPDATE public.validation_functions
-- SET is_for_front = TRUE
-- WHERE name IN (
--     'emailValidator',
--     'phoneValidator',
--     'urlValidator',
--     'passwordStrengthValidator'
-- );

-- =========================================
-- STEP 5: Add Column Documentation
-- =========================================
-- Add comprehensive comment for the new column

COMMENT ON COLUMN public.validation_functions.is_for_front IS
'Indicates whether this validation function is intended for frontend (client-side) validation.
TRUE: Function is safe and appropriate for frontend execution (user feedback, UI validation)
FALSE: Function is backend-only (security checks, business rules, server-side validation)

Frontend validations should be:
- Safe to expose to clients (no sensitive business logic)
- Quick to execute (no heavy computation)
- User-friendly (provide immediate feedback)
- Non-security-critical (always re-validate on backend)

Backend validations typically include:
- Security-critical checks
- Database integrity validations
- Complex business rules
- Sensitive logic that should not be exposed to clients

Default is FALSE for conservative approach - validations must be explicitly marked for frontend use.';

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
        AND table_name = 'validation_functions'
        AND column_name = 'is_for_front'
        AND data_type = 'boolean'
        AND is_nullable = 'NO'
    ) THEN
        RAISE WARNING 'Column verification failed: is_for_front column not found or has incorrect type/nullability';
    ELSE
        RAISE NOTICE 'Success: is_for_front column added and verified';
    END IF;
END $$;

-- Verify default value was set correctly
DO $$
DECLARE
    default_value TEXT;
BEGIN
    SELECT column_default
    INTO default_value
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'validation_functions'
    AND column_name = 'is_for_front';

    IF default_value = 'false' THEN
        RAISE NOTICE 'Success: Default value verified - set to FALSE';
    ELSE
        RAISE WARNING 'Default value verification failed: Expected false, found %', default_value;
    END IF;
END $$;

-- Verify no NULL values exist in the column
DO $$
DECLARE
    null_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO null_count
    FROM public.validation_functions
    WHERE is_for_front IS NULL;

    IF null_count > 0 THEN
        RAISE WARNING 'Data integrity check failed: Found % rows with NULL is_for_front value', null_count;
    ELSE
        RAISE NOTICE 'Success: No NULL values found in is_for_front column';
    END IF;
END $$;

-- Verify column statistics
DO $$
DECLARE
    total_count INTEGER;
    frontend_count INTEGER;
    backend_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count FROM public.validation_functions;
    SELECT COUNT(*) INTO frontend_count FROM public.validation_functions WHERE is_for_front = TRUE;
    SELECT COUNT(*) INTO backend_count FROM public.validation_functions WHERE is_for_front = FALSE;

    RAISE NOTICE 'Column statistics:';
    RAISE NOTICE '  Total validation functions: %', total_count;
    RAISE NOTICE '  Frontend validations (TRUE): %', frontend_count;
    RAISE NOTICE '  Backend validations (FALSE): %', backend_count;
END $$;

-- =========================================
-- MIGRATION SUMMARY AND USAGE NOTES
-- =========================================
-- This migration adds a boolean flag to distinguish frontend and backend validations:
--
-- 1. SCHEMA CHANGES APPLIED:
--    - Added column: is_for_front BOOLEAN NOT NULL DEFAULT FALSE
--    - Column added to table: public.validation_functions
--    - Default value: FALSE (conservative, backend-only by default)
--    - NOT NULL constraint: Ensures all records have a defined value
--    - Existing records: Automatically set to FALSE
--
-- 2. COLUMN PURPOSE AND DESIGN RATIONALE:
--    - Separates frontend-suitable validations from backend-only validations
--    - Enables selective loading of validation functions based on execution context
--    - Improves frontend performance by reducing payload size
--    - Maintains security by keeping sensitive validations server-side only
--    - Supports dual-purpose validations that can run in both contexts
--
-- 3. DATA TYPE RATIONALE - WHY BOOLEAN?
--    - BOOLEAN is the ideal choice for binary flags:
--      * Minimal storage overhead (1 byte per row)
--      * Clear semantic meaning (TRUE/FALSE)
--      * Type-safe - prevents invalid values
--      * Efficient indexing and querying
--      * Native PostgreSQL support with optimizations
--      * Better than INT flags (0/1) for clarity and storage
--      * Better than VARCHAR flags for performance and type safety
--
-- 4. DEFAULT VALUE RATIONALE - WHY FALSE?
--    - Conservative security approach:
--      * Assume validations are backend-only unless explicitly marked
--      * Prevents accidental exposure of sensitive validation logic
--      * Safer for security-critical validations
--    - Backward compatibility:
--      * Existing validation functions continue working as before
--      * No breaking changes to current functionality
--      * Explicit opt-in required for frontend use
--    - Performance:
--      * Frontend loads smaller payload by default
--      * Only necessary validations sent to client
--
-- 5. DATA ACCESS PATTERNS:
--    - Create a frontend validation function:
--      INSERT INTO validation_functions (name, function, is_for_front)
--      VALUES ('emailValidator', 'function(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }', TRUE);
--
--    - Create a backend-only validation function:
--      INSERT INTO validation_functions (name, function, is_for_front)
--      VALUES ('databaseUniqueCheck', 'function(value) { /* complex logic */ }', FALSE);
--
--    - Create with default (backend-only):
--      INSERT INTO validation_functions (name, function)
--      VALUES ('securityValidator', 'function(value) { /* sensitive logic */ }');
--      -- is_for_front will automatically be FALSE
--
--    - Get all frontend validation functions:
--      SELECT * FROM validation_functions
--      WHERE is_for_front = TRUE
--      ORDER BY name;
--
--    - Get all backend-only validation functions:
--      SELECT * FROM validation_functions
--      WHERE is_for_front = FALSE
--      ORDER BY name;
--
--    - Update a validation to be frontend-suitable:
--      UPDATE validation_functions
--      SET is_for_front = TRUE
--      WHERE name = 'emailValidator';
--
--    - Count validations by context:
--      SELECT
--          is_for_front,
--          COUNT(*) AS count
--      FROM validation_functions
--      GROUP BY is_for_front;
--
-- 6. INDEX CONSIDERATIONS:
--    - No index created for is_for_front in this migration because:
--      * Low cardinality (only 2 possible values: TRUE/FALSE)
--      * Small table expected (dozens to hundreds of rows)
--      * PostgreSQL bitmap index scans are efficient for low cardinality
--      * Can add partial indexes later if query patterns require:
--        CREATE INDEX idx_validation_functions_frontend
--        ON validation_functions (name) WHERE is_for_front = TRUE;
--    - Future optimization considerations:
--      * If table grows large (thousands of rows), consider partial indexes
--      * If frontend queries become frequent, index frontend validations
--      * Monitor query performance and add indexes as needed
--
-- 7. CONSTRAINTS AND VALIDATION:
--    - is_for_front must be TRUE or FALSE (NOT NULL constraint)
--    - Default value ensures existing and new records have valid values
--    - No CHECK constraint needed (BOOLEAN type enforces valid values)
--    - Application layer should validate appropriate use of frontend flag
--
-- 8. PERFORMANCE CONSIDERATIONS:
--    - BOOLEAN storage is minimal (1 byte per row)
--    - Filtering by boolean is efficient even without index for small tables
--    - Default value prevents any performance impact on existing queries
--    - No impact on existing indexes or constraints
--    - Column addition is a fast DDL operation (doesn't rewrite table data)
--
-- 9. BUSINESS LOGIC IMPLICATIONS:
--    - Frontend validations should be:
--      * Safe to expose to clients (no sensitive logic)
--      * Quick to execute (minimal computation)
--      * User-friendly (provide immediate feedback)
--      * Non-authoritative (always re-validate on backend)
--    - Backend validations should include:
--      * Security-critical checks
--      * Database integrity validations
--      * Complex business rules
--      * Sensitive logic not suitable for client exposure
--    - Validation strategy:
--      * Always validate on backend regardless of frontend flag
--      * Use frontend validations for UX improvement only
--      * Never trust client-side validation alone
--
-- 10. SECURITY CONSIDERATIONS:
--    - Frontend validations are visible to users:
--      * NEVER include sensitive business rules in frontend validations
--      * NEVER expose proprietary logic or algorithms
--      * NEVER rely on frontend validation for security
--    - Backend validations must be enforced:
--      * All security checks must be backend-only (is_for_front = FALSE)
--      * Always re-validate on server even if frontend validated
--      * Treat frontend validation as UX enhancement, not security
--    - Code review requirements:
--      * Review any validation marked is_for_front = TRUE
--      * Ensure no sensitive logic is exposed to frontend
--      * Verify appropriate security measures remain backend-only
--
-- 11. EXAMPLE USE CASES:
--    -- Frontend-suitable validations (is_for_front = TRUE):
--    INSERT INTO validation_functions (name, function, is_for_front) VALUES
--        ('emailFormatValidator',
--         'function(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }',
--         TRUE),
--        ('phoneFormatValidator',
--         'function(value) { return /^\+?[1-9]\d{1,14}$/.test(value); }',
--         TRUE),
--        ('urlFormatValidator',
--         'function(value) { try { new URL(value); return true; } catch { return false; } }',
--         TRUE),
--        ('passwordStrengthValidator',
--         'function(value) { return value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value); }',
--         TRUE);
--
--    -- Backend-only validations (is_for_front = FALSE):
--    INSERT INTO validation_functions (name, function, is_for_front) VALUES
--        ('databaseUniqueEmailValidator',
--         'function(value) { /* query database to check uniqueness */ }',
--         FALSE),
--        ('securityTokenValidator',
--         'function(value) { /* sensitive cryptographic validation */ }',
--         FALSE),
--        ('businessRuleValidator',
--         'function(value) { /* proprietary business logic */ }',
--         FALSE);
--
--    -- Get validation configuration for a frontend form:
--    SELECT name, function
--    FROM validation_functions
--    WHERE is_for_front = TRUE
--    AND name IN ('emailFormatValidator', 'passwordStrengthValidator')
--    ORDER BY name;
--
--    -- Get all validations for backend processing:
--    SELECT name, function
--    FROM validation_functions
--    ORDER BY name;
--    -- Note: Backend should process ALL validations, not just is_for_front = FALSE
--
-- 12. INTEGRATION WITH APPLICATION:
--    -- Frontend API endpoint pattern:
--    -- GET /api/validations/frontend
--    -- Returns only validations with is_for_front = TRUE
--
--    -- Node.js/NestJS example:
--    // Frontend validations endpoint
--    async getFrontendValidations() {
--        return await prisma.validation_functions.findMany({
--            where: { is_for_front: true },
--            select: { name: true, function: true }
--        });
--    }
--
--    // Backend validation (uses all validations)
--    async validateData(columnId: string, value: any) {
--        const column = await prisma.log_columns.findUnique({
--            where: { id: columnId },
--            include: {
--                validations: {
--                    include: { validationFunction: true }
--                }
--            }
--        });
--
--        // Execute ALL validations on backend, regardless of is_for_front flag
--        for (const validation of column.validations) {
--            const validator = executeInSandbox(validation.validationFunction.function);
--            if (!validator(value)) {
--                throw new ValidationError(`Validation failed: $${validation.validationFunction.name}`);
--            }
--        }
--    }
--
-- 13. FRONTEND IMPLEMENTATION EXAMPLE:
--    -- React/TypeScript example for using frontend validations:
--
--    // 1. Fetch frontend validations on app initialization
--    useEffect(() => {
--        fetch('/api/validations/frontend')
--            .then(res => res.json())
--            .then(validations => {
--                // Store in Redux/Context for form usage
--                dispatch(setFrontendValidations(validations));
--            });
--    }, []);
--
--    // 2. Apply frontend validations to form fields
--    const validateField = (fieldName: string, value: any) => {
--        const validations = frontendValidations.filter(v =>
--            fieldValidationMap[fieldName].includes(v.name)
--        );
--
--        for (const validation of validations) {
--            const validator = new Function('value', `return ($${validation.function})(value)`);
--            if (!validator(value)) {
--                return { valid: false, message: `$${validation.name} failed` };
--            }
--        }
--
--        return { valid: true };
--    };
--
-- 14. QUERY PATTERNS FOR MIXED VALIDATION SCENARIOS:
--    -- Get log columns with their frontend and backend validations separated:
--    SELECT
--        lc.id,
--        lc.name AS column_name,
--        lc.type AS column_type,
--        ARRAY_AGG(
--            CASE WHEN vf.is_for_front = TRUE THEN vf.name ELSE NULL END
--        ) FILTER (WHERE vf.is_for_front = TRUE) AS frontend_validations,
--        ARRAY_AGG(
--            CASE WHEN vf.is_for_front = FALSE THEN vf.name ELSE NULL END
--        ) FILTER (WHERE vf.is_for_front = FALSE) AS backend_validations
--    FROM log_columns lc
--    LEFT JOIN log_column_validations lcv ON lc.id = lcv.log_column_id
--    LEFT JOIN validation_functions vf ON lcv.validation_function_id = vf.id
--    GROUP BY lc.id, lc.name, lc.type;
--
--    -- Count frontend vs backend validations:
--    SELECT
--        CASE WHEN is_for_front THEN 'Frontend' ELSE 'Backend' END AS validation_type,
--        COUNT(*) AS count
--    FROM validation_functions
--    GROUP BY is_for_front
--    ORDER BY validation_type;
--
-- 15. MIGRATION TO EXISTING DATA:
--    -- If you need to update existing validation functions after deployment:
--
--    -- Mark common format validators as frontend-suitable:
--    UPDATE validation_functions
--    SET is_for_front = TRUE
--    WHERE name LIKE '%Format%'
--       OR name LIKE '%Pattern%'
--       OR name IN ('emailValidator', 'phoneValidator', 'urlValidator');
--
--    -- Ensure security validators remain backend-only:
--    UPDATE validation_functions
--    SET is_for_front = FALSE
--    WHERE name LIKE '%Security%'
--       OR name LIKE '%Auth%'
--       OR name LIKE '%Database%';
--
-- 16. MONITORING AND OBSERVABILITY:
--    -- Track frontend validation usage:
--    SELECT
--        vf.name,
--        vf.is_for_front,
--        COUNT(lcv.id) AS usage_count
--    FROM validation_functions vf
--    LEFT JOIN log_column_validations lcv ON vf.id = lcv.validation_function_id
--    GROUP BY vf.id, vf.name, vf.is_for_front
--    ORDER BY usage_count DESC;
--
--    -- Identify unused frontend validations:
--    SELECT vf.name
--    FROM validation_functions vf
--    LEFT JOIN log_column_validations lcv ON vf.id = lcv.validation_function_id
--    WHERE vf.is_for_front = TRUE
--    AND lcv.id IS NULL;
--
-- 17. ROLLBACK PROCEDURE (If Needed):
--    -- WARNING: This will remove the is_for_front column and all its data
--    -- Only execute if you need to completely revert this migration
--
--    -- Remove the column:
--    ALTER TABLE public.validation_functions
--    DROP COLUMN IF EXISTS is_for_front;
--
--    -- Note: No need to drop indexes as none were created for this column
--
-- 18. FUTURE ENHANCEMENTS:
--    - Add validation_context ENUM instead of boolean (frontend/backend/shared)
--    - Add performance_level field (fast/medium/slow) for frontend optimization
--    - Add supported_platforms field (web/mobile/desktop) for platform-specific validations
--    - Add execution_priority for ordering multiple validations
--    - Add browser_compatibility field for frontend validations
--    - Create materialized view for frequently accessed frontend validations
--    - Add partial index for frontend validations if table grows large
--
-- 19. RECOMMENDED PRISMA SCHEMA UPDATE:
--    model ValidationFunctions {
--      id         String                   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
--      name       String                   @unique
--      function   String                   @db.Text
--      isForFront Boolean                  @default(false) @map("is_for_front")
--      logColumns LogColumnValidations[]
--
--      @@map("validation_functions")
--    }
--
-- 20. TESTING RECOMMENDATIONS:
--    - Test column exists with correct type and nullability
--    - Test default value is applied to new records
--    - Test existing records have FALSE value after migration
--    - Test queries filtering by is_for_front = TRUE
--    - Test queries filtering by is_for_front = FALSE
--    - Test UPDATE statements changing is_for_front value
--    - Test INSERT with explicit TRUE value
--    - Test INSERT with explicit FALSE value
--    - Test INSERT without specifying value (should default to FALSE)
--    - Test frontend API endpoint returns only is_for_front = TRUE records
--    - Test backend validation executes all validations regardless of flag
--    - Verify no NULL values exist in the column
--    - Test performance of queries with boolean filter
--
-- 21. MAINTENANCE NOTES:
--    - Review validation functions periodically to ensure proper frontend/backend classification
--    - Monitor frontend bundle size if loading all frontend validations
--    - Consider implementing lazy loading for frontend validations
--    - Document clearly which validations are frontend-suitable
--    - Implement code review process for changing is_for_front flag
--    - Keep frontend validations simple and fast
--    - Always maintain backend validation regardless of frontend flag
--    - Regular security audits of frontend-exposed validation functions
--
-- 22. BEST PRACTICES FOR VALIDATION CLASSIFICATION:
--    Frontend-suitable (is_for_front = TRUE):
--    ✓ Format validations (email, phone, URL patterns)
--    ✓ Length validations (min/max character counts)
--    ✓ Range validations (numeric ranges)
--    ✓ Pattern matching (regex for common formats)
--    ✓ Type checking (number, string, boolean)
--    ✓ Required field checks
--
--    Backend-only (is_for_front = FALSE):
--    ✓ Database uniqueness checks
--    ✓ Security validations (authentication, authorization)
--    ✓ Business rule validations (proprietary logic)
--    ✓ Cross-record validations (referential integrity)
--    ✓ Resource-intensive validations (heavy computation)
--    ✓ Sensitive validations (rate limiting, fraud detection)
--
