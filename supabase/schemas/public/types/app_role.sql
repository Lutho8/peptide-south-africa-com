CREATE TYPE "public"."app_role" AS ENUM (
  'admin',
  'user'
);

GRANT USAGE ON TYPE "public"."app_role" TO "postgres";
