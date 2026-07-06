import { useState } from 'react';

export function ProductDetailGallery({ images, alt }) {
  const [active, setActive] = useState(0);

  if (!images || images.length === 0) {
    return <div className="aspect-square w-full bg-white/5" />;
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
      <div className="aspect-square flex-1 overflow-hidden bg-mora-navy">
        <img
          src={images[active]}
          alt={alt}
          className="h-full w-full object-cover"
          key={images[active]}
        />
      </div>
    </div>
  );
}
