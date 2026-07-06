import { Button } from '../../ui/Button';
import { useOrderFlow } from '../../../hooks/useOrderFlow';

export function StepOrderSummary() {
  const {
    state: { customer, items },
    totals,
    dispatch,
  } = useOrderFlow();

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-mora-white">Order Summary</h3>

      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-mora-white/60">
          Customer Information
        </h4>
        <dl className="grid grid-cols-2 gap-2 text-sm text-mora-white/80">
          <div>
            <dt className="text-mora-white/50">Full Name</dt>
            <dd>{customer.fullName}</dd>
          </div>
          <div>
            <dt className="text-mora-white/50">Index/NIC</dt>
            <dd>{customer.indexOrNic}</dd>
          </div>
          <div>
            <dt className="text-mora-white/50">Telephone</dt>
            <dd>{customer.telephone}</dd>
          </div>
          <div>
            <dt className="text-mora-white/50">Batch</dt>
            <dd>{customer.batch}</dd>
          </div>
          <div>
            <dt className="text-mora-white/50">Faculty</dt>
            <dd>{customer.faculty}</dd>
          </div>
          <div>
            <dt className="text-mora-white/50">Department</dt>
            <dd>{customer.department}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-mora-white/60">
          Ordered Items
        </h4>
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.key} className="flex justify-between text-mora-white/80">
              <span>
                {item.name}
                {item.size ? ` (${item.size})` : ''} &times; {item.quantity}
              </span>
              <span>Rs. {item.unitPrice * item.quantity}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-mora-gold/40 bg-mora-gold/10 p-4 text-sm">
        <div className="flex justify-between text-mora-white/70">
          <span>Subtotal</span>
          <span>Rs. {totals.subtotal + totals.bundleSavings}</span>
        </div>
        <div className="flex justify-between text-green-400">
          <span>Bundle Savings ({totals.bundleCount} bundle{totals.bundleCount === 1 ? '' : 's'})</span>
          <span>- Rs. {totals.bundleSavings}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-lg font-bold text-mora-gold">
          <span>Final Total</span>
          <span>Rs. {totals.finalTotal}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" className="flex-1" onClick={() => dispatch({ type: 'SET_STEP', step: 2 })}>
          Back
        </Button>
        <Button className="flex-1" onClick={() => dispatch({ type: 'SET_STEP', step: 4 })}>
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}
