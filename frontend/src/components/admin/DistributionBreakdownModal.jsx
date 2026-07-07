import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import { useFetch } from '../../hooks/useFetch';
import { fetchDistributionBreakdown } from '../../api/authApi';

function Cell({ stats }) {
  if (!stats || stats.total === 0) {
    return <td className="px-3 py-2 text-center text-mora-white/20">&mdash;</td>;
  }
  return (
    <td className="px-3 py-2 text-center">
      <div className="text-sm font-bold text-mora-white">{stats.total}</div>
      <div className="text-[10px] text-green-400">{stats.distributed} done</div>
      <div className="text-[10px] text-mora-gold">{stats.remaining} left</div>
    </td>
  );
}

export function DistributionBreakdownModal({ isOpen, onClose }) {
  const { data, loading } = useFetch(
    () => (isOpen ? fetchDistributionBreakdown() : Promise.resolve(null)),
    [isOpen]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl"
      labelledBy="distribution-breakdown-title"
    >
      <div className="p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 id="distribution-breakdown-title" className="text-xl font-bold text-mora-white">
            Distribution Breakdown
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-2xl leading-none text-mora-white/50 hover:text-mora-white"
          >
            &times;
          </button>
        </div>

        {loading || !data ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-mora-white/50">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  {data.sizes.map((size) => (
                    <th key={size} className="px-3 py-3 text-center">
                      {size}
                    </th>
                  ))}
                  <th className="px-3 py-3 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr key={row.name} className="border-t border-white/5 text-mora-white/80">
                    <td className="px-4 py-2 font-medium">{row.name}</td>
                    {data.sizes.map((size) => (
                      <Cell key={size} stats={row.category === 'tshirt' ? row.bySize[size] : null} />
                    ))}
                    <Cell stats={row.total} />
                  </tr>
                ))}
                {data.rows.length === 0 && (
                  <tr>
                    <td colSpan={data.sizes.length + 2} className="px-4 py-8 text-center text-mora-white/50">
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs text-mora-white/40">
          Each cell shows total ordered, how many have been marked distributed, and how many are
          still left to hand out.
        </p>
      </div>
    </Modal>
  );
}
