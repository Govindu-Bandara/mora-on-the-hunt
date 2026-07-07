import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFetch } from '../../hooks/useFetch';
import {
  fetchOrder,
  updateOrder,
  updateOrderStatus,
  updateOrderDistributed,
  addOrderNote,
  deleteOrder,
  fetchPaymentSlipBlob,
} from '../../api/ordersApi';
import { fetchProducts } from '../../api/productsApi';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Modal } from '../../components/ui/Modal';
import { SizeSelectorModal } from '../../components/order/SizeSelectorModal';
import { useAuth } from '../../hooks/useAuth';

const STATUSES = ['Pending Verification', 'Verified', 'Completed', 'Cancelled'];
const CUSTOMER_FIELDS = [
  { name: 'fullName', label: 'Full Name' },
  { name: 'indexOrNic', label: 'Index/NIC' },
  { name: 'telephone', label: 'Telephone' },
  { name: 'batch', label: 'Batch' },
  { name: 'faculty', label: 'Faculty' },
  { name: 'department', label: 'Department' },
];

function orderToEditState(order) {
  return {
    customer: {
      fullName: order.fullName,
      indexOrNic: order.indexOrNic,
      telephone: order.telephone,
      batch: order.batch,
      faculty: order.faculty,
      department: order.department,
    },
    items: order.items.map((item, i) => ({
      key: `${item.product}-${item.size || 'none'}-${i}`,
      productId: item.product,
      name: item.name,
      category: item.category,
      color: item.color,
      size: item.size,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  };
}

export function AdminOrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { admin } = useAuth();
  const { data: order, loading, refetch } = useFetch(() => fetchOrder(orderId), [orderId]);
  const { data: products } = useFetch(() => fetchProducts(), []);
  const [noteText, setNoteText] = useState('');
  const [slipUrl, setSlipUrl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState(null);
  const [sizeModalProduct, setSizeModalProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    let objectUrl;
    fetchPaymentSlipBlob(orderId)
      .then(({ blob }) => {
        objectUrl = URL.createObjectURL(blob);
        setSlipUrl(objectUrl);
      })
      .catch(() => setSlipUrl(null));
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [orderId]);

  function startEditing() {
    setEditState(orderToEditState(order));
    setIsEditing(true);
  }

  function cancelEditing() {
    setEditState(null);
    setIsEditing(false);
  }

  function updateCustomerField(name, value) {
    setEditState((prev) => ({ ...prev, customer: { ...prev.customer, [name]: value } }));
  }

  function updateItemQuantity(key, quantity) {
    setEditState((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, quantity) } : i)),
    }));
  }

  function removeItem(key) {
    setEditState((prev) => ({ ...prev, items: prev.items.filter((i) => i.key !== key) }));
  }

  function addItem(product, size) {
    setEditState((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          key: `${product._id}-${size || 'none'}-${Date.now()}`,
          productId: product._id,
          name: product.name,
          category: product.category,
          color: product.color,
          size: size || null,
          quantity: 1,
          unitPrice: product.currentPrice,
        },
      ],
    }));
  }

  function handleAddProductClick(product) {
    if (product.category === 'tshirt') {
      setSizeModalProduct(product);
    } else {
      addItem(product, null);
    }
  }

  async function handleSaveEdit() {
    if (editState.items.length === 0) {
      toast.error('An order must have at least one item');
      return;
    }
    setSaving(true);
    try {
      await updateOrder(orderId, {
        ...editState.customer,
        items: editState.items.map((i) => ({
          productId: i.productId,
          size: i.size,
          quantity: i.quantity,
        })),
      });
      toast.success('Order updated');
      setIsEditing(false);
      setEditState(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order');
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(e) {
    try {
      await updateOrderStatus(orderId, e.target.value);
      toast.success('Status updated');
      refetch();
    } catch {
      toast.error('Failed to update status');
    }
  }

  async function handleToggleDistributed() {
    try {
      await updateOrderDistributed(orderId, !order.distributed);
      toast.success(order.distributed ? 'Marked as not distributed' : 'Marked as distributed');
      refetch();
    } catch {
      toast.error('Failed to update distribution status');
    }
  }

  async function handleAddNote() {
    if (!noteText.trim()) return;
    try {
      await addOrderNote(orderId, noteText);
      setNoteText('');
      refetch();
    } catch {
      toast.error('Failed to add note');
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this order permanently?')) return;
    try {
      await deleteOrder(orderId);
      toast.success('Order deleted');
      navigate('/admin/orders');
    } catch {
      toast.error('Failed to delete order');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!order) return <p className="text-mora-white/60">Order not found.</p>;

  const editTotal = isEditing
    ? editState.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
    : null;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-mora-white">{order.orderId}</h1>
        <div className="flex items-center gap-3">
          {!isEditing && (
            <button
              type="button"
              onClick={startEditing}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-mora-white/70 hover:border-mora-gold hover:text-mora-white"
            >
              Edit Order
            </button>
          )}
          <button
            type="button"
            onClick={handleToggleDistributed}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
              order.distributed
                ? 'border-green-500/40 bg-green-500/10 text-green-400'
                : 'border-white/10 bg-white/5 text-mora-white/70 hover:border-mora-gold'
            }`}
          >
            {order.distributed ? '✓ Distributed' : 'Mark as Distributed'}
          </button>
          <select
            value={order.status}
            onChange={handleStatusChange}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-mora-white"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-mora-white/60">
          Customer
        </h2>
        {isEditing ? (
          <div className="grid grid-cols-2 gap-3">
            {CUSTOMER_FIELDS.map((field) => (
              <div key={field.name}>
                <label className="mb-1 block text-xs text-mora-white/50">{field.label}</label>
                <input
                  value={editState.customer[field.name]}
                  onChange={(e) => updateCustomerField(field.name, e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-mora-white focus:border-mora-gold focus:outline-none"
                />
              </div>
            ))}
          </div>
        ) : (
          <dl className="grid grid-cols-2 gap-3 text-sm text-mora-white/80">
            <div><dt className="text-mora-white/50">Full Name</dt><dd>{order.fullName}</dd></div>
            <div><dt className="text-mora-white/50">Index/NIC</dt><dd>{order.indexOrNic}</dd></div>
            <div><dt className="text-mora-white/50">Telephone</dt><dd>{order.telephone}</dd></div>
            <div><dt className="text-mora-white/50">Batch</dt><dd>{order.batch}</dd></div>
            <div><dt className="text-mora-white/50">Faculty</dt><dd>{order.faculty}</dd></div>
            <div><dt className="text-mora-white/50">Department</dt><dd>{order.department}</dd></div>
          </dl>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-mora-white/60">
          Items
        </h2>

        {isEditing ? (
          <div className="space-y-2">
            {editState.items.map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                <span className="text-sm text-mora-white/80">
                  {item.name}
                  {item.size ? ` (${item.size})` : ''}
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItemQuantity(item.key, Number(e.target.value))}
                    className="w-16 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-mora-white"
                  />
                  <span className="w-20 text-right text-sm text-mora-gold">
                    Rs. {item.unitPrice * item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    className="text-red-400 hover:text-red-300"
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-mora-white/50">
                Add Item
              </p>
              <div className="flex flex-wrap gap-2">
                {products?.map((product) => (
                  <button
                    key={product._id}
                    type="button"
                    onClick={() => handleAddProductClick(product)}
                    className="rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-mora-white/70 hover:border-mora-gold hover:text-mora-white"
                  >
                    + {product.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-between border-t border-white/10 pt-3 text-base font-bold text-mora-gold">
              <span>Estimated Total (pre-bundle-discount)</span>
              <span>Rs. {editTotal}</span>
            </div>
            <p className="text-xs text-mora-white/40">
              Final total with bundle discount is recalculated automatically on save.
            </p>

            <div className="mt-4 flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={cancelEditing} disabled={saving}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSaveEdit} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ul className="space-y-2 text-sm text-mora-white/80">
              {order.items.map((item, i) => (
                <li key={i} className="flex justify-between">
                  <span>
                    {item.name}
                    {item.size ? ` (${item.size})` : ''} &times; {item.quantity}
                  </span>
                  <span>Rs. {item.unitPrice * item.quantity}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t border-white/10 pt-3 text-sm text-mora-white/70">
              <div className="flex justify-between"><span>Bundle Savings</span><span>Rs. {order.bundleSavings}</span></div>
              <div className="mt-1 flex justify-between text-base font-bold text-mora-gold">
                <span>Final Total</span><span>Rs. {order.finalTotal}</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-mora-white/60">
          Payment Slip
        </h2>
        {slipUrl ? (
          order.paymentSlip.mimetype === 'application/pdf' ? (
            <a href={slipUrl} target="_blank" rel="noreferrer" className="text-mora-gold underline">
              View PDF
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="block cursor-zoom-in transition-opacity hover:opacity-90"
            >
              <img src={slipUrl} alt="Payment slip" className="max-h-96 rounded-lg" />
            </button>
          )
        ) : (
          <p className="text-mora-white/50">Loading slip...</p>
        )}
        {slipUrl && (
          <a href={slipUrl} download={order.paymentSlip.originalName} className="mt-3 block text-sm text-mora-gold underline">
            Download
          </a>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-mora-white/60">
          Internal Notes
        </h2>
        <ul className="mb-3 space-y-2 text-sm text-mora-white/70">
          {order.notes.map((note, i) => (
            <li key={i} className="border-b border-white/5 pb-2">
              {note.text}
            </li>
          ))}
          {order.notes.length === 0 && <li className="text-mora-white/40">No notes yet.</li>}
        </ul>
        <div className="flex gap-2">
          <input
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note..."
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-mora-white"
          />
          <Button variant="outline" className="px-4 py-2 text-sm" onClick={handleAddNote}>
            Add
          </Button>
        </div>
      </div>

      {admin?.role === 'superadmin' && (
        <Button variant="danger" onClick={handleDelete}>
          Delete Order
        </Button>
      )}

      {sizeModalProduct && (
        <SizeSelectorModal
          isOpen={Boolean(sizeModalProduct)}
          onClose={() => setSizeModalProduct(null)}
          onSelect={(size) => {
            addItem(sizeModalProduct, size);
            setSizeModalProduct(null);
          }}
          productName={sizeModalProduct.name}
        />
      )}

      {slipUrl && order.paymentSlip.mimetype !== 'application/pdf' && (
        <Modal
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          className="max-w-4xl !bg-transparent !shadow-none"
          labelledBy="payment-slip-lightbox-title"
        >
          <div className="relative">
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close"
              className="absolute -top-10 right-0 text-2xl leading-none text-mora-white/70 hover:text-mora-white"
            >
              &times;
            </button>
            <span id="payment-slip-lightbox-title" className="sr-only">
              Payment slip, full size
            </span>
            <img src={slipUrl} alt="Payment slip (full size)" className="max-h-[85vh] w-full rounded-lg object-contain" />
          </div>
        </Modal>
      )}
    </div>
  );
}
