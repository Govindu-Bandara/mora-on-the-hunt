import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { fetchProduct, createProduct, updateProduct, uploadProductImages } from '../../api/productsApi';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 50 * 1024 * 1024;

export function AdminProductEditPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
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
      setImages(product.images || []);
    });
  }, [id, isNew, reset]);

  async function handleFiles(fileList) {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    const invalidType = files.find((f) => !ALLOWED_TYPES.includes(f.type));
    if (invalidType) {
      toast.error('Only JPG, PNG, or WEBP images are allowed');
      return;
    }
    const tooLarge = files.find((f) => f.size > MAX_SIZE_BYTES);
    if (tooLarge) {
      toast.error('Each image must be smaller than 50MB');
      return;
    }

    setUploading(true);
    try {
      const uploaded = await uploadProductImages(files);
      setImages((prev) => [...prev, ...uploaded.map((u) => u.url)]);
      toast.success(`${files.length} image${files.length > 1 ? 's' : ''} uploaded`);
    } catch {
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }

  async function onSubmit(values) {
    const payload = { ...values, images };
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
          <label className="mb-1 block text-sm text-mora-white/70">Product Images</label>

          {images.length > 0 && (
            <div className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((url, i) => (
                <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-white/10">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              dragActive ? 'border-mora-gold bg-mora-gold/5' : 'border-white/20 hover:border-mora-gold'
            }`}
          >
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            {uploading ? (
              <Spinner />
            ) : (
              <span className="text-sm text-mora-white/50">
                Drag and drop images here, or click to select (JPG, PNG, WEBP, up to 50MB each)
              </span>
            )}
          </label>
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
