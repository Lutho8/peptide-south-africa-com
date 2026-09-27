import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({user: null}) }));
import { CartProvider, useCart, restoreCartItems, type CartItem } from "@/context/CartContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { getProductBySlug } from "@/data/products";
import PackSuppliesRail from "@/components/PackSuppliesRail";
import FreeShippingBar from "@/components/FreeShippingBar";
import { quoteCheckout, quoteMixSlugs, shippingForSubtotal, variantPrice } from "../../supabase/functions/_shared/pricing";
import { CATALOG_VERSION, validateStorefrontRequest, BAC_SLUG } from "../../supabase/functions/_shared/catalog-release";
import { toCheckoutSelections } from "@/lib/eftCheckout";
import { readFileSync } from "node:fs";

const makeLine = (slug="kpv", variantLabel="3-Pack"): CartItem => ({product:getProductBySlug(slug)!,variantLabel,unitPrice:1,quantity:1,lineId:`${slug}-line`});
function Probe() {
  const {items, addToCart, subtotal}=useCart();
  return <><button onClick={()=>addToCart(getProductBySlug("kpv")!,{variantLabel:"3-Pack",silent:true})}>Add KPV pack</button>
  <PackSuppliesRail/><FreeShippingBar subtotalZar={subtotal}/><span data-testid="subtotal">{subtotal}</span><span data-testid="line-count">{items.length}</span></>;
}
describe("catalogue release regressions",()=>{
  it.each([[1499.99,89],[1500,0],[1280+210,89],[1280+420,0],[0,89]])("delivery on final merchandise %d is %d",(subtotal,shipping)=>expect(shippingForSubtotal(subtotal)).toBe(shipping));
  it.each([NaN,Infinity,-1])("rejects invalid shipping basis %s", value=>expect(()=>shippingForSubtotal(value)).toThrow());
  it("pack discounts can remove delivery qualification; paid BAC can restore it",()=>{
    const singles=quoteCheckout([{kind:"item",slug:"mots-c",quantity:1},{kind:"item",slug:"ghk-cu-50mg",quantity:1},{kind:"item",slug:BAC_SLUG,quantity:1}]);
    expect(singles.subtotal).toBe(1535); expect(singles.shipping).toBe(0);
    const discounted=quoteCheckout([{kind:"item",slug:"kpv",variantLabel:"3-Pack",quantity:1}]);
    expect(discounted.subtotal).toBe(1007); expect(discounted.shipping).toBe(89);
    expect(quoteCheckout([{kind:"item",slug:"kpv",variantLabel:"3-Pack",quantity:1},{kind:"item",slug:BAC_SLUG,quantity:3}]).shipping).toBe(0);
  });
  it("the approved mixed five plus paid BAC is R4270, not discounted again",()=>{
    const slugs=["rt3-reta","klow80","mots-c","ghk-cu-50mg","bpc-tb500-blend"];
    expect(quoteMixSlugs(slugs,5).total).toBe(4060);
    const q=quoteCheckout([{kind:"mix_bundle",size:5,slugs},{kind:"item",slug:BAC_SLUG,quantity:1}]);
    expect(q.total).toBe(4270);expect(q.savings).toBe(1015);
  });
  it.each(["discountCode","coupon","promoCode","subscriptionDiscount","discountPct","discountAmount","discounts"])("blocks caller-supplied %s stacking",key=>{
    expect(()=>validateStorefrontRequest({catalogVersion:CATALOG_VERSION,[key]:"EXTRA"})).toThrow(/One applicable discount/);
  });
  it("requires the current catalogue version before a new order",()=>{
    expect(()=>validateStorefrontRequest({})).toThrow(/catalogue changed/);
    expect(()=>validateStorefrontRequest({catalogVersion:CATALOG_VERSION})).not.toThrow();
    for(const path of ["api/eft-create-order.ts","supabase/functions/eft-create-order/index.ts"])
      expect(readFileSync(path,"utf8")).toContain("validateStorefrontRequest(");
  });
  it.each([0,-1,1.5,100,NaN])("rejects invalid requested quantities %s",quantity=>{
    expect(()=>quoteCheckout([{kind:"item",slug:"kpv",quantity}])).toThrow(/quantity/);
  });
  it("does not convert a previous KPV10 or Tirzepatide5 cart into another strength",()=>{
    const kpv=makeLine();kpv.product={...kpv.product,sku:"PSA-KPV-10"};
    const tz=makeLine("tz2-tirz");tz.product={...tz.product,sku:"RTT-TZ2-5"};
    const good=makeLine("ghk-cu-50mg");
    expect(restoreCartItems([kpv,tz,good]).map(i=>i.product.slug)).toEqual(["ghk-cu-50mg"]);
    expect(()=>quoteCheckout([{kind:"item",slug:"kpv",sku:"PSA-KPV-10",quantity:1}])).toThrow(/strength/);
  });
  it("rejects a stale 10-pack group without dropping a valid separate item",()=>{
    const bad=Array.from({length:10},(_,i)=>({...makeLine("ghk-cu-50mg"),bundleId:"old10",lineId:`old10-${i}`}));
    expect(restoreCartItems([...bad,makeLine()])).toHaveLength(1);
    expect(()=>variantPrice("kpv","10-Pack")).toThrow();
  });
  it("restores a valid pack at the canonical price instead of trusting a browser amount",()=>{
    const result=restoreCartItems([makeLine()]);expect(result[0].unitPrice).toBe(1007);
    expect(quoteCheckout(toCheckoutSelections(result)).subtotal).toBe(1007);
  });
  it("BAC starts unselected, is one canonical line, and removing it recalculates delivery",()=>{
    render(<MemoryRouter><CurrencyProvider><CartProvider><Probe/></CartProvider></CurrencyProvider></MemoryRouter>);
    fireEvent.click(screen.getByText("Add KPV pack"));
    expect(screen.getByTestId("subtotal")).toHaveTextContent("1007");
    expect(screen.getByTestId("line-count")).toHaveTextContent("1");
    fireEvent.click(screen.getByRole("button",{name:"Add BAC water 10 ml"}));
    expect(screen.getByTestId("subtotal")).toHaveTextContent("1217");
    fireEvent.click(screen.getByRole("button",{name:"Increase BAC water quantity"}));
    expect(screen.getByTestId("subtotal")).toHaveTextContent("1427");
    expect(screen.getByTestId("free-shipping-bar")).toHaveTextContent("away from free shipping");
    fireEvent.click(screen.getByRole("button",{name:"Increase BAC water quantity"}));
    expect(screen.getByTestId("subtotal")).toHaveTextContent("1637");
    expect(screen.getByTestId("line-count")).toHaveTextContent("2");
    expect(screen.getByTestId("free-shipping-bar")).toHaveTextContent("unlocked free shipping");
    fireEvent.click(screen.getByRole("button",{name:"Remove BAC water"}));
    expect(screen.getByTestId("subtotal")).toHaveTextContent("1007");
    expect(screen.getByTestId("free-shipping-bar")).toHaveTextContent("away from free shipping");
  });
});
