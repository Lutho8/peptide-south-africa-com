SELECT cron.schedule(
  'nocobase-abandoned-cart-hourly',
  '0 * * * *',
  $$
    SELECT net.http_post(
      url:='https://cveapedneuhgbxqydpjc.supabase.co/functions/v1/nocobase-abandoned-cart',
      headers:='{"Content-Type": "application/json", "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZWFwZWRuZXVoZ2J4cXlkcGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzA1MzEsImV4cCI6MjA5MDgwNjUzMX0.76qqZ59_X_-C-mVW_7VrzLcAIM44xuZ6Y14LPuL1j-A"}'::jsonb,
      body:='{}'::jsonb
    );
  $$
);