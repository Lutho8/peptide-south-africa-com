import { createClient } from '@supabase/supabase-js';
import { verifyGuestTrackingToken } from './_shared/guestTracking.js';
export const config = { runtime: 'edge' };
export default async function handler(request: Request): Promise<Response> {
  const response = (body: unknown, status=200) => Response.json(body,{status,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
  if (request.method !== 'POST') return response({error:'Method not allowed'},405);
  const secret=process.env.SUPABASE_SERVICE_ROLE_KEY, url=process.env.SUPABASE_URL;
  if (!secret || !url) return response({error:'Tracking temporarily unavailable'},503);
  const body = await request.json().catch(()=>null);
  const orderId = typeof body?.token === 'string' && body.token.length < 300 ? await verifyGuestTrackingToken(body.token,secret) : null;
  if (!orderId) return response({error:'This tracking link is invalid or expired.'},404);
  const admin = createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error} = await admin.from('orders').select('id,user_id,status,total,currency').eq('id',orderId).is('user_id',null).maybeSingle();
  if (error) return response({error:'Tracking temporarily unavailable'},503);
  if (!data) return response({error:'This tracking link is invalid or expired.'},404);
  return response({status:data.status,total:data.total,currency:data.currency});
}
