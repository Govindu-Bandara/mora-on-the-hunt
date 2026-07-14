import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFetch } from '../hooks/useFetch';
import { fetchProduct } from '../api/productsApi';
import { useOrderFlow } from '../hooks/useOrderFlow';
import { ProductDetailGallery } from '../components/home/ProductDetailGallery';
import { SizeChartModal } from '../components/order/SizeChartModal';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const FABRIC = 'Baby Pique';

export function ProductDetailPage() {
  const { id } = useParams();
  const { dispatch } = useOrderFlow();
  const { data: product, loading, error } = useFetch(() => fetchProduct(id), [id]);
  const [size, setSize] = useState(null);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);

  function handleAdd() {
    if (product.category === 'tshirt' && !size) {
      toast.error('Please select a size');
      return;
    }
    dispatch({ type: 'ADD_ITEM', payload: { product, size } });
    toast.success(`${product.name}${size ? ` (${size})` : ''} added to your order`);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-mora-white/60">Product not found.</p>
        <Link to="/#merchandise" className="text-mora-gold underline">
          Back to Merchandise
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <Link
        to="/#merchandise"
        className="mb-8 inline-block text-xs font-bold uppercase tracking-widest text-mora-white/50 hover:text-mora-gold"
      >
        &larr; Back to Merchandise
      </Link>

      <div className="grid min-w-0 grid-cols-1 gap-12 lg:grid-cols-2">
        <ProductDetailGallery images={product.images} alt={product.name} />

        <div className="min-w-0">
          <span className="mb-4 inline-block bg-mora-gold px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-mora-black">
            {product.category === 'tshirt' ? 'T-Shirt' : 'Bangle'}
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-mora-white sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 text-3xl font-black text-mora-gold">Rs. {product.currentPrice}</p>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-mora-white/60">
            {product.description}
          </p>

          {product.category === 'tshirt' && (
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-mora-white/50">
              Fabric
              <span className="ml-2 font-normal normal-case tracking-normal text-mora-white/70">
                {FABRIC}
              </span>
            </p>
          )}

          {product.category === 'tshirt' && (
            <div className="mt-8">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-mora-white/50">
                  Select Size
                </p>
                <button
                  type="button"
                  onClick={() => setSizeChartOpen(true)}
                  className="text-xs font-bold uppercase tracking-widest text-mora-gold underline underline-offset-4 hover:text-mora-white"
                >
                  View Size Chart
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`h-12 w-12 border-2 text-sm font-bold transition-colors ${
                      size === s
                        ? 'border-mora-gold bg-mora-gold text-mora-black'
                        : 'border-white/20 text-mora-white/70 hover:border-mora-gold'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            shape="sharp"
            onClick={handleAdd}
            className="mt-10 w-full max-w-md text-sm uppercase tracking-widest sm:w-auto sm:px-16"
          >
            Add to Order
          </Button>
        </div>
      </div>

      <SizeChartModal isOpen={sizeChartOpen} onClose={() => setSizeChartOpen(false)} />
    </div>
  );
}
