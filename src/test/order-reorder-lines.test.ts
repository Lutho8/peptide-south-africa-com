import { describe, expect, it } from "vitest";
import { getReorderLines } from "@/lib/orderReorder";

describe("dashboard reorder data", () => {
  it("uses structured Supabase order items when available", () => {
    expect(getReorderLines({
      order_items: [{ product_slug: "ss-31", variant_label: "Single Vial", quantity: 2 }],
      order_description: "Legacy text should not win",
    })).toEqual([{ slug: "ss-31", variantLabel: "Single Vial", qty: 2 }]);
  });

  it("falls back to legacy descriptions for older orders", () => {
    expect(getReorderLines({
      order_items: [],
      order_description: "MOTS-C (Single Vial) x1",
    })).toEqual([{ slug: "mots-c", variantLabel: "Single Vial", qty: 1 }]);
  });
});
