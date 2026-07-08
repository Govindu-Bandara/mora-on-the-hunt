import { createContext, useMemo, useReducer } from 'react';
import { calculateTotal } from '../lib/pricingEngine';

export const OrderContext = createContext(null);

const initialState = {
  isOpen: false,
  step: 1,
  customer: {
    fullName: '',
    indexOrNic: '',
    telephone: '',
    batch: '',
    faculty: '',
    department: '',
  },
  items: [],
  paymentFile: null,
  paymentReference: '',
  lastOrder: null,
};

function itemKey(productId, size) {
  return `${productId}::${size || 'none'}`;
}

function reducer(state, action) {
  switch (action.type) {
    case 'OPEN_MODAL':
      return { ...state, isOpen: true, step: action.step || 1 };
    case 'CLOSE_MODAL':
      return { ...state, isOpen: false };
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'SET_CUSTOMER_INFO':
      return { ...state, customer: { ...state.customer, ...action.payload } };
    case 'ADD_ITEM': {
      const { product, size, quantity = 1 } = action.payload;
      const key = itemKey(product._id, size);
      const existing = state.items.find((i) => i.key === key);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.key === key ? { ...i, quantity: i.quantity + quantity } : i
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            key,
            productId: product._id,
            name: product.name,
            category: product.category,
            color: product.color,
            size: size || null,
            quantity,
            unitPrice: product.currentPrice,
          },
        ],
      };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.key !== action.key) };
    case 'SET_PAYMENT_FILE':
      return { ...state, paymentFile: action.file };
    case 'SET_PAYMENT_REFERENCE':
      return { ...state, paymentReference: action.value };
    case 'SET_LAST_ORDER':
      return { ...state, lastOrder: action.order };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

export function OrderProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const totals = useMemo(() => {
    const shirtCount = state.items
      .filter((i) => i.category === 'tshirt')
      .reduce((sum, i) => sum + i.quantity, 0);
    const bangleCount = state.items
      .filter((i) => i.category === 'bangle')
      .reduce((sum, i) => sum + i.quantity, 0);
    return { shirtCount, bangleCount, ...calculateTotal(shirtCount, bangleCount) };
  }, [state.items]);

  const value = useMemo(() => ({ state, dispatch, totals }), [state, totals]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}
