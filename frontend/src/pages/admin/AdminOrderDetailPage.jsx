import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFetch } from '../../hooks/useFetch';
import {
  fetchOrder,
  updateOrderStatus,
  addOrderNote,
  deleteOrder,
  fetchPaymentSlipBlob,
} from '../../api/ordersApi';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../hooks/useAuth';

const STATUSES = ['Pending Verification', 'Verified', 'Completed', 'Cancelled'];

export function AdminOrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { admin } = useAuth();
  const { data: order, loading, refetch } = useFetch(() => fetchOrder(orderId), [orderId]);
  const [noteText, setNoteText] = useState('');
  const [slipUrl, setSlipUrl] = useState(null);

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

  async function handleStatusChange(e) {
    try {
      await updateOrderStatus(orderId, e.target.value);
      toast.success('Status updated');
      refetch();
    } catch {
      toast.error('Failed to update status');
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

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-mora-white">{order.orderId}</h1>
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

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-mora-white/60">
          Customer
        </h2>
        <dl className="grid grid-cols-2 gap-3 text-sm text-mora-white/80">
          <div><dt className="text-mora-white/50">Full Name</dt><dd>{order.fullName}</dd></div>
          <div><dt className="text-mora-white/50">Index/NIC</dt><dd>{order.indexOrNic}</dd></div>
          <div><dt className="text-mora-white/50">Telephone</dt><dd>{order.telephone}</dd></div>
          <div><dt className="text-mora-white/50">Batch</dt><dd>{order.batch}</dd></div>
          <div><dt className="text-mora-white/50">Faculty</dt><dd>{order.faculty}</dd></div>
          <div><dt className="text-mora-white/50">Department</dt><dd>{order.department}</dd></div>
        </dl>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-mora-white/60">
          Items
        </h2>
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
            <img src={slipUrl} alt="Payment slip" className="max-h-96 rounded-lg" />
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
    </div>
  );
}
