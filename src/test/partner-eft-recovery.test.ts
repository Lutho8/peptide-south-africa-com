import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { describe, it, expect, vi } from 'vitest';

describe('EFT partner attribution failure recovery', () => {
  it('withholds payment instructions on attribution failure and retries before creating the payable record', async () => {
    const orderId = '11111111-1111-4111-8111-111111111111';
    const userId = '22222222-2222-4222-8222-222222222222';
    let handler: (r: Request) => Promise<Response>;
    let frozen = false, fail = true, payable: Record<string, unknown> | null = null;
    const writes: string[] = [];
    const admin = {
      rpc: vi.fn(async () => { if (fail) return { error: { message: 'temporary database failure' } }; frozen = true; return { error: null }; }),
      from(table: string) {
        let insert: Record<string, unknown> | null = null;
        const chain = {
          select: () => chain, eq: () => chain, limit: () => chain,
          maybeSingle: async () => ({ data: table === 'orders' ? { id: orderId, user_id: userId, total: 1000, currency: 'ZAR', order_description: 'Fixture' } : payable, error: null }),
          insert(value: Record<string, unknown>) { insert = value; return chain; },
          then(resolve: (v: unknown) => unknown) {
            if (insert) { writes.push(table); if (table === 'psa_orders') { expect(frozen).toBe(true); payable = insert; } }
            return Promise.resolve({ error: null }).then(resolve);
          },
        };
        return chain;
      },
    };
    const source = readFileSync('supabase/functions/eft-create-order/index.ts','utf8').replace(/^import .*;\r?\n/gm,'');
    const js = ts.transpile(source, { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None });
    vm.runInNewContext(js, {
      Deno: { serve: (fn: typeof handler) => { handler = fn; }, env: { get: (name: string) => name === 'CHECKOUT_STORE_SECRET' ? 'fixture-only' : 'fixture' } },
      createClient: (_url: string, _key: string, options: unknown) => options ? { auth: { getUser: async () => ({ data: { user: { id: userId } } }) } } : admin,
      validateStorefrontRequest: () => {}, quoteCheckout: () => ({ total:1000, subtotal:1000, description:'Fixture', shipping:0 }),
      PRICING: { currency:'ZAR', shipping:{country:'ZA',method:'courier'} }, variantPrice: () => 0,
      Response, crypto: globalThis.crypto, console: { error: () => {} },
    });
    const request = () => new Request('https://example.invalid/checkout', { method:'POST', headers: { Authorization:'Bearer fixture', 'x-checkout-store-secret':'fixture-only' }, body: JSON.stringify({ requestId:orderId, email:'fixture@example.invalid', selections:[{kind:'item',slug:'fixture',quantity:1}], partnerAttribution:{code:'FIXTURE',method:'entered_code'} }) });
    const failed = await handler!(request());
    expect(failed.status).toBe(503); expect(writes).toEqual([]);
    fail = false;
    const retried = await handler!(request());
    expect(retried.status).toBe(200); expect(writes).toEqual(['psa_orders','email_outbox','integration_logs']);
    const replayed = await handler!(request());
    expect(replayed.status).toBe(200); expect(writes).toEqual(['psa_orders','email_outbox','integration_logs']);
    expect(admin.rpc).toHaveBeenCalledTimes(2);
  });
});

