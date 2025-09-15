CREATE OR REPLACE FUNCTION public.update_habit_stats()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    VOLATILE
    COST 100
AS $BODY$
DECLARE
    action_start_time TIMESTAMP WITH TIME ZONE;
    habit_uuid UUID;
    sql TEXT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Get habit_id and action start time
            habit_uuid := NEW.habit_id;
            SELECT start_time INTO action_start_time FROM actions WHERE id = NEW.action_id;
        
        UPDATE habits SET 
            total_actions_count = total_actions_count + 1,
            last_action_date = GREATEST(COALESCE(last_action_date, action_start_time), action_start_time)
        WHERE id = habit_uuid;
        RETURN NEW;
        
    ELSIF TG_OP = 'DELETE' THEN

        habit_uuid := OLD.habit_id;

        UPDATE habits SET 
            total_actions_count = GREATEST(total_actions_count - 1, 0),
            last_action_date =  (SELECT MAX(a.start_time) 
                FROM actions a
                WHERE a.id IN (
                    SELECT rl.action_id FROM TG_TABLE_NAME tgt WHERE tgt.habit_id = habit_uuid
                ))
        WHERE id = habit_uuid;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$BODY$;