import { COA_SCAN_DESTINATIONS, isCoaScanCode } from "../src/data/coaScanDestinations";

interface RequestLike {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
}

interface ResponseLike {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(body?: string): void;
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
export default function handler(request: RequestLike, response: ResponseLike) {
  const method = request.method ?? "GET";
  if (method !== "GET" && method !== "HEAD") {
    response.statusCode = 405;
    response.setHeader("Allow", "GET, HEAD");
    response.end("Method not allowed");
    return;
  }

  const result = resolveCoaScan(request.query?.code);
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
  response.statusCode = 307;
  response.setHeader("Location", result.destination);
  response.setHeader("Cache-Control", "private, no-store");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.end();
}
