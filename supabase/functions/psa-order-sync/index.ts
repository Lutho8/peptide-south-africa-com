// PSA Order Sync — Receives external order webhooks and syncs non-payment CRM data.
// EFT reconciliation is the sole authority allowed to settle PSA payments.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
function response(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}
// RFM segmentation logic
function calculateSegment(r, f, m) {
  if (f >= 3 && m >= 5000) return 'VIP';
  if (f >= 2 && m >= 2500) return 'Loyal';
  if (f === 1 && r <= 30) return 'New';
  if (r > 90 && f >= 1) return 'At-Risk';
  if (r > 180) return 'Churned';
  return 'Regular';
}
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') return new Response('ok', {
    headers: corsHeaders
  });
  const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '');
  try {
    const order = await req.json();
    const now = new Date().toISOString();
    // Validation
    if (!order.id || !order.total || !order.billing?.email) {
      return response(400, {
        ok: false,
        error: 'Missing order id, total, or customer email'
      });
    }
    const email = order.billing.email;
    // 1. Upsert non-payment order data. External webhooks must not write
    // payment_status, payment_reference, or payment_settled_at.
    const { data: orderResult, error: orderError } = await supabase.from('psa_orders').upsert({
      order_id: order.id,
      customer_id: order.customer_id || null,
      customer_email: email,
      customer_phone: order.billing?.phone || null,
      order_total: order.total,
      order_status: order.status,
      line_items: order.line_items || [],
      shipping_address: order.shipping || {},
      billing_address: order.billing || {},
      coupon_codes: order.coupon_lines || [],
      subscription_id: order.meta_data?.subscription_id || null,
      affiliate_id: order.meta_data?.affiliate_id || null,
      source: order.meta_data?.utm_source || 'direct',
      medium: order.meta_data?.utm_medium || null,
      campaign: order.meta_data?.utm_campaign || null,
      created_at: order.date_created || now,
      updated_at: now
    }, {
      onConflict: 'order_id'
    }).select();
    if (orderError) throw orderError;
    // 2. Fetch existing customer for LTV calculation
    const { data: existingCustomer } = await supabase.from('psa_customers').select('email, ltv, order_count, last_order_date, created_at').eq('email', email).single();
    const currentLtv = (existingCustomer?.ltv || 0) + (order.total || 0);
    const orderCount = (existingCustomer?.order_count || 0) + 1;
    const lastOrderDate = order.date_created || now;
    const daysSinceLastOrder = existingCustomer?.last_order_date ? Math.floor((new Date(lastOrderDate).getTime() - new Date(existingCustomer.last_order_date).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const segment = calculateSegment(daysSinceLastOrder, orderCount, currentLtv);
    // 3. Upsert customer with updated LTV
    const customerData = {
      email,
      ltv: currentLtv,
      order_count: orderCount,
      last_order_date: lastOrderDate,
      last_order_value: order.total || 0,
      segment,
      updated_at: now
    };
    if (!existingCustomer) {
      customerData.first_name = order.billing?.first_name || '';
      customerData.last_name = order.billing?.last_name || '';
      customerData.phone = order.billing?.phone || '';
      customerData.created_at = now;
      customerData.consent_email = false;
      customerData.consent_whatsapp = false;
      customerData.persona_tag = 'Unknown';
    }
    const { data: customerResult, error: customerError } = await supabase.from('psa_customers').upsert(customerData, {
      onConflict: 'email'
    }).select();
    if (customerError) throw customerError;
    // 4. Trigger downstream actions based on segment/status
    const triggers = [];
    if ([
      'VIP',
      'At-Risk',
      'Churned'
    ].includes(segment)) {
      triggers.push('retention_agent');
    }
    if ([
      'refunded',
      'failed',
      'cancelled'
    ].includes(order.status)) {
      triggers.push('ecommerce_agent');
    }
    // 5. If abandoned cart event
    if (order.status === 'pending' && !order.payment_method) {
      triggers.push('abandoned_cart');
    }
    return response(200, {
      ok: true,
      order_id: order.id,
      customer_email: email,
      order_status: order.status,
      segment,
      ltv: currentLtv,
      order_count: orderCount,
      triggers,
      timestamp: now
    });
  } catch (err) {
    console.error('OrderSync error:', err);
    return response(500, {
      ok: false,
      error: err.message || 'Internal error',
      timestamp: new Date().toISOString()
    });
  }
});
