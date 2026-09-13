DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'crm_reader') THEN
    CREATE ROLE crm_reader NOLOGIN;
  END IF;
END
$$;
