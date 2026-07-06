import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useFetch } from '../../hooks/useFetch';
import { fetchAnalytics } from '../../api/authApi';
import { Spinner } from '../../components/ui/Spinner';

function StatTile({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <p className="text-xs uppercase tracking-wide text-mora-white/50">{label}</p>
      <p className="mt-2 text-2xl font-bold text-mora-gold">{value}</p>
    </div>
  );
}

function DistributionChart({ title, data }) {
  const chartData = (data || []).map((d) => ({ name: d._id || 'Unknown', count: d.count }));
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <p className="mb-4 text-sm font-semibold text-mora-white/70">{title}</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} allowDecimals={false} />
          <Tooltip contentStyle={{ background: '#0b1d3a', border: 'none', color: '#fff' }} />
          <Bar dataKey="count" fill="#d4af37" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AdminDashboardPage() {
  const { data, loading } = useFetch(fetchAnalytics, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-mora-white">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total Orders" value={data.totalOrders} />
        <StatTile label="Total Revenue" value={`Rs. ${data.totalRevenue}`} />
        <StatTile label="Total T-Shirts" value={data.totalShirts} />
        <StatTile label="Total Bangles" value={data.totalBangles} />
        <StatTile label="Total Bundles Sold" value={data.totalBundles} />
        <StatTile label="Orders Today" value={data.ordersToday} />
        <StatTile label="Revenue Today" value={`Rs. ${data.revenueToday}`} />
        <StatTile label="Most Popular Batch" value={data.mostPopularBatch || '—'} />
        <StatTile label="Most Popular Shirt Color" value={data.mostPopularShirtColor || '—'} />
        <StatTile label="Most Popular Size" value={data.mostPopularSize || '—'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DistributionChart title="Faculty Distribution" data={data.facultyDistribution} />
        <DistributionChart title="Department Distribution" data={data.departmentDistribution} />
        <DistributionChart title="Shirt Color Distribution" data={data.colorDistribution} />
        <DistributionChart title="Size Distribution" data={data.sizeDistribution} />
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <p className="mb-4 text-sm font-semibold text-mora-white/70">Recent Orders</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-mora-white/50">
              <tr>
                <th className="pb-2 pr-4">Order ID</th>
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Total</th>
                <th className="pb-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-mora-white/80">
              {data.recentOrders.map((order) => (
                <tr key={order._id} className="border-t border-white/5">
                  <td className="py-2 pr-4">{order.orderId}</td>
                  <td className="py-2 pr-4">{order.fullName}</td>
                  <td className="py-2 pr-4">Rs. {order.finalTotal}</td>
                  <td className="py-2 pr-4">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
