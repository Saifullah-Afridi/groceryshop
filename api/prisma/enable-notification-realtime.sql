-- Run once in Supabase SQL Editor after deploying the API/frontend changes.
-- The custom, short-lived Realtime JWT contains rakan_role and rakan_customer_id
-- claims minted by the API. Only notification rows for that audience are visible.

ALTER TABLE public."Notification" ENABLE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON TABLE public."Notification" TO authenticated;

DROP POLICY IF EXISTS "rakan_notifications_realtime_select" ON public."Notification";
CREATE POLICY "rakan_notifications_realtime_select"
ON public."Notification"
FOR SELECT
TO authenticated
USING (
  (
    audience = 'ADMIN'
    AND (auth.jwt() -> 'app_metadata' ->> 'rakan_role') = 'admin'
  )
  OR
  (
    audience = 'CUSTOMER'
    AND (auth.jwt() -> 'app_metadata' ->> 'rakan_role') = 'customer'
    AND "customerId"::text = (auth.jwt() -> 'app_metadata' ->> 'rakan_customer_id')
  )
);

-- Add the Prisma-created table to Supabase's Realtime publication, if not already present.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'Notification'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public."Notification";
  END IF;
END
$$;
