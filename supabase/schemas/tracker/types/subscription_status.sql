CREATE TYPE "tracker"."subscription_status" AS ENUM (
  'active',
  'trialing',
  'past_due',
  'canceled',
  'incomplete',
  'pending',
  'paused'
);

GRANT USAGE ON TYPE "tracker"."subscription_status" TO "postgres";
