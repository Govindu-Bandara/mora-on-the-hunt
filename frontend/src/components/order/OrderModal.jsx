import { Modal } from '../ui/Modal';
import { useOrderFlow } from '../../hooks/useOrderFlow';
import { StepCustomerInfo } from './steps/StepCustomerInfo';
import { StepMerchSelection } from './steps/StepMerchSelection';
import { StepOrderSummary } from './steps/StepOrderSummary';
import { StepPaymentUpload } from './steps/StepPaymentUpload';
import { StepConfirmation } from './steps/StepConfirmation';

const STEP_LABELS = ['Merchandise', 'Your Info', 'Summary', 'Payment', 'Done'];

export function OrderModal() {
  const { state, dispatch } = useOrderFlow();

  function handleClose() {
    if (state.step === 5) {
      dispatch({ type: 'RESET' });
    } else {
      dispatch({ type: 'CLOSE_MODAL' });
    }
  }

  return (
    <Modal isOpen={state.isOpen} onClose={handleClose} className="max-w-2xl" labelledBy="order-modal-title">
      <div className="p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 id="order-modal-title" className="font-slogan text-lg text-mora-gold">
            #MORA on the Hunt
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="text-2xl leading-none text-mora-white/50 hover:text-mora-white"
          >
            &times;
          </button>
        </div>

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
    </Modal>
  );
}
