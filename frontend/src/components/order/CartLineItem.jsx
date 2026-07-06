import { useOrderFlow } from '../../hooks/useOrderFlow';

export function CartLineItem({ item }) {
  const { dispatch } = useOrderFlow();

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-mora-white">{item.name}</p>
        <p className="text-xs text-mora-white/50">
          {item.color}
          {item.size ? ` · Size ${item.size}` : ''} · Qty {item.quantity}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-sm font-semibold text-mora-gold">
          Rs. {item.unitPrice * item.quantity}
        </span>
        <button
          type="button"
          onClick={() => dispatch({ type: 'REMOVE_ITEM', key: item.key })}
          aria-label={`Remove ${item.name}`}
          className="text-mora-white/40 hover:text-red-400 transition-colors"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
