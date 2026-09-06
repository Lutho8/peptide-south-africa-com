import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../api/_shared/metaCapi", () => ({ sendMetaCapiEvent: vi.fn().mockResolvedValue(undefined) }));

import handler from "../../api/meta-capi";
import { sendMetaCapiEvent } from "../../api/_shared/metaCapi";

let ipCounter = 0;
function nextIp(): string {
  ipCounter += 1;
  return `203.0.113.${ipCounter}`;
}

function makeRequest(opts: {
  method?: string;
  origin?: string;
  host?: string;
  ip?: string;
  body?: unknown;
}): Request {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (opts.host !== undefined) headers.host = opts.host;
  if (opts.origin !== undefined) headers.origin = opts.origin;
  headers["x-forwarded-for"] = opts.ip ?? nextIp();

  return new Request("https://peptide-south-africa.com/api/meta-capi", {
    method: opts.method ?? "POST",
    headers,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
}

const validLead = { eventName: "Lead", eventId: "lead-1" };

describe("/api/meta-capi allowlist and stripping", () => {
  beforeEach(() => {
    vi.mocked(sendMetaCapiEvent).mockClear();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects Purchase outright, even same-origin", async () => {
    const req = makeRequest({
      host: "peptide-south-africa.com",
      origin: "https://peptide-south-africa.com",
      body: { eventName: "Purchase", eventId: "purchase-order-1", customData: { value: 1999, currency: "ZAR" } },
    });
    const res = await handler(req);
    expect(res.status).toBe(400);
    expect(sendMetaCapiEvent).not.toHaveBeenCalled();
  });

  it("rejects an unrecognised eventName", async () => {
    const req = makeRequest({
      host: "peptide-south-africa.com",
      origin: "https://peptide-south-africa.com",
      body: { eventName: "AddToCart", eventId: "atc-1" },
    });
    const res = await handler(req);
    expect(res.status).toBe(400);
    expect(sendMetaCapiEvent).not.toHaveBeenCalled();
  });

  it("rejects a cross-origin request", async () => {
    const req = makeRequest({
      host: "peptide-south-africa.com",
      origin: "https://evil.example.com",
      body: validLead,
    });
    const res = await handler(req);
    expect(res.status).toBe(403);
    expect(sendMetaCapiEvent).not.toHaveBeenCalled();
  });

  it("rejects a request with no Origin/Referer at all", async () => {
    const req = makeRequest({ host: "peptide-south-africa.com", body: validLead });
    const res = await handler(req);
    expect(res.status).toBe(403);
    expect(sendMetaCapiEvent).not.toHaveBeenCalled();
  });

  it("accepts Lead same-origin and strips value/currency from customData", async () => {
    const req = makeRequest({
      host: "peptide-south-africa.com",
      origin: "https://peptide-south-africa.com",
      body: {
        eventName: "Lead",
        eventId: "lead-2",
        customData: { value: 1999, currency: "ZAR", content_ids: ["fat-loss-protocol"] },
      },
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
    expect(sendMetaCapiEvent).toHaveBeenCalledTimes(1);
    const sentEvent = vi.mocked(sendMetaCapiEvent).mock.calls[0][0];
    expect(sentEvent.eventName).toBe("Lead");
    expect(sentEvent.customData).toEqual({ content_ids: ["fat-loss-protocol"] });
  });

  it("accepts InitiateCheckout from the www host", async () => {
    const req = makeRequest({
      host: "www.peptide-south-africa.com",
      origin: "https://www.peptide-south-africa.com",
      body: { eventName: "InitiateCheckout", eventId: "ic-1" },
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
    expect(sendMetaCapiEvent).toHaveBeenCalledTimes(1);
  });

  it("rate-limits repeated requests from the same IP", async () => {
    const ip = nextIp();
    const send = () => handler(makeRequest({
      host: "peptide-south-africa.com",
      origin: "https://peptide-south-africa.com",
      ip,
      body: { eventName: "Lead", eventId: `lead-${Math.random()}` },
    }));

    const responses = [];
    for (let i = 0; i < 25; i++) {
      responses.push(await send());
    }
    const statuses = responses.map((r) => r.status);
    expect(statuses).toContain(429);
    expect(statuses.filter((s) => s === 200).length).toBeLessThan(25);
  });
});
