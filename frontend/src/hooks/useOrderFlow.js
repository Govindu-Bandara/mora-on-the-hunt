import { useContext } from 'react';
import { OrderContext } from '../context/OrderContext';

export function useOrderFlow() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrderFlow must be used within an OrderProvider');
  return ctx;
}
