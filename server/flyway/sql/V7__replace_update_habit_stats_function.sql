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
        -- Get habit_id and action start time
        IF TG_TABLE_NAME = 'reading_logs' THEN
            habit_uuid := NEW.habit_id;
            SELECT start_time INTO action_start_time FROM actions WHERE id = NEW.action_id;
        ELSIF TG_TABLE_NAME = 'pronunciation_logs' THEN
            habit_uuid := NEW.habit_id;
            SELECT start_time INTO action_start_time FROM actions WHERE id = NEW.action_id;
        END IF;
        
        UPDATE habits SET 
            total_actions_count = total_actions_count + 1,
            last_action_date = GREATEST(COALESCE(last_action_date, action_start_time), action_start_time)
        WHERE id = habit_uuid;
        RETURN NEW;
        
    ELSIF TG_OP = 'DELETE' THEN
        -- Get habit_id
        IF TG_TABLE_NAME = 'reading_logs' THEN
            habit_uuid := OLD.habit_id;
        ELSIF TG_TABLE_NAME = 'pronunciation_logs' THEN
            habit_uuid := OLD.habit_id;
        END IF;
        
        UPDATE habits SET 
            total_actions_count = GREATEST(total_actions_count - 1, 0),
            last_action_date = (
                SELECT MAX(a.start_time) 
                FROM actions a
                WHERE a.id IN (
                    SELECT rl.action_id FROM reading_logs rl WHERE rl.habit_id = habit_uuid
                    UNION
                    SELECT pl.action_id FROM pronunciation_logs pl WHERE pl.habit_id = habit_uuid
                )
                AND a.id != (CASE 
                    WHEN TG_TABLE_NAME = 'reading_logs' THEN OLD.action_id
                    WHEN TG_TABLE_NAME = 'pronunciation_logs' THEN OLD.action_id
                END)
            )
        WHERE id = habit_uuid;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$BODY$;