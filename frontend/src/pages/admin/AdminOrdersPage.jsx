import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { fetchOrders } from '../../api/ordersApi';
import { Spinner } from '../../components/ui/Spinner';

const STATUSES = ['Pending Verification', 'Verified', 'Completed', 'Cancelled'];

export function AdminOrdersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, loading } = useFetch(
    () => fetchOrders({ search: search || undefined, status: status || undefined, page, limit: 20 }),
    [search, status, page]
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-mora-white">Orders</h1>

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
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-mora-white focus:border-mora-gold focus:outline-none"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
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
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.orders.map((order) => (
                <tr
                  key={order._id}
                  onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                  className="cursor-pointer border-t border-white/5 text-mora-white/80 hover:bg-white/5"
                >
                  <td className="px-4 py-3 font-medium text-mora-gold">{order.orderId}</td>
                  <td className="px-4 py-3">{order.fullName}</td>
                  <td className="px-4 py-3">{order.telephone}</td>
                  <td className="px-4 py-3">{order.batch}</td>
                  <td className="px-4 py-3">{order.faculty}</td>
                  <td className="px-4 py-3">Rs. {order.finalTotal}</td>
                  <td className="px-4 py-3">{order.status}</td>
                  <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {data?.orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-mora-white/50">
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
    </div>
  );
}
