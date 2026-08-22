import { describe, expect, it } from "vitest";
import { emptyCheckoutForm } from "@/lib/startPayfastCheckout";
import { validateCheckout } from "@/lib/checkoutSchema";
import { getShippingCost } from "@/lib/shipping";

const base = {
  ...emptyCheckoutForm,
  firstName: "Lutho",
  lastName: "Tester",
  email: "ops@example.com",
  phone: "0821234567",
  city: "Cape Town",
  region: "Western Cape",
  postalCode: "8001",
};

describe("PostNet checkout readiness", () => {
  it("requires a street address for PostNet-to-Door", () => {
    const result = validateCheckout({ ...base, deliveryMethod: "postnet_to_door", address1: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.address1).toBe("err_address_short");
  });

  it("requires a branch but not a street address for PostNet-to-PostNet", () => {
    const valid = validateCheckout({
      ...base,
      deliveryMethod: "postnet_to_postnet",
      postnetBranch: "East London Vincent Park",
      address1: "",
    });
    expect(valid.ok).toBe(true);

    const invalid = validateCheckout({ ...base, deliveryMethod: "postnet_to_postnet", postnetBranch: "" });
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) expect(invalid.errors.postnetBranch).toBe("err_branch_short");
  });

  it("requires a South African mobile number", () => {
    const result = validateCheckout({ ...base, deliveryMethod: "postnet_to_door", address1: "1 Long Street", phone: "123" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.phone).toBe("err_phone_sa");
  });

  it("uses one R109 PostNet rate and keeps the R1,500 free-shipping threshold", () => {
    expect(getShippingCost(900, "South Africa", "postnet_to_door")).toBe(109);
    expect(getShippingCost(900, "South Africa", "postnet_to_postnet")).toBe(109);
    expect(getShippingCost(1500, "South Africa", "postnet_to_door")).toBe(0);
  });
});
