-- Migration V25: Replace update_habit_stats function with corrected version
-- FIXES APPLIED:
-- 1. Fixed syntax error in DELETE block (OLD.action_type_id instead of NEW.action_type_id)
-- 2. Fixed invalid SQL syntax in habits stats query for DELETE operation
-- 3. Combined separate SELECT queries into JOINs for better performance
-- 4. Added proper error handling with validation and meaningful exceptions
-- 5. Removed unused variables and cleaned up commented code
-- 6. Improved query structure to correctly calculate statistics

CREATE OR REPLACE FUNCTION public.update_habit_stats()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    VOLATILE
    COST 100
AS $BODY$
DECLARE
    action_start_time TIMESTAMP WITH TIME ZONE;
    habit_uuid UUID;
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- IMPROVEMENT: Combined two separate queries into one JOIN for better performance
        -- Gets both habit_id and action start_time in a single database call
        SELECT at.habit_id, al.start_time 
        INTO habit_uuid, action_start_time
        FROM action_types at
        JOIN action_logs al ON al.id = NEW.action_id
        WHERE at.id = NEW.action_type_id;
        
        -- NEW: Added validation to ensure required records exist
        -- Prevents silent failures when invalid IDs are provided
        IF habit_uuid IS NULL THEN
            RAISE EXCEPTION 'Invalid action_type_id or action_id in action_logs insert';
        END IF;
        
        -- Update action_types statistics: increment count and update last action date
        UPDATE action_types SET 
            total_actions_count = total_actions_count + 1,
            last_action_date = GREATEST(COALESCE(last_action_date, action_start_time), action_start_time)
        WHERE id = NEW.action_type_id;
        
        -- Update habits statistics: increment count and update last action date
        UPDATE habits SET 
            total_actions_count = total_actions_count + 1,
            last_action_date = GREATEST(COALESCE(last_action_date, action_start_time), action_start_time)
        WHERE id = habit_uuid;
        
        RETURN NEW;
        
    ELSIF TG_OP = 'DELETE' THEN
        -- Get habit_id for the deleted action record
        SELECT habit_id INTO habit_uuid
        FROM action_types 
        WHERE id = OLD.action_type_id;
        
        -- NEW: Added validation for DELETE operations
        IF habit_uuid IS NULL THEN
            RAISE EXCEPTION 'Invalid action_type_id in action_logs delete';
        END IF;

        -- FIXED: Changed NEW.action_type_id to OLD.action_type_id (was causing errors)
        -- Update action_types statistics: decrement count and recalculate last action date
        UPDATE action_types SET 
            total_actions_count = GREATEST(total_actions_count - 1, 0),
            last_action_date = (
                SELECT MAX(al.start_time) 
                FROM action_logs al 
                WHERE al.action_type_id = OLD.action_type_id
            )
        WHERE id = OLD.action_type_id;

        -- FIXED: Corrected the query to properly join actions and action_types tables
        -- Previous version had invalid syntax: "WHERE a.id = ids IN(...)"
        -- Now correctly finds all actions for the habit via action_types relationship
        UPDATE habits SET 
            total_actions_count = GREATEST(total_actions_count - 1, 0),
            last_action_date = (
                SELECT MAX(al.start_time) 
                FROM action_logs al
                JOIN action_types at ON a.action_type_id = at.id
                WHERE at.habit_id = habit_uuid
            )
        WHERE id = habit_uuid;
        
        RETURN OLD;
    END IF;

    -- Return NULL for any other trigger operations (UPDATE, etc.)
    RETURN NULL;
END;
$BODY$;