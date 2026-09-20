import type { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Wallet, Smartphone } from 'lucide-react';
import type { CheckoutForm } from '@/lib/checkoutSchema';

interface PaymentMethodSelectorProps {
  register: UseFormRegister<CheckoutForm>;
  errors: FieldErrors<CheckoutForm>;
  watch?: UseFormWatch<CheckoutForm>;
}

const paymentMethods = [
  { 
    id: 'cod', 
    label: 'Cash on Delivery', 
    icon: Wallet,
    description: 'Pay when you receive'
  },
  { 
    id: 'bkash', 
    label: 'bKash', 
    icon: Smartphone,
    description: 'Pay via bKash'
  },
  { 
    id: 'nagad', 
    label: 'Nagad', 
    icon: Smartphone,
    description: 'Pay via Nagad'
  },
];

export function PaymentMethodSelector({ register, errors, watch }: PaymentMethodSelectorProps) {
  const selectedMethod = watch?.('paymentMethod');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Payment Method</h3>
      
      <RadioGroup
        defaultValue="cod"
        className="space-y-3"
        onValueChange={(value) => {
          register('paymentMethod').onChange({
            target: { name: 'paymentMethod', value },
            type: 'change',
          });
        }}
      >
        {paymentMethods.map((method) => (
          // eslint-disable-next-line jsx-a11y/label-has-associated-control
          <label
            key={method.id}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedMethod === method.id
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              selectedMethod === method.id ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/60'
            }`}>
              <method.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="font-medium text-white cursor-pointer">
                {method.label}
              </span>
              <p className="text-sm text-white/50">{method.description}</p>
            </div>
          </label>
        ))}
      </RadioGroup>
      
      {errors.paymentMethod && (
        <p className="text-red-500 text-sm">{errors.paymentMethod.message as string}</p>
      )}
    </div>
  );
}
