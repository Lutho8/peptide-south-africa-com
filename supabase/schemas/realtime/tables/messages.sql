CREATE POLICY "Users read own-scoped realtime topics" ON "realtime"."messages"
  FOR SELECT
  TO "authenticated"
  USING ((realtime.topic() ~~ (('user:'::text || (auth.uid())::text) || ':%'::text)));

CREATE POLICY "Users send to own-scoped realtime topics" ON "realtime"."messages"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((realtime.topic() ~~ (('user:'::text || (auth.uid())::text) || ':%'::text)));
