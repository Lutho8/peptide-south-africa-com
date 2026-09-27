import { describe, it, expect } from "vitest";
import { products, getProductBySlug, productInclusions } from "@/data/products";
import { LIVE_CATALOG, BAC_SLUG } from "../../supabase/functions/_shared/catalog-release";
const cases = [
  ["rt3-reta",1250,3188,5000,10], ["tz2-tirz",1250,3188,5000,10],
  ["tesamorelin",775,1976,3100,5], ["kpv",395,1007,1580,5],
  ["klow80",1550,3953,6200,80], ["mots-c",625,1594,2500,10],
  ["ss-31",1150,2933,4600,10], ["ghk-cu-50mg",700,1785,2800,50],
  ["bpc-tb500-blend",950,2423,3800,10],
] as const;
describe("approved strength-specific catalogue", () => {
  it("shows exactly the purchased nine peptide strengths plus separately priced BAC", () => {
    expect(products.map(p=>p.slug).sort()).toEqual(Object.keys(LIVE_CATALOG).sort());
    expect(products).toHaveLength(10);
  });
  it.each(cases)("%s has approved single/3-pack/5-pack totals and strength", (slug, single, three, five, mg) => {
    const p=getProductBySlug(slug)!;
    expect(p.price).toBe(single);
    expect(p.variants?.map(v=>[v.pack,v.price,v.mgPerVial])).toEqual([[3,three,mg],[5,five,mg],[1,single,mg]]);
    expect(p.name).toBe(LIVE_CATALOG[slug].name);
    expect(p.sku).toBe(LIVE_CATALOG[slug].sku);
    expect(productInclusions(p,3)[0]).toContain("3 sealed");
    expect(productInclusions(p,5)[0]).toContain("5 sealed");
    expect(productInclusions(p,1)[0]).toContain("1 sealed");
    expect(productInclusions(p,3)[0]).toContain(`${p.strength} in EACH vial`);
  });
  it.each(["glow70","thymosin-alpha-1","ara-290","pinealon","epitalon","selank","semax","tesamorelin-10mg","kpv-10mg"])("does not expose unstocked %s", slug => expect(getProductBySlug(slug)).toBeUndefined());
  it("BAC is 10ml at R210 with no pack variant", () => {
    const bac=getProductBySlug(BAC_SLUG)!;
    expect(bac.price).toBe(210); expect(bac.strength).toBe("10 ml"); expect(bac.variants).toBeUndefined();
  });
});
