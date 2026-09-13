CREATE OR REPLACE FUNCTION public.psa_pets_join_waitlist (
  p_ticket_code     text,
  p_owner_name      text,
  p_email           text,
  p_whatsapp        text    DEFAULT NULL::text,
  p_pet_type        text    DEFAULT NULL::text,
  p_pet_breed       text    DEFAULT NULL::text,
  p_pet_age         integer DEFAULT NULL::integer,
  p_city            text    DEFAULT NULL::text,
  p_products        jsonb   DEFAULT '[]'::jsonb,
  p_primary_concern text    DEFAULT NULL::text,
  p_referred_by     text    DEFAULT NULL::text,
  p_source          text    DEFAULT 'pets-landing'::text,
  p_locale          text    DEFAULT 'en'::text,
  p_consent_popia   boolean DEFAULT false,
  p_utm             jsonb   DEFAULT '{}'::jsonb,
  p_quiz_answers    jsonb   DEFAULT NULL::jsonb
)
  RETURNS TABLE (
    ticket_code  text,
    queue_number bigint
  )
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  v_ticket text;
begin
  if not p_consent_popia then
    raise exception 'POPIA consent is required' using errcode = '22023';
  end if;
  if char_length(btrim(coalesce(p_owner_name, ''))) < 2
     or char_length(p_owner_name) > 120 then
    raise exception 'Invalid owner name' using errcode = '22023';
  end if;
  if char_length(btrim(coalesce(p_email, ''))) > 320
     or btrim(coalesce(p_email, '')) !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'Invalid email address' using errcode = '22023';
  end if;
  if p_whatsapp is not null and char_length(p_whatsapp) > 32 then
    raise exception 'Invalid WhatsApp number' using errcode = '22023';
  end if;
  if p_pet_age is not null and (p_pet_age < 0 or p_pet_age > 80) then
    raise exception 'Invalid pet age' using errcode = '22023';
  end if;
  if jsonb_typeof(coalesce(p_products, '[]'::jsonb)) <> 'array' then
    raise exception 'Products must be an array' using errcode = '22023';
  end if;

  v_ticket := case
    when coalesce(p_ticket_code, '') ~ '^WL-PTD-[A-Z0-9]{4,12}$' then p_ticket_code
    else 'WL-PTD-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
  end;

  return query
  insert into public.psa_pets_waitlist (
    ticket_code,
    owner_name,
    email,
    whatsapp,
    pet_type,
    pet_breed,
    pet_age,
    city,
    products,
    primary_concern,
    referral_code,
    referred_by,
    source,
    locale,
    consent_popia,
    utm,
    quiz_answers
  )
  values (
    v_ticket,
    btrim(p_owner_name),
    lower(btrim(p_email)),
    nullif(btrim(coalesce(p_whatsapp, '')), ''),
    nullif(btrim(coalesce(p_pet_type, '')), ''),
    nullif(btrim(coalesce(p_pet_breed, '')), ''),
    p_pet_age,
    nullif(btrim(coalesce(p_city, '')), ''),
    coalesce(p_products, '[]'::jsonb),
    nullif(btrim(coalesce(p_primary_concern, '')), ''),
    v_ticket,
    nullif(btrim(coalesce(p_referred_by, '')), ''),
    left(coalesce(nullif(btrim(p_source), ''), 'pets-landing'), 80),
    case when p_locale in ('en', 'af') then p_locale else 'en' end,
    true,
    coalesce(p_utm, '{}'::jsonb),
    p_quiz_answers
  )
  on conflict (email_normalized) do update
  set owner_name = excluded.owner_name,
      whatsapp = coalesce(excluded.whatsapp, public.psa_pets_waitlist.whatsapp),
      pet_type = coalesce(excluded.pet_type, public.psa_pets_waitlist.pet_type),
      pet_breed = coalesce(excluded.pet_breed, public.psa_pets_waitlist.pet_breed),
      pet_age = coalesce(excluded.pet_age, public.psa_pets_waitlist.pet_age),
      city = coalesce(excluded.city, public.psa_pets_waitlist.city),
      products = case
        when jsonb_array_length(excluded.products) > 0 then excluded.products
        else public.psa_pets_waitlist.products
      end,
      primary_concern = coalesce(excluded.primary_concern, public.psa_pets_waitlist.primary_concern),
      referred_by = coalesce(public.psa_pets_waitlist.referred_by, excluded.referred_by),
      source = excluded.source,
      locale = excluded.locale,
      consent_popia = true,
      utm = public.psa_pets_waitlist.utm || excluded.utm,
      quiz_answers = coalesce(excluded.quiz_answers, public.psa_pets_waitlist.quiz_answers)
  returning psa_pets_waitlist.ticket_code, psa_pets_waitlist.queue_number;
end;
$function$;

GRANT EXECUTE
  ON FUNCTION "public"."psa_pets_join_waitlist"(text, text, text, text, text, text, integer, text, jsonb, text, text, text, text, boolean, jsonb, jsonb)
  TO "anon", "authenticated", "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."psa_pets_join_waitlist"(text, text, text, text, text, text, integer, text, jsonb, text, text, text, text, boolean, jsonb, jsonb) FROM PUBLIC;
