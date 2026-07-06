import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { useFetch } from '../../hooks/useFetch';
import { fetchProducts } from '../../api/productsApi';

function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden border border-white/10 bg-mora-navy">
      <div className="aspect-[4/5] w-full bg-white/5" />
      <div className="space-y-3 border-t-4 border-mora-gold/30 p-5">
        <div className="h-4 w-3/4 rounded bg-white/10" />
        <div className="h-3 w-full rounded bg-white/10" />
        <div className="h-6 w-1/3 rounded bg-white/10" />
        <div className="h-10 w-full bg-white/10" />
      </div>
    </div>
  );
}

function ProductGroup({ title, products, columns }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="mb-16 last:mb-0">
      <h3 className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-mora-white/50">
        {title}
      </h3>
      <div className={`grid gap-8 ${columns}`}>
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}

export function MerchandiseShowcase() {
  const { data: products, loading, error } = useFetch(() => fetchProducts(), []);

  const shirts = products?.filter((p) => p.category === 'tshirt') || [];
  const bangles = products?.filter((p) => p.category === 'bangle') || [];

  return (
    <section id="merchandise" className="bg-mora-black-soft px-6 py-28 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="mb-16 border-b border-white/10 pb-6 text-center"
        >
          <h2 className="text-4xl font-black uppercase tracking-tight text-mora-white sm:text-5xl">
            The <span className="text-mora-gold">Merchandise</span>
          </h2>
        </motion.div>

        {error && (
          <p className="text-center text-mora-white/60">
            Couldn&apos;t load merchandise right now. Please refresh the page.
          </p>
        )}

        {loading && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && (
          <>
            <ProductGroup title="T-Shirts" products={shirts} columns="sm:grid-cols-2 lg:grid-cols-3" />
            <ProductGroup title="Silicone Bangles" products={bangles} columns="sm:grid-cols-2" />
          </>
        )}

        {!loading && products?.length === 0 && (
          <p className="text-center text-mora-white/60">
            Merchandise is being finalized — check back soon!
          </p>
        )}
      </div>
    </section>
  );
}
