import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderProvider } from '../../context/OrderContext';
import { useOrderFlow } from '../../hooks/useOrderFlow';
import { StepMerchSelection } from '../../components/order/steps/StepMerchSelection';
import { StepCustomerInfo } from '../../components/order/steps/StepCustomerInfo';
import { StepOrderSummary } from '../../components/order/steps/StepOrderSummary';
import { StepPaymentUpload } from '../../components/order/steps/StepPaymentUpload';
import { StepConfirmation } from '../../components/order/steps/StepConfirmation';

const STEP_LABELS = ['Merchandise', 'Your Info', 'Summary', 'Payment', 'Done'];

function AdminOrderFlow() {
  const { state, dispatch } = useOrderFlow();
  const navigate = useNavigate();
  const openedRef = useRef(false);

  // Start the flow. The reused steps drive themselves off `isOpen`; their
  // "Close" buttons dispatch CLOSE_MODAL / RESET, which we use as the signal
  // to return to the orders list.
  useEffect(() => {
    dispatch({ type: 'OPEN_MODAL', step: 1 });
  }, [dispatch]);

  // Once the flow has actually opened, a later close returns to the list.
  useEffect(() => {
    if (state.isOpen) {
      openedRef.current = true;
    } else if (openedRef.current) {
      navigate('/admin/orders');
    }
  }, [state.isOpen, navigate]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-mora-white">Add Order</h1>

      {state.step < 5 && (
        <ol className="mb-8 flex items-center justify-between text-xs text-mora-white/40">
          {STEP_LABELS.slice(0, 4).map((label, i) => (
            <li
              key={label}
              className={`flex-1 border-b-2 pb-2 text-center ${
                state.step === i + 1 ? 'border-mora-gold text-mora-gold' : 'border-white/10'
              }`}
            >
              {label}
            </li>
          ))}
        </ol>
      )}

      {state.step === 1 && <StepMerchSelection />}
      {state.step === 2 && <StepCustomerInfo />}
      {state.step === 3 && <StepOrderSummary />}
      {state.step === 4 && <StepPaymentUpload />}
      {state.step === 5 && <StepConfirmation />}
    </div>
  );
}

export function AdminOrderCreatePage() {
  return (
    <OrderProvider>
      <AdminOrderFlow />
    </OrderProvider>
  );
}
