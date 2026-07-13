import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const AUTO_ADVANCE_MS = 3000;

export function ProductDetailGallery({ images, alt }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return undefined;

    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % images.length);
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(timer);
  }, [images]);

  if (!images || images.length === 0) {
    return <div className="aspect-[2/3] w-full bg-white/5" />;
  }

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto sm:flex-col sm:overflow-visible">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={`h-16 w-16 shrink-0 overflow-hidden border-2 transition-colors sm:h-20 sm:w-20 ${
                active === i ? 'border-mora-gold' : 'border-white/10 hover:border-white/30'
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="relative aspect-[2/3] flex-1 overflow-hidden bg-mora-navy">
        <AnimatePresence mode="wait">
          <motion.img
            key={images[active]}
            src={images[active]}
            alt={alt}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
