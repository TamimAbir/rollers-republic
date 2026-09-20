import { describe, it, expect } from 'vitest';
import { checkoutSchema } from '../checkoutSchema';

const validOrder = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+8801712345678',
  address: 'House 12, Road 5, Gulshan',
  city: 'Dhaka',
  postalCode: '1212',
  paymentMethod: 'cod' as const,
};

describe('checkoutSchema', () => {
  it('accepts a valid order', () => {
    const result = checkoutSchema.safeParse(validOrder);
    expect(result.success).toBe(true);
  });

  it('rejects short first name', () => {
    const result = checkoutSchema.safeParse({ ...validOrder, firstName: 'J' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('firstName');
    }
  });

  it('rejects short last name', () => {
    const result = checkoutSchema.safeParse({ ...validOrder, lastName: 'D' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = checkoutSchema.safeParse({ ...validOrder, email: 'not-an-email' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email');
    }
  });

  it('rejects short phone number', () => {
    const result = checkoutSchema.safeParse({ ...validOrder, phone: '123' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('phone');
    }
  });

  it('rejects short address', () => {
    const result = checkoutSchema.safeParse({ ...validOrder, address: 'Home' });
    expect(result.success).toBe(false);
  });

  it('rejects short postal code', () => {
    const result = checkoutSchema.safeParse({ ...validOrder, postalCode: '12' });
    expect(result.success).toBe(false);
  });

  it('rejects unknown payment method', () => {
    const result = checkoutSchema.safeParse({ ...validOrder, paymentMethod: 'bitcoin' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('paymentMethod');
    }
  });

  it('accepts all supported payment methods', () => {
    for (const method of ['cod', 'bkash', 'nagad'] as const) {
      const result = checkoutSchema.safeParse({ ...validOrder, paymentMethod: method });
      expect(result.success).toBe(true);
    }
  });

  it('rejects missing required fields', () => {
    const { firstName: _omitted, ...withoutFirstName } = validOrder;
    void _omitted;
    const result = checkoutSchema.safeParse(withoutFirstName);
    expect(result.success).toBe(false);
  });
});
