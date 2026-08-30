import { describe, expect, it } from "vitest";
import { validatePetsFulfilment } from "../../supabase/functions/_shared/pets-fulfilment";

const valid = {
  first_name: "Test",
  last_name: "Owner",
  email: "test.owner@example.com",
  phone: "+27820000000",
  address_line_1: "10 Test Street",
  city: "Cape Town",
  province: "Western Cape",
  postal_code: "8001",
  pet_name: "Pixel",
  pet_species: "dog",
};

describe("private Pets fulfilment contract", () => {
  it("normalizes a complete synthetic South African delivery record", () => {
    expect(validatePetsFulfilment(valid, "user-1", valid.email)).toMatchObject({
      user_id: "user-1",
      storefront: "pets",
      phone: "+27820000000",
      pet_species: "dog",
    });
  });

  it("rejects a mismatched checkout identity", () => {
    expect(() => validatePetsFulfilment(valid, "user-1", "other@example.com")).toThrow(/matching email/);
  });

  it("rejects malformed delivery and pet fields", () => {
    expect(() => validatePetsFulfilment({ ...valid, postal_code: "8" }, "user-1", valid.email)).toThrow(/postal code/);
    expect(() => validatePetsFulfilment({ ...valid, pet_species: "rabbit" }, "user-1", valid.email)).toThrow(/pet species/);
  });
});
