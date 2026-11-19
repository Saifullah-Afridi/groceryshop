-- Push notification inserts to every API instance listening on this channel.
-- PostgreSQL delivers NOTIFY only after the transaction commits.
CREATE OR REPLACE FUNCTION public.notify_rakan_notification_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM pg_notify(
    'rakan_notification_created',
    json_build_object(
      'id', NEW."id",
      'audience', NEW."audience",
      'customerId', NEW."customerId"
    )::text
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS rakan_notification_inserted ON public."Notification";
CREATE TRIGGER rakan_notification_inserted
AFTER INSERT ON public."Notification"
FOR EACH ROW
EXECUTE FUNCTION public.notify_rakan_notification_insert();
