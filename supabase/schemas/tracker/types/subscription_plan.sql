CREATE TYPE "tracker"."subscription_plan" AS ENUM (
  'monthly',
  'annual'
);

GRANT USAGE ON TYPE "tracker"."subscription_plan" TO "postgres";
