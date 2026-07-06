import { motion } from 'framer-motion';
import { Button } from '../../ui/Button';
import { useOrderFlow } from '../../../hooks/useOrderFlow';

export function StepConfirmation() {
  const {
    state: { lastOrder },
    dispatch,
  } = useOrderFlow();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4 py-6 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-3xl text-green-400">
        &#10003;
      </div>
      <h3 className="text-2xl font-bold text-mora-white">Order Confirmed!</h3>
      <p className="rounded-full bg-mora-gold/10 px-4 py-1.5 text-sm font-semibold text-mora-gold">
        Order ID: {lastOrder?.orderId}
      </p>
      <p className="max-w-md text-sm leading-relaxed text-mora-white/70">
        Thank you for your order! Every purchase helps the MORA Baseball campaign and lets you
        represent MORA during the Inter University Games.
        <br />
        <span className="font-slogan text-mora-gold">#MORA on the Hunt 🦈</span>
      </p>
      <Button
        className="mt-2"
        onClick={() => dispatch({ type: 'RESET' })}
      >
        Close
      </Button>
    </motion.div>
  );
}
