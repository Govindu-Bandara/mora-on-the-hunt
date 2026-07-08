import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../../ui/Button';
import { Spinner } from '../../ui/Spinner';
import { useOrderFlow } from '../../../hooks/useOrderFlow';
import { submitOrder } from '../../../api/ordersApi';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function StepPaymentUpload() {
  const { state, dispatch } = useOrderFlow();
  const [submitting, setSubmitting] = useState(false);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only JPG, PNG, or PDF files are allowed');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('File must be smaller than 5MB');
      e.target.value = '';
      return;
    }
    dispatch({ type: 'SET_PAYMENT_FILE', file });
  }

  async function handleSubmit() {
    if (!state.paymentReference.trim()) {
      toast.error('Please enter the payment reference number');
      return;
    }
    if (!state.paymentFile) {
      toast.error('Please upload your payment slip');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(state.customer).forEach(([key, value]) => formData.append(key, value));
      formData.append('paymentReference', state.paymentReference.trim());
      formData.append(
        'items',
        JSON.stringify(
          state.items.map((item) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
          }))
        )
      );
      formData.append('paymentSlip', state.paymentFile);

      const result = await submitOrder(formData);
      dispatch({ type: 'SET_LAST_ORDER', order: result });
      dispatch({ type: 'SET_STEP', step: 5 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-mora-white">Upload Payment Slip</h3>
      <p className="text-sm text-mora-white/60">
        Accepted formats: JPG, JPEG, PNG, PDF. Maximum size: 5MB.
      </p>

      <div>
        <label htmlFor="paymentReference" className="mb-1 block text-sm text-mora-white/70">
          Payment Reference Number
        </label>
        <input
          id="paymentReference"
          value={state.paymentReference}
          onChange={(e) => dispatch({ type: 'SET_PAYMENT_REFERENCE', value: e.target.value })}
          placeholder="e.g. the transaction/slip reference from your bank"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-mora-white placeholder-white/30 focus:border-mora-gold focus:outline-none"
        />
      </div>

      {state.paymentFile ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border-2 border-dashed border-white/20 p-8">
          <span className="text-sm text-mora-white">
            {state.paymentFile.name} ({(state.paymentFile.size / 1024 / 1024).toFixed(2)} MB)
          </span>
          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_PAYMENT_FILE', file: null })}
            className="shrink-0 text-sm font-semibold text-red-400 hover:text-red-300"
          >
            Remove
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/20 p-8 text-center hover:border-mora-gold transition-colors">
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <span className="text-sm text-mora-white/50">Click to select your payment slip</span>
        </label>
      )}

      <div className="flex gap-3">
        <Button
          variant="ghost"
          className="flex-1"
          disabled={submitting}
          onClick={() => dispatch({ type: 'SET_STEP', step: 3 })}
        >
          Back
        </Button>
        <Button className="flex-1" disabled={submitting} onClick={handleSubmit}>
          {submitting ? <Spinner className="h-5 w-5" /> : 'Place Order'}
        </Button>
      </div>
    </div>
  );
}
