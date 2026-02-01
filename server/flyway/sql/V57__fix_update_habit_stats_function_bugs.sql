-- Migration V57: Fix update_habit_stats function bugs
-- CRITICAL FIXES:
-- 1. Fixed NEW.action_id to NEW.id (action_logs has 'id' column, not 'action_id')
-- 2. Removed unnecessary self-join to action_logs in INSERT (NEW already contains start_time)
-- 3. Fixed undefined alias 'a' to 'al' in DELETE section (line 79 in V25)
-- 4. Added exclusion of deleted row in recalculation queries
--
-- CONTEXT: The trigger is attached to action_logs table, so NEW/OLD refer to action_logs rows
-- which have columns: id, start_time, end_time, action_type_id (NOT action_id)

CREATE OR REPLACE FUNCTION public.update_habit_stats()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    VOLATILE
    COST 100
AS $BODY$
DECLARE
    habit_uuid UUID;
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Get habit_id from action_types
        -- FIXED: Removed join to action_logs - NEW already has start_time
        -- FIXED: No reference to NEW.action_id (doesn't exist)
        SELECT at.habit_id
        INTO habit_uuid
        FROM action_types at
        WHERE at.id = NEW.action_type_id;

        -- Validation to ensure required records exist
        IF habit_uuid IS NULL THEN
            RAISE EXCEPTION 'Invalid action_type_id: % in action_logs insert', NEW.action_type_id;
        END IF;

        -- Update action_types statistics
        -- FIXED: Use NEW.start_time directly (it's already available in NEW)
        UPDATE action_types SET
            total_actions_count = total_actions_count + 1,
            last_action_date = GREATEST(
                COALESCE(last_action_date, NEW.start_time),
                NEW.start_time
            )
        WHERE id = NEW.action_type_id;

        -- Update habits statistics
        UPDATE habits SET
            total_actions_count = total_actions_count + 1,
            last_action_date = GREATEST(
                COALESCE(last_action_date, NEW.start_time),
                NEW.start_time
            )
        WHERE id = habit_uuid;

        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        -- Get habit_id for the deleted action record
        SELECT habit_id INTO habit_uuid
        FROM action_types
        WHERE id = OLD.action_type_id;

        -- Validation for DELETE operations
        IF habit_uuid IS NULL THEN
            RAISE EXCEPTION 'Invalid action_type_id: % in action_logs delete', OLD.action_type_id;
        END IF;

        -- Update action_types statistics: decrement count and recalculate last action date
        -- IMPROVEMENT: Exclude the row being deleted from recalculation
        UPDATE action_types SET
            total_actions_count = GREATEST(total_actions_count - 1, 0),
            last_action_date = (
                SELECT MAX(al.start_time)
                FROM action_logs al
                WHERE al.action_type_id = OLD.action_type_id
                  AND al.id != OLD.id  -- Exclude the row being deleted
            )
        WHERE id = OLD.action_type_id;

        -- CRITICAL FIX: Changed 'a.action_type_id' to 'al.action_type_id'
        -- The alias 'a' was undefined - should be 'al'
        -- IMPROVEMENT: Exclude the row being deleted from recalculation
        UPDATE habits SET
            total_actions_count = GREATEST(total_actions_count - 1, 0),
            last_action_date = (
                SELECT MAX(al.start_time)
                FROM action_logs al
                JOIN action_types at ON al.action_type_id = at.id  -- FIXED: al not a
                WHERE at.habit_id = habit_uuid
                  AND al.id != OLD.id  -- Exclude the row being deleted
            )
        WHERE id = habit_uuid;

        RETURN OLD;
    END IF;

    -- Return NULL for any other trigger operations (UPDATE, etc.)
    RETURN NULL;
END;
$BODY$;
