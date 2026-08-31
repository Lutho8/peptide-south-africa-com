// Keep the serverless redirect table self-contained. Vercel deploys `api/` as
// an isolated function bundle, so runtime imports from the Vite `src/` tree
// are not guaranteed to be present in /var/task.
const COA_SCAN_DESTINATIONS = {
  m01: {
    product: "MOTS-C 10 mg",
    taskNumber: "83567",
    url: "https://verify.janoshik.com/tests/83567_HGNB5E53261C",
  },
  r01: {
    product: "Retatrutide 10 mg",
    taskNumber: "61141",
    url: "https://verify.janoshik.com/tests/61141_UMR871KAJ2N9",
  },
  z01: {
    product: "Tirzepatide supplier source report",
    taskNumber: "164662",
    url: "https://verify.janoshik.com/tests/164662_D9DXNXDK1YM4",
  },
  t01: {
    product: "Tesamorelin supplier source report",
    taskNumber: "164644",
    url: "https://verify.janoshik.com/tests/164644_ILEI5C8YKHME",
  },
} as const;

type CoaScanCode = keyof typeof COA_SCAN_DESTINATIONS;

function isCoaScanCode(value: string): value is CoaScanCode {
  return Object.prototype.hasOwnProperty.call(COA_SCAN_DESTINATIONS, value);
}

export interface CoaScanResolution {
  code: string;
  destination: string;
  found: boolean;
  product?: string;
  taskNumber?: string;
}

const UNKNOWN_SCAN_DESTINATION = "https://www.peptide-south-africa.com/testing?scan=unknown";

export function resolveCoaScan(rawCode: string | string[] | undefined): CoaScanResolution {
  const first = Array.isArray(rawCode) ? rawCode[0] : rawCode;
  const code = (first ?? "").trim().toLowerCase();

  if (!isCoaScanCode(code)) {
    return { code: "unknown", destination: UNKNOWN_SCAN_DESTINATION, found: false };
  }

  const record = COA_SCAN_DESTINATIONS[code];
  return {
    code,
    destination: record.url,
    found: true,
    product: record.product,
    taskNumber: record.taskNumber,
  };
}

/**
 * Anonymous QR telemetry endpoint.
 *
 * The structured event deliberately excludes IP addresses, user agents,
 * referrers, cookies, query strings and customer identifiers. It records only
 * the public short code and published supplier-report metadata before issuing
 * a temporary redirect to the independent laboratory verification page.
 */
export const config = { runtime: "edge" };

export default function handler(request: Request): Response {
  const method = request.method;
  if (method !== "GET" && method !== "HEAD") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { Allow: "GET, HEAD" },
    });
  }

  const result = resolveCoaScan(new URL(request.url).searchParams.get("code") ?? undefined);
  const event = result.found
    ? {
        event: "coa_qr_scan",
        anonymous: true,
        code: result.code,
        product: result.product,
        taskNumber: result.taskNumber,
        scope: "supplier_source_report",
      }
    : {
        event: "coa_qr_scan_unknown",
        anonymous: true,
        code: "unknown",
      };

  console.info(JSON.stringify(event));
  return new Response(null, {
    status: 307,
    headers: {
      Location: result.destination,
      "Cache-Control": "private, no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
}
