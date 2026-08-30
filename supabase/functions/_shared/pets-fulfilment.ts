export interface PetsFulfilmentRow {
  user_id: string;
  storefront: "pets";
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_line_1: string;
  city: string;
  province: string;
  postal_code: string;
  pet_name: string;
  pet_species: "dog" | "cat" | "horse";
}

export function validatePetsFulfilment(
  value: unknown,
  userId: string,
  checkoutEmail: string,
): PetsFulfilmentRow {
  if (!value || typeof value !== "object") throw new Error("Delivery details are required");
  const input = value as Record<string, unknown>;
  const text = (key: string, max = 160) => {
    const raw = input[key];
    if (typeof raw !== "string" || !raw.trim()) {
      throw new Error(`${key.replaceAll("_", " ")} is required`);
    }
    return raw.trim().slice(0, max);
  };
  const email = text("email", 200).toLowerCase();
  if (email !== checkoutEmail.trim().toLowerCase() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("A valid matching email is required");
  }
  const phone = text("phone", 24).replace(/[\s()-]/g, "");
  if (!/^\+?\d{10,15}$/.test(phone)) throw new Error("A valid phone number is required");
  const postalCode = text("postal_code", 10);
  if (!/^\d{4}$/.test(postalCode)) throw new Error("A valid South African postal code is required");
  const petSpecies = text("pet_species", 12).toLowerCase();
  if (petSpecies !== "dog" && petSpecies !== "cat" && petSpecies !== "horse") {
    throw new Error("A valid pet species is required");
  }
  return {
    user_id: userId,
    storefront: "pets",
    first_name: text("first_name", 80),
    last_name: text("last_name", 80),
    email,
    phone,
    address_line_1: text("address_line_1", 200),
    city: text("city", 100),
    province: text("province", 100),
    postal_code: postalCode,
    pet_name: text("pet_name", 80),
    pet_species: petSpecies,
  };
}
