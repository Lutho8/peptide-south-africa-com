SELECT cron.schedule(
  'nocobase-abandoned-cart-hourly',
  '0 * * * *',
  $$
    SELECT net.http_post(
      url:='https://eutszmrsukoqqeilzrbv.supabase.co/functions/v1/nocobase-abandoned-cart',
      headers:='{"Content-Type": "application/json", "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dHN6bXJzdWtvcXFlaWx6cmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMDE4MzQsImV4cCI6MjA5NjY3NzgzNH0.dbqlf7l8ViMMODYxw2Hpsz44g9w3ecMvu5qQXnm82ng"}'::jsonb,
      body:='{}'::jsonb
    );
  $$
);