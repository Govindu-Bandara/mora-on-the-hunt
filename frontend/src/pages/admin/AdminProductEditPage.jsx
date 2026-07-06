import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { fetchProduct, createProduct, updateProduct } from '../../api/productsApi';

export function AdminProductEditPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const [images, setImages] = useState(['']);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      category: 'tshirt',
      color: '',
      description: '',
      currentPrice: '',
      available: true,
    },
  });

  useEffect(() => {
    if (isNew) return;
    fetchProduct(id).then((product) => {
      reset(product);
      setImages(product.images?.length ? product.images : ['']);
    });
  }, [id, isNew, reset]);

  async function onSubmit(values) {
    const payload = { ...values, images: images.filter((url) => url.trim()) };
    try {
      if (isNew) {
        await createProduct(payload);
        toast.success('Product created');
      } else {
        await updateProduct(id, payload);
        toast.success('Product updated');
      }
      navigate('/admin/products');
    } catch {
      toast.error('Failed to save product');
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-mora-white">
        {isNew ? 'New Product' : 'Edit Product'}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-mora-white/70">Name</label>
          <input
            {...register('name', { required: 'Name is required' })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-mora-white"
          />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm text-mora-white/70">Category</label>
          <select
            {...register('category')}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-mora-white"
          >
            <option value="tshirt">T-Shirt</option>
            <option value="bangle">Bangle</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-mora-white/70">Color</label>
          <input
            {...register('color', { required: 'Color is required' })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-mora-white"
          />
          {errors.color && <p className="mt-1 text-xs text-red-400">{errors.color.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm text-mora-white/70">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-mora-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-mora-white/70">Price (Rs.)</label>
          <input
            type="number"
            step="0.01"
            {...register('currentPrice', { required: 'Price is required', min: 0 })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-mora-white"
          />
          {errors.currentPrice && (
            <p className="mt-1 text-xs text-red-400">{errors.currentPrice.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm text-mora-white/70">Image URLs</label>
          {images.map((url, i) => (
            <div key={i} className="mb-2 flex gap-2">
              <input
                value={url}
                onChange={(e) =>
                  setImages((prev) => prev.map((u, idx) => (idx === i ? e.target.value : u)))
                }
                placeholder="/placeholder/example.svg"
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-mora-white"
              />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-red-400 hover:text-red-300"
              >
                &times;
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setImages((prev) => [...prev, ''])}
            className="text-sm text-mora-gold hover:underline"
          >
            + Add image
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm text-mora-white/70">
          <input type="checkbox" {...register('available')} className="accent-mora-gold" />
          Available for pre-order
        </label>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </Button>
      </form>
    </div>
  );
}
