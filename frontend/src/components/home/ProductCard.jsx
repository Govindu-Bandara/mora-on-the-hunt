import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ProductGallerySwiper } from './ProductGallerySwiper';
import { Button } from '../ui/Button';
import { SizeSelectorModal } from '../order/SizeSelectorModal';
import { useOrderFlow } from '../../hooks/useOrderFlow';

export function ProductCard({ product }) {
  const { dispatch } = useOrderFlow();
  const navigate = useNavigate();
  const [sizeModalOpen, setSizeModalOpen] = useState(false);

  function addItem(size) {
    dispatch({ type: 'ADD_ITEM', payload: { product, size } });
    toast.success(`${product.name}${size ? ` (${size})` : ''} added to your order`);
    setSizeModalOpen(false);
  }

  function handleAddClick(e) {
    e.stopPropagation();
    if (product.category === 'tshirt') {
      setSizeModalOpen(true);
    } else {
      addItem(null);
    }
  }

  function handleGalleryClick(e) {
    if (e.target.closest('.swiper-button-next, .swiper-button-prev, .swiper-pagination-bullet')) {
      e.stopPropagation();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -6 }}
      onClick={() => navigate(`/products/${product._id}`)}
      className="group flex cursor-pointer flex-col overflow-hidden border border-white/10 bg-mora-navy shadow-2xl"
    >
      <div className="relative overflow-hidden" onClick={handleGalleryClick}>
        <span className="absolute left-3 top-3 z-10 bg-mora-gold px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-mora-black">
          {product.category === 'tshirt' ? 'T-Shirt' : 'Bangle'}
        </span>
        <div className="transition-transform duration-500 group-hover:scale-105">
          <ProductGallerySwiper images={product.images} alt={product.name} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 border-t-4 border-mora-gold p-5">
        <h3 className="text-lg font-bold uppercase tracking-wide text-mora-white">
          {product.name}
        </h3>
        <p className="flex-1 text-sm text-mora-white/55">{product.description}</p>
        <p className="text-2xl font-black text-mora-gold">Rs. {product.currentPrice}</p>
        <Button shape="sharp" onClick={handleAddClick} className="mt-2 w-full uppercase tracking-widest text-sm">
          Add to Order
        </Button>
      </div>
      <SizeSelectorModal
        isOpen={sizeModalOpen}
        onClose={() => setSizeModalOpen(false)}
        onSelect={addItem}
        productName={product.name}
      />
    </motion.div>
  );
}
