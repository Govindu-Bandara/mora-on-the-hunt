import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFetch } from '../../hooks/useFetch';
import { fetchProducts, updateProduct, deleteProduct } from '../../api/productsApi';
import { Spinner } from '../../components/ui/Spinner';

export function AdminProductsPage() {
  const { data: products, loading, refetch } = useFetch(() => fetchProducts(), []);

  async function toggleAvailable(product) {
    try {
      await updateProduct(product._id, { ...product, available: !product.available });
      toast.success(product.available ? 'Product disabled' : 'Product enabled');
      refetch();
    } catch {
      toast.error('Failed to update product');
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    try {
      await deleteProduct(product._id);
      toast.success('Product deleted');
      refetch();
    } catch {
      toast.error('Failed to delete product');
    }
  }

  async function move(product, direction, siblings) {
    const idx = siblings.findIndex((p) => p._id === product._id);
    const swapWith = siblings[idx + direction];
    if (!swapWith) return;
    try {
      await Promise.all([
        updateProduct(product._id, { ...product, sortOrder: swapWith.sortOrder }),
        updateProduct(swapWith._id, { ...swapWith, sortOrder: product.sortOrder }),
      ]);
      refetch();
    } catch {
      toast.error('Failed to reorder');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const categories = ['tshirt', 'bangle'];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-mora-white">Products</h1>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center justify-center rounded-full bg-mora-gold px-6 py-3 font-semibold text-mora-black hover:bg-yellow-400 transition-colors"
        >
          New Product
        </Link>
      </div>

      {categories.map((category) => {
        const items = (products || []).filter((p) => p.category === category);
        return (
          <div key={category}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-mora-white/60">
              {category === 'tshirt' ? 'T-Shirts' : 'Bangles'}
            </h2>
            <div className="space-y-2">
              {items.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-3"
                >
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="h-14 w-14 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-mora-white">{product.name}</p>
                    <p className="text-xs text-mora-white/50">
                      Rs. {product.currentPrice} · {product.available ? 'Available' : 'Disabled'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => move(product, -1, items)}
                      className="rounded px-2 py-1 text-mora-white/60 hover:bg-white/10"
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => move(product, 1, items)}
                      className="rounded px-2 py-1 text-mora-white/60 hover:bg-white/10"
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                  </div>
                  <Link
                    to={`/admin/products/${product._id}`}
                    className="text-xs font-medium text-mora-gold hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => toggleAvailable(product)}
                    className="text-xs font-medium text-mora-white/60 hover:text-mora-white"
                  >
                    {product.available ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="text-xs font-medium text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {items.length === 0 && <p className="text-sm text-mora-white/40">No products yet.</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
