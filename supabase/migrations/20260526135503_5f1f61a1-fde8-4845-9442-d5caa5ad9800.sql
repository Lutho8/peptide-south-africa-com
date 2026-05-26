DROP POLICY IF EXISTS "Authenticated users can read realtime" ON realtime.messages;
DROP POLICY IF EXISTS "Authenticated users can send realtime" ON realtime.messages;

CREATE POLICY "Users read own-scoped realtime topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() LIKE 'user:' || auth.uid()::text || ':%'
);

CREATE POLICY "Users send to own-scoped realtime topics"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  realtime.topic() LIKE 'user:' || auth.uid()::text || ':%'
);