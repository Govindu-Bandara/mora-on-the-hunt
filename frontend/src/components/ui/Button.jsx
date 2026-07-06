import { motion } from 'framer-motion';

const VARIANTS = {
  primary: 'bg-mora-gold text-mora-black hover:bg-yellow-400',
  outline: 'border-2 border-mora-white text-mora-white hover:bg-mora-white hover:text-mora-black',
  ghost: 'text-mora-white hover:bg-white/10',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const SHAPES = {
  pill: 'rounded-full',
  sharp: 'rounded-none',
};

export function Button({
  children,
  variant = 'primary',
  shape = 'pill',
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <motion.button
      type="button"
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 ${SHAPES[shape]} px-6 py-3 font-semibold tracking-wide transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
