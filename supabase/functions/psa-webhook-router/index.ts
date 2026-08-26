import { createClient } from "@supabase/supabase-js";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({
      error: "Method not allowed"
    }), {
      status: 405,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  try {
    const body = await req.json();
    const { event_type, source_site, payload } = body;
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://eutszmrsukoqqeilzrbv.supabase.co";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    const validSites = [
      "peptide-south-africa.com",
      "peptide-south-africa.co.za",
      "capetownpeptideclub.co.za"
    ];
    if (!validSites.includes(source_site)) {
      return new Response(JSON.stringify({
        error: "Invalid source_site"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    let result = null;
    switch(event_type){
      case "lead_capture":
        {
          const { email, first_name, last_name, phone, city, province, persona_tag, utm_source, utm_medium, utm_campaign, landing_page } = payload;
          const { data, error } = await supabase.from("psa_leads").insert({
            email,
            first_name,
            last_name,
            phone,
            city,
            province,
            source_site,
            persona_tag: persona_tag || "unknown",
            stage: "lead",
            first_touch_at: new Date().toISOString(),
            last_touch_at: new Date().toISOString(),
            lead_score: 10,
            nurture_sequence_step: 0,
            consent_email: true,
            utm_source,
            utm_medium,
            utm_campaign,
            landing_page
          }).select();
          if (error) throw error;
          result = {
            type: "lead_created",
            id: data?.[0]?.id
          };
          break;
        }
      case "cart_abandoned":
        {
          const { email, user_id, cart_items, cart_subtotal } = payload;
          const { data, error } = await supabase.from("psa_cart_abandons").insert({
            email,
            user_id,
            cart_items,
            cart_subtotal,
            source_site,
            abandoned_at: new Date().toISOString(),
            status: "abandoned",
            discount_pct: 10
          }).select();
          if (error) throw error;
          result = {
            type: "cart_abandoned",
            id: data?.[0]?.id
          };
          break;
        }
      case "order_completed":
        {
          // EFT reconciliation is the sole payment-settlement authority. This
          // generic webhook must never turn an external completion event into a
          // paid PSA order.
          return new Response(JSON.stringify({
            error: "External order settlement is retired; use the EFT reconciliation workflow",
            code: "EFT_ONLY"
          }), {
            status: 410,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json"
            }
          });
        }
      case "event_registration":
        {
          const { email, user_id, event_id, first_name, last_name, phone } = payload;
          const { data, error } = await supabase.from("psa_event_registrations").insert({
            email,
            user_id,
            event_id,
            first_name,
            last_name,
            phone,
            source_site,
            status: "registered",
            registered_at: new Date().toISOString()
          }).select();
          if (error) throw error;
          result = {
            type: "event_registered",
            id: data?.[0]?.id
          };
          break;
        }
      case "page_view":
        {
          const { email, user_id, page_url, session_id } = payload;
          await supabase.from("psa_tracker_events").insert({
            email,
            user_id,
            event_type: "page_view",
            page_url,
            session_id,
            source_site,
            timestamp: new Date().toISOString()
          });
          result = {
            type: "tracker_event_logged"
          };
          break;
        }
      case "product_view":
        {
          const { email, user_id, product_sku, product_name } = payload;
          await supabase.from("psa_tracker_events").insert({
            email,
            user_id,
            event_type: "product_view",
            product_sku,
            product_name,
            source_site,
            timestamp: new Date().toISOString()
          });
          result = {
            type: "tracker_event_logged"
          };
          break;
        }
      case "email_opened":
        {
          const { email, email_template_id, campaign_id } = payload;
          await supabase.from("psa_email_sends").insert({
            email,
            email_template_id,
            campaign_id,
            status: "opened",
            opened_at: new Date().toISOString()
          });
          await supabase.from("psa_leads").update({
            nurture_emails_opened: supabase.rpc("increment", {
              x: 1
            }),
            last_touch_at: new Date().toISOString()
          }).eq("email", email);
          result = {
            type: "email_open_logged"
          };
          break;
        }
      case "email_clicked":
        {
          const { email, email_template_id, campaign_id, link_url } = payload;
          await supabase.from("psa_email_sends").insert({
            email,
            email_template_id,
            campaign_id,
            status: "clicked",
            link_url,
            clicked_at: new Date().toISOString()
          });
          await supabase.from("psa_leads").update({
            nurture_emails_clicked: supabase.rpc("increment", {
              x: 1
            }),
            lead_score: supabase.rpc("increment", {
              x: 5
            }),
            last_touch_at: new Date().toISOString()
          }).eq("email", email);
          result = {
            type: "email_click_logged"
          };
          break;
        }
      default:
        return new Response(JSON.stringify({
          error: "Unknown event_type"
        }), {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
    }
    return new Response(JSON.stringify({
      success: true,
      event_type,
      source_site,
      result,
      routed_to: event_type,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("Webhook router error:", err);
    return new Response(JSON.stringify({
      error: err.message || "Internal error"
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
