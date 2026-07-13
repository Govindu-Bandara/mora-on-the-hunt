import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../../ui/Button';
import { Spinner } from '../../ui/Spinner';
import { SizeSelectorModal } from '../SizeSelectorModal';
import { SizeChartModal } from '../SizeChartModal';
import { CartSidebar } from '../CartSidebar';
import { useOrderFlow } from '../../../hooks/useOrderFlow';
import { useFetch } from '../../../hooks/useFetch';
import { fetchProducts } from '../../../api/productsApi';

function MiniProductCard({ product, onAdd }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
      <img
        src={product.images?.[0]}
        alt={product.name}
        className="h-16 w-16 shrink-0 rounded-md object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-mora-white">{product.name}</p>
        <p className="text-xs text-mora-gold">Rs. {product.currentPrice}</p>
      </div>
      <Button variant="outline" className="px-4 py-2 text-xs" onClick={onAdd}>
        Add
      </Button>
    </div>
  );
}

export function StepMerchSelection() {
  const { state, dispatch } = useOrderFlow();
  const { data: products, loading } = useFetch(() => fetchProducts(), []);
  const [sizeModal, setSizeModal] = useState(null);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);

  function handleAdd(product) {
    if (product.category === 'tshirt') {
      setSizeModal(product);
    } else {
      dispatch({ type: 'ADD_ITEM', payload: { product, size: null } });
      toast.success(`${product.name} added`);
    }
  }

  function handleSizeSelect(size) {
    dispatch({ type: 'ADD_ITEM', payload: { product: sizeModal, size } });
    toast.success(`${sizeModal.name} (${size}) added`);
    setSizeModal(null);
  }

  function handleContinue() {
    if (state.items.length === 0) {
      toast.error('Add at least one item to continue');
      return;
    }
    dispatch({ type: 'SET_STEP', step: 2 });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-mora-white">Choose Your Merchandise</h3>
          <Button
            variant="outline"
            className="shrink-0 px-4 py-2 text-xs"
            onClick={() => setSizeChartOpen(true)}
          >
            View Size Chart
          </Button>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-3">
            {products?.map((product) => (
              <MiniProductCard
                key={product._id}
                product={product}
                onAdd={() => handleAdd(product)}
              />
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <CartSidebar />
        <div className="flex gap-3">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => dispatch({ type: 'CLOSE_MODAL' })}
          >
            Close
          </Button>
          <Button className="flex-1" onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </div>

      {sizeModal && (
        <SizeSelectorModal
          isOpen={Boolean(sizeModal)}
          onClose={() => setSizeModal(null)}
          onSelect={handleSizeSelect}
          productName={sizeModal.name}
        />
      )}

      <SizeChartModal isOpen={sizeChartOpen} onClose={() => setSizeChartOpen(false)} />
    </div>
  );
}
