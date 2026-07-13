import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { useOrderFlow } from '../../hooks/useOrderFlow';

export function Hero() {
  const { dispatch } = useOrderFlow();

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-mora-black">
      {/* Cover background image */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/Website%20Cover%20Image.png')" }}
      />
      {/* Dark overlay for text legibility */}
      <div aria-hidden className="absolute inset-0 bg-mora-black/60" />
      {/* Texture + vignette */}
      <div className="mora-grain absolute inset-0" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 25%, rgba(224,185,60,0.18), transparent 42%), radial-gradient(circle at 85% 85%, rgba(0,0,0,0.7), transparent 55%)',
        }}
      />
      {/* Bold diagonal gold rule */}
      <div className="absolute -left-10 top-0 h-full w-24 rotate-6 bg-mora-gold/10 blur-2xl" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-6 py-32 sm:px-10">
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.4em] text-mora-gold"
        >
          <span className="h-px w-10 bg-mora-gold" />
          MORA Baseball Presents
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-slogan text-[15vw] leading-[0.92] text-mora-white drop-shadow-2xl sm:text-8xl md:text-9xl"
        >
          #MORA
          <br />
          <span className="text-mora-gold">on the Hunt</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="text-2xl font-extrabold uppercase tracking-wide text-mora-white/90 sm:text-3xl"
        >
          Gear Up for the Inter Uni
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-4"
        >
          <Button
            shape="sharp"
            className="border-2 border-mora-gold px-12 py-5 text-lg uppercase tracking-widest shadow-[0_0_40px_rgba(224,185,60,0.35)]"
            onClick={() => dispatch({ type: 'OPEN_MODAL', step: 1 })}
          >
            Pre-Order Now &rarr;
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-mora-white/40"
      >
        Scroll
      </motion.div>
    </section>
  );
}
