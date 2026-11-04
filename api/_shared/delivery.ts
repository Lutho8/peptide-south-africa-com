const provinces = ['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','Northern Cape','North West','Western Cape'];
export function validateDelivery(value: unknown) {
  if (!value || typeof value !== 'object') throw new Error('Please enter your delivery address.');
  const input = value as Record<string, unknown>;
  const text = (key: string, min: number, max: number) => {
    const v = input[key];
    if (typeof v !== 'string' || v.trim().length < min || v.trim().length > max) throw new Error('Please check your delivery details.');
    return v.trim();
  };
  const address_line_1 = text('address_line_1',3,120), city = text('city',2,80);
  const province = provinces.find(p=>p.toLowerCase() === text('province',2,80).toLowerCase());
  const postal_code = text('postal_code',4,4);
  if (!province || !/^\d{4}$/.test(postal_code)) throw new Error('Please select a South African province and a four-digit postal code.');
  return { address_line_1, city, province, postal_code, country: 'ZA' };
}
