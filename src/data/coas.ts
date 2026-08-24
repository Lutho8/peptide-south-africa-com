import { COA_SCAN_DESTINATIONS } from "@/data/coaScanDestinations";

export interface CoaRecord {
  id: string;
  shortCode: string;
  productSlug: string;
  productName: string;
  productSku: string;
  strength: string;
  labName: string;
  taskNumber: string;
  sampleReference: string;
  reportDate: string;
  verificationUrl: string;
  reportImageUrl: string;
  results: Array<{ label: string; value: string }>;
  sourceNote: string;
}

/**
 * Source-controlled COAs are the guaranteed public baseline. New operational
 * batches added through /admin/batches are merged into the public archive at
 * runtime, so the page remains useful even when Supabase is unavailable.
 */
export const staticCoas: CoaRecord[] = [
  {
    id: "mots-c-83567",
    shortCode: "m01",
    productSlug: "mots-c",
    productName: "MOTS-C",
    productSku: "RTT-MTC-10",
    strength: "10 mg",
    labName: "Janoshik Analytical",
    taskNumber: "83567",
    sampleReference: "MOTS-C 10mg",
    reportDate: "2025-10-21",
    verificationUrl: COA_SCAN_DESTINATIONS.m01.url,
    reportImageUrl: "/coa/mots-c-janoshik-83567.svg",
    results: [
      { label: "Reported content", value: "11.42 mg" },
      { label: "Reported purity", value: "99.098%" },
    ],
    sourceNote:
      "This report identifies the submitted sample as MOTS-C 10mg and names Zztai Peptide Ltd. as the client. Its batch is reported as Unknown, so it verifies the published lab report—not a unique PSA vial or lot.",
  },
  {
    id: "retatrutide-61141",
    shortCode: "r01",
    productSlug: "rt3-reta",
    productName: "Retatrutide",
    productSku: "RTT-RT3-10",
    strength: "10 mg",
    labName: "Janoshik Analytical",
    taskNumber: "61141",
    sampleReference: "Retatrutide 10mg",
    reportDate: "2025-04-01",
    verificationUrl: COA_SCAN_DESTINATIONS.r01.url,
    reportImageUrl: "/coa/retatrutide-janoshik-61141.svg",
    results: [
      { label: "Reported content", value: "10.80 mg" },
      { label: "Reported purity", value: "99.060%" },
    ],
    sourceNote:
      "This report identifies the submitted sample as Retatrutide 10mg and names Zztai Peptide Ltd. as the client. Its batch is reported as Unknown, so it verifies the published lab report—not a unique PSA vial or lot.",
  },
  {
    id: "tirzepatide-164662",
    shortCode: "z01",
    productSlug: "tz2-tirz",
    productName: "Tirzepatide",
    productSku: "RTT-TZ2-20",
    strength: "20 mg",
    labName: "Janoshik Analytical",
    taskNumber: "164662",
    sampleReference: "T120",
    reportDate: "2026-05-27",
    verificationUrl: COA_SCAN_DESTINATIONS.z01.url,
    reportImageUrl: "/coa/tirzepatide-janoshik-164662.svg",
    results: [
      { label: "Reported content", value: "134.42 mg; 132.84 mg" },
      { label: "Reported purity", value: "99.867%; 99.899%" },
    ],
    sourceNote:
      "This report identifies the submitted sample as T120, names Zztai Peptide Ltd. as the client, and reports 134.42 mg and 132.84 mg. Its batch is reported as Unknown and it does not identify a 20 mg PSA lot, so it verifies the published source report—not a unique PSA vial or lot.",
  },
  {
    id: "tesamorelin-164644",
    shortCode: "t01",
    productSlug: "tesamorelin",
    productName: "Tesamorelin",
    productSku: "RTT-TES-10",
    strength: "10 mg",
    labName: "Janoshik Analytical",
    taskNumber: "164644",
    sampleReference: "TSM10",
    reportDate: "2026-05-27",
    verificationUrl: COA_SCAN_DESTINATIONS.t01.url,
    reportImageUrl: "/coa/tesamorelin-janoshik-164644.jpg",
    results: [
      { label: "Reported content", value: "12.95 mg; 12.27 mg" },
      { label: "Reported purity", value: "98.589%; 98.425%" },
    ],
    sourceNote:
      "This report identifies the submitted sample as TSM10 and names Zztai Peptide Ltd. as the client. Its batch field is blank, so it verifies the published lab report—not a unique PSA vial or lot.",
  },
];

export function getCoasForProduct(productSlug: string): CoaRecord[] {
  return staticCoas.filter((record) => record.productSlug === productSlug);
}
