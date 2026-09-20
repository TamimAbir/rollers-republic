import * as z from 'zod';

export const checkoutSchema = z.object({
  firstName: z.string().min(2, 'First name is too short'),
  lastName: z.string().min(2, 'Last name is too short'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is invalid'),
  address: z.string().min(5, 'Address must be fully specified'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
  paymentMethod: z.enum(['cod', 'bkash', 'nagad'])
});

export type CheckoutForm = z.infer<typeof checkoutSchema>;
