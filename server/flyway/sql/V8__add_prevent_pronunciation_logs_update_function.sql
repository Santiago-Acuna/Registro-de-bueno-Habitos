CREATE OR REPLACE FUNCTION public.prevent_pronunciation_logs_update()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
  BEGIN
      RAISE EXCEPTION 'Updates are not allowed on pronunciation_logs table. Records are immutable.';
  END;
  
$BODY$;