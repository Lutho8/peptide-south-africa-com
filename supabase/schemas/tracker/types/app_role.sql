CREATE TYPE "tracker"."app_role" AS ENUM (
  'admin',
  'user'
);

GRANT USAGE ON TYPE "tracker"."app_role" TO "postgres";
