 -- Only used for integration testing SQL connectors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_database WHERE datname = 'csumb_webapp'
  ) THEN
    CREATE DATABASE csumb_webapp;
  END IF;
END
$$;