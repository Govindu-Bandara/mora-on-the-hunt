import { motion } from 'framer-motion';
import { PRICES, NORMAL_PRICES } from '../../lib/pricingEngine';

const CARDS = [
  { label: 'T-Shirt', pre: PRICES.shirt, normal: NORMAL_PRICES.shirt },
  { label: 'Silicone Bangle', pre: PRICES.bangle, flatPrice: true },
  { label: 'Bundle', sub: '1 T-Shirt + 1 Bangle', pre: PRICES.bundle, normal: NORMAL_PRICES.bundle, highlight: true, bundle: true },
];

export function PricingSection() {
  return (
    <section id="pricing" className="bg-mora-black px-6 py-28 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-center"
        >
          <h2 className="text-4xl font-black uppercase tracking-tight text-mora-white sm:text-5xl">
            Pre-Order <span className="text-mora-gold">Pricing</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-mora-white/55">
            Pre-order now and save on every item. Prices go up once the campaign window closes.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {CARDS.map((card, i) => {
            const savings = card.flatPrice ? 0 : card.normal - card.pre;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className={`flex flex-col p-8 text-left shadow-2xl ${
                  card.highlight ? 'bg-mora-gold text-mora-black' : 'border border-white/10 bg-mora-navy text-mora-white'
                }`}
              >
                <h3 className="text-sm font-bold uppercase tracking-widest opacity-80">
                  {card.label}
                </h3>
                {card.sub && <p className="text-xs opacity-60">{card.sub}</p>}

                {card.bundle ? (
                  (() => {
                    // Anchor on the regular price of buying the two items separately
                    // and itemize how the total saving splits between the two offers.
                    const regularSeparate = NORMAL_PRICES.shirt + NORMAL_PRICES.bangle; // 2100
                    const preOrder = PRICES.bundle; // 1900
                    const totalSaving = regularSeparate - preOrder; // 200
                    const preorderTeeSaving = NORMAL_PRICES.shirt - PRICES.shirt; // 150
                    const bundleSaving = totalSaving - preorderTeeSaving; // 50
                    return (
                      <>
                        <div className="mt-5 flex items-baseline gap-3">
                          <span className="text-4xl font-black">Rs. {preOrder}</span>
                          <span className="text-lg font-bold text-mora-black/50 line-through">
                            Rs. {regularSeparate}
                          </span>
                        </div>
                        <div className="mt-5 space-y-1.5 text-sm text-mora-black/80">
                          <div className="flex justify-between gap-4">
                            <span>Pre-order T-shirt offer</span>
                            <span className="font-semibold">- Rs. {preorderTeeSaving}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span>Bundle offer</span>
                            <span className="font-semibold">- Rs. {bundleSaving}</span>
                          </div>
                        </div>
                        <p className="mt-4 border-t border-mora-black/20 pt-4 text-base font-black uppercase tracking-wide text-mora-black">
                          You save Rs. {totalSaving}
                        </p>
                      </>
                    );
                  })()
                ) : (
                  <>
                    <p className="mt-5 text-4xl font-black">Rs. {card.pre}</p>
                    {!card.flatPrice && (
                      <>
                        <p
                          className={`mt-1 text-sm line-through ${
                            card.highlight ? 'text-mora-black/50' : 'text-mora-white/40'
                          }`}
                        >
                          Rs. {card.normal}
                        </p>
                        <p
                          className={`mt-4 text-sm font-bold uppercase tracking-wide ${
                            card.highlight ? 'text-mora-black' : 'text-green-400'
                          }`}
                        >
                          Save Rs. {savings}
                        </p>
                      </>
                    )}
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
