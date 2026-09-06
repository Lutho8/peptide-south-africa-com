import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
    from: () => ({ insert: vi.fn().mockResolvedValue({ data: null, error: null }) }),
  },
}));

import { trackEvent } from "@/lib/analytics";

describe("Meta Purchase integrity — analytics.ts", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let fbqMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.stubEnv("MODE", "production");
    fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal("fetch", fetchMock);
    fbqMock = vi.fn();
    window.fbq = fbqMock;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    delete window.fbq;
  });

  it("never fires Purchase — via Pixel or CAPI relay — from eft_instructions_shown", async () => {
    trackEvent({
      event: "eft_instructions_shown",
      props: { order_id: "order-123", server_confirmed_amount_zar: 1999 },
    });
    // sendCapiRelay is fire-and-forget; flush its microtask queue.
    await Promise.resolve();
    await Promise.resolve();

    for (const call of fbqMock.mock.calls) {
      expect(call[1]).not.toBe("Purchase");
    }
    for (const call of fetchMock.mock.calls) {
      const body = call[1]?.body ? JSON.parse(call[1].body as string) : {};
      expect(body.eventName).not.toBe("Purchase");
    }
  });

  it("fires eft_instructions_shown as a custom Pixel event with no value/currency", () => {
    trackEvent({
      event: "eft_instructions_shown",
      props: { order_id: "order-123", server_confirmed_amount_zar: 1999 },
    });

    expect(fbqMock).toHaveBeenCalledTimes(1);
    const [, eventName, props] = fbqMock.mock.calls[0];
    expect(eventName).toBe("eft_instructions_shown");
    expect(fbqMock.mock.calls[0][0]).toBe("trackCustom");
    expect(props).not.toHaveProperty("value");
    expect(props).not.toHaveProperty("currency");
  });

  it("does not relay eft_instructions_shown to /api/meta-capi", async () => {
    trackEvent({
      event: "eft_instructions_shown",
      props: { order_id: "order-123", server_confirmed_amount_zar: 1999 },
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("still fires InitiateCheckout for checkout_started, unaffected by the Purchase change", async () => {
    trackEvent({
      event: "checkout_started",
      props: { displayed_price_zar: 1999, item_count: 2 },
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(fbqMock).toHaveBeenCalledWith(
      "track",
      "InitiateCheckout",
      expect.objectContaining({ value: 1999, currency: "ZAR" }),
      expect.any(Object),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.eventName).toBe("InitiateCheckout");
  });

  it("still fires Lead for book_consult_clicked, unaffected by the Purchase change", async () => {
    trackEvent({
      event: "book_consult_clicked",
      props: { offer_id: "fat-loss-protocol", displayed_price_zar: 1999 },
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(fbqMock).toHaveBeenCalledWith(
      "track",
      "Lead",
      expect.objectContaining({ value: 1999, currency: "ZAR" }),
      expect.any(Object),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.eventName).toBe("Lead");
  });
});
