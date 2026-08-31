export const COA_SCAN_DESTINATIONS = {
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

export type CoaScanCode = keyof typeof COA_SCAN_DESTINATIONS;

export function isCoaScanCode(value: string): value is CoaScanCode {
  return Object.prototype.hasOwnProperty.call(COA_SCAN_DESTINATIONS, value);
}
