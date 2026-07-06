import { useOrderFlow } from '../../hooks/useOrderFlow';
import { CartLineItem } from './CartLineItem';

export function CartSidebar() {
  const {
    state: { items },
    totals,
  } = useOrderFlow();

  return (
    <div className="flex h-full flex-col rounded-xl border border-white/10 bg-black/20 p-4">
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-mora-white/70">
        Your Cart
      </h4>

      {items.length === 0 ? (
        <p className="text-sm text-mora-white/50">No items added yet.</p>
      ) : (
        <div className="flex-1 space-y-2 overflow-y-auto">
          {items.map((item) => (
            <CartLineItem key={item.key} item={item} />
          ))}
        </div>
      )}

      <div className="mt-4 space-y-1 border-t border-white/10 pt-4 text-sm">
        <div className="flex justify-between text-mora-white/60">
          <span>Total T-Shirts</span>
          <span>{totals.shirtCount}</span>
        </div>
        <div className="flex justify-between text-mora-white/60">
          <span>Total Bangles</span>
          <span>{totals.bangleCount}</span>
        </div>
        {totals.bundleSavings > 0 && (
          <div className="flex justify-between text-green-400">
            <span>Bundle Savings</span>
            <span>- Rs. {totals.bundleSavings}</span>
          </div>
        )}
        <div className="flex justify-between pt-2 text-base font-bold text-mora-gold">
          <span>Running Total</span>
          <span>Rs. {totals.finalTotal}</span>
        </div>
      </div>
    </div>
  );
}
