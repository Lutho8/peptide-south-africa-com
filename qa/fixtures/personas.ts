// Test personas with realistic South African data.
// NEVER use these to place real orders or create real leads on production.

export interface Persona {
  key: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string; // +27 format
  address: {
    street: string;
    suburb: string;
    city: string;
    province: string;
    postalCode: string;
  };
  notes?: string;
}

export const personas: Record<string, Persona> = {
  retail_customer: {
    key: 'retail_customer',
    firstName: 'Thandi',
    lastName: 'Nkosi',
    email: 'qa+retail@ridethetide.test',
    phone: '+27821234567',
    address: {
      street: '12 Kloof Street',
      suburb: 'Gardens',
      city: 'Cape Town',
      province: 'Western Cape',
      postalCode: '8001',
    },
  },
  subscriber: {
    key: 'subscriber',
    firstName: 'Pieter',
    lastName: 'van der Merwe',
    email: 'qa+subscriber@ridethetide.test',
    phone: '+27835550142',
    address: {
      street: '45 Oxford Road',
      suburb: 'Rosebank',
      city: 'Johannesburg',
      province: 'Gauteng',
      postalCode: '2196',
    },
  },
  b2b_buyer: {
    key: 'b2b_buyer',
    firstName: 'Naledi',
    lastName: 'Mokoena',
    email: 'qa+b2b@ridethetide.test',
    phone: '+27849823310',
    address: {
      street: '7 Fredman Drive',
      suburb: 'Sandton',
      city: 'Johannesburg',
      province: 'Gauteng',
      postalCode: '2196',
    },
    notes: 'Represents a wellness clinic; company: Mokoena Wellness (Pty) Ltd',
  },
  telehealth_patient: {
    key: 'telehealth_patient',
    firstName: 'Sipho',
    lastName: 'Dlamini',
    email: 'qa+patient@ridethetide.test',
    phone: '+27614098875',
    address: {
      street: '103 Florida Road',
      suburb: 'Windermere',
      city: 'Durban',
      province: 'KwaZulu-Natal',
      postalCode: '4001',
    },
  },
  mobile_shopper: {
    key: 'mobile_shopper',
    firstName: 'Ayesha',
    lastName: 'Pillay',
    email: 'qa+mobile@ridethetide.test',
    phone: '+27790664421',
    address: {
      street: '28 Beach Road',
      suburb: 'Sea Point',
      city: 'Cape Town',
      province: 'Western Cape',
      postalCode: '8005',
    },
  },
};

export const invalidInputs = {
  badEmail: 'not-an-email',
  badPhone: '123',
  emptyString: '',
};
