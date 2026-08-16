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
    verificationUrl: "https://verify.janoshik.com/tests/164644_ILEI5C8YKHME",
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

