/** Signed bearer capability for one order; callers must keep tokens out of logs. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_AGE_SECONDS = 90 * 24 * 60 * 60;
const encode = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
const decode = (input: string) => {
  if (!/^[A-Za-z0-9_-]+$/.test(input)) throw new Error('Invalid token');
  const value = input.replaceAll('-','+').replaceAll('_','/');
  return Uint8Array.from(atob(value.padEnd(Math.ceil(value.length / 4) * 4,'=')), c => c.charCodeAt(0));
};
async function key(secret: string) {
  if (!secret || secret.length < 32) throw new Error('Tracking is not configured');
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['sign','verify']);
}
export async function createGuestTrackingToken(orderId: string, secret: string, now = Date.now()) {
  if (!UUID.test(orderId)) throw new Error('Invalid order');
  const issued = Math.floor(now / 1000);
  const payload = `v1.${orderId.toLowerCase()}.${issued}`;
  const signature = await crypto.subtle.sign('HMAC', await key(secret), new TextEncoder().encode(payload));
  return `${payload}.${encode(new Uint8Array(signature))}`;
}
export async function verifyGuestTrackingToken(token: string, secret: string, now = Date.now()): Promise<string | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 4 || parts[0] !== 'v1' || !UUID.test(parts[1]) || !/^\d{10}$/.test(parts[2])) return null;
    const issued = Number(parts[2]), current = Math.floor(now / 1000);
    if (issued > current + 300 || current - issued > MAX_AGE_SECONDS) return null;
    const valid = await crypto.subtle.verify('HMAC', await key(secret), decode(parts[3]), new TextEncoder().encode(parts.slice(0,3).join('.')));
    return valid ? parts[1] : null;
  } catch { return null; }
}
