ALTER TABLE public.psa_cart_abandons DROP CONSTRAINT psa_cart_abandons_status_check;
ALTER TABLE public.psa_cart_abandons ADD CONSTRAINT psa_cart_abandons_status_check
  CHECK (status = ANY (ARRAY['abandoned','email_1_sent','email_2_sent','whatsapp_sent','recovered','expired','test']));;
