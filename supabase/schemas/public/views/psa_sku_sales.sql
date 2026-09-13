CREATE VIEW "public"."psa_sku_sales" AS  SELECT (item.value ->> 'name'::text) AS product_name,
    (item.value ->> 'sku'::text) AS sku,
    count(*) AS units_ordered,
    sum(COALESCE(((item.value ->> 'qty'::text))::integer, 1)) AS total_qty,
    sum((COALESCE(((item.value ->> 'price'::text))::numeric, (0)::numeric) * (COALESCE(((item.value ->> 'qty'::text))::integer, 1))::numeric)) AS revenue
   FROM public.psa_orders,
    LATERAL jsonb_array_elements(
        CASE
            WHEN (jsonb_typeof(psa_orders.line_items) = 'array'::text) THEN psa_orders.line_items
            ELSE '[]'::jsonb
        END) item(value)
  WHERE ((psa_orders.payment_status)::text = 'complete'::text)
  GROUP BY (item.value ->> 'name'::text), (item.value ->> 'sku'::text)
  ORDER BY (sum((COALESCE(((item.value ->> 'price'::text))::numeric, (0)::numeric) * (COALESCE(((item.value ->> 'qty'::text))::integer, 1))::numeric))) DESC;

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_sku_sales" TO "anon", "authenticated", "postgres", "service_role";
