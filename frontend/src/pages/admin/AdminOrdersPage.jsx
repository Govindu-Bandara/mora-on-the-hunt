import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFetch } from '../../hooks/useFetch';
import { fetchOrders, updateOrderDistributed, updateOrderFlagged } from '../../api/ordersApi';
import { fetchAnalytics } from '../../api/authApi';
import { Spinner } from '../../components/ui/Spinner';
import { Select } from '../../components/ui/Select';
import { DistributionBreakdownModal } from '../../components/admin/DistributionBreakdownModal';

const DISTRIBUTED_OPTIONS = [
  { value: '', label: 'All (Distributed & Pending)' },
  { value: 'false', label: 'Not Distributed' },
  { value: 'true', label: 'Distributed' },
];

function DistributionSummary({ analytics }) {
  if (!analytics) return null;

  const totalItems = analytics.totalShirts + analytics.totalBangles;
  const totalDistributed = analytics.totalShirtsDistributed + analytics.totalBanglesDistributed;
  const totalRemaining = analytics.totalShirtsRemaining + analytics.totalBanglesRemaining;

  const tiles = [
    { label: 'Orders Distributed', value: analytics.ordersDistributed },
    { label: 'Orders Pending Distribution', value: analytics.ordersPendingDistribution },
    { label: 'Items Distributed', value: `${totalDistributed} / ${totalItems}` },
    { label: 'Items Remaining', value: totalRemaining },
    { label: 'Shirts Distributed', value: `${analytics.totalShirtsDistributed} / ${analytics.totalShirts}` },
    { label: 'Bangles Distributed', value: `${analytics.totalBanglesDistributed} / ${analytics.totalBangles}` },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-[11px] uppercase tracking-wide text-mora-white/50">{tile.label}</p>
          <p className="mt-1 text-xl font-bold text-mora-gold">{tile.value}</p>
        </div>
      ))}
    </div>
  );
}

export function AdminOrdersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [distributed, setDistributed] = useState('');
  const [page, setPage] = useState(1);
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const { data, loading, refetch } = useFetch(
    () =>
      fetchOrders({
        search: search || undefined,
        distributed: distributed || undefined,
        page,
        limit: 20,
      }),
    [search, distributed, page]
  );
  const { data: analytics, refetch: refetchAnalytics } = useFetch(fetchAnalytics, []);

  async function handleToggleDistributed(e, order) {
    e.stopPropagation();
    try {
      await updateOrderDistributed(order.orderId, !order.distributed);
      toast.success(order.distributed ? 'Marked as not distributed' : 'Marked as distributed');
      refetch();
      refetchAnalytics();
    } catch {
      toast.error('Failed to update distribution status');
    }
  }

  async function handleToggleFlagged(e, order) {
    e.stopPropagation();
    try {
      await updateOrderFlagged(order.orderId, !order.flagged);
      toast.success(order.flagged ? 'Flag removed' : 'Order flagged');
      refetch();
    } catch {
      toast.error('Failed to update flag');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-mora-white">Orders</h1>
        <button
          type="button"
          onClick={() => setBreakdownOpen(true)}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-mora-white/70 hover:border-mora-gold hover:text-mora-white"
        >
          Distribution Breakdown
        </button>
      </div>

      <DistributionSummary analytics={analytics} />

      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search by name, telephone, NIC..."
          className="flex-1 min-w-[200px] rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-mora-white focus:border-mora-gold focus:outline-none"
        />
        <Select
          value={distributed}
          onChange={(v) => {
            setPage(1);
            setDistributed(v);
          }}
          options={DISTRIBUTED_OPTIONS}
          className="w-60"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-mora-white/50">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Telephone</th>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">Faculty</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Distributed</th>
                <th className="px-4 py-3">Flag</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.orders.map((order) => (
                <tr
                  key={order._id}
                  onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                  className={`cursor-pointer border-t border-white/5 text-mora-white/80 transition-colors ${
                    order.flagged
                      ? 'bg-gradient-to-r from-red-900/50 via-red-900/25 to-transparent hover:from-red-900/60'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-mora-gold">{order.orderId}</td>
                  <td className="px-4 py-3">{order.fullName}</td>
                  <td className="px-4 py-3">{order.telephone}</td>
                  <td className="px-4 py-3">{order.batch}</td>
                  <td className="px-4 py-3">{order.faculty}</td>
                  <td className="px-4 py-3">Rs. {order.finalTotal}</td>
                  <td className="px-4 py-3">{order.status}</td>
                  <td className="px-4 py-3">
                    <label
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={order.distributed}
                        onChange={(e) => handleToggleDistributed(e, order)}
                        className="h-4 w-4 accent-mora-gold"
                      />
                      <span className={order.distributed ? 'text-green-400' : 'text-mora-white/40'}>
                        {order.distributed ? 'Yes' : 'No'}
                      </span>
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    <label
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={order.flagged}
                        onChange={(e) => handleToggleFlagged(e, order)}
                        className="h-4 w-4 accent-red-600"
                      />
                      <span className={order.flagged ? 'text-red-400' : 'text-mora-white/40'}>
                        {order.flagged ? 'Flagged' : 'No'}
                      </span>
                    </label>
                  </td>
                  <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {data?.orders.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-mora-white/50">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm text-mora-white/70">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded px-3 py-1 disabled:opacity-30 hover:bg-white/5"
          >
            Prev
          </button>
          <span>
            Page {data.page} of {data.pages}
          </span>
          <button
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded px-3 py-1 disabled:opacity-30 hover:bg-white/5"
          >
            Next
          </button>
        </div>
      )}

      <DistributionBreakdownModal isOpen={breakdownOpen} onClose={() => setBreakdownOpen(false)} />
    </div>
  );
}
