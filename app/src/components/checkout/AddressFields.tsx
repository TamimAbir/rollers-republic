import type { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CheckoutForm } from '@/lib/checkoutSchema';

interface AddressFieldsProps {
  register: UseFormRegister<CheckoutForm>;
  errors: FieldErrors<CheckoutForm>;
  watch?: UseFormWatch<CheckoutForm>;
}

export function AddressFields({ register, errors, watch }: AddressFieldsProps) {
  const paymentMethod = watch?.('paymentMethod');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Shipping Address</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address">Full Address</Label>
          <Input
            id="address"
            {...register('address')}
            placeholder="House #, Road #, Area"
            className={errors.address ? 'border-red-500' : ''}
          />
          {errors.address && (
            <p className="text-red-500 text-sm">{errors.address.message as string}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              {...register('city')}
              placeholder="Dhaka"
              className={errors.city ? 'border-red-500' : ''}
            />
            {errors.city && (
              <p className="text-red-500 text-sm">{errors.city.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              {...register('postalCode')}
              placeholder="1200"
              className={errors.postalCode ? 'border-red-500' : ''}
            />
            {errors.postalCode && (
              <p className="text-red-500 text-sm">{errors.postalCode.message as string}</p>
            )}
          </div>
        </div>

        {paymentMethod === 'cod' && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <p className="text-sm text-emerald-400">
              Cash on Delivery available for orders under ৳10,000
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
