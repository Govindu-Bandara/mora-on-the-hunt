import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import { useFetch } from '../../hooks/useFetch';
import { fetchDistributionBreakdown } from '../../api/authApi';

const TABS = [
  { key: 'total', label: 'Total' },
  { key: 'distributed', label: 'Distributed' },
  { key: 'remaining', label: 'To Be Distributed' },
];

function Cell({ value }) {
  if (!value) {
    return <td className="px-3 py-2 text-center text-mora-white/20">&mdash;</td>;
  }
  return <td className="px-3 py-2 text-center text-sm font-bold text-mora-white">{value}</td>;
}

export function DistributionBreakdownModal({ isOpen, onClose }) {
  const [tab, setTab] = useState('total');
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

        <div className="mb-4 flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                tab === t.key
                  ? 'border-mora-gold bg-mora-gold/10 text-mora-gold'
                  : 'border-white/10 bg-white/5 text-mora-white/60 hover:text-mora-white'
              }`}
            >
              {t.label}
            </button>
          ))}
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
                      <Cell
                        key={size}
                        value={row.category === 'tshirt' ? row.bySize[size]?.[tab] : null}
                      />
                    ))}
                    <Cell value={row.total[tab]} />
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
          {tab === 'total' && 'Total quantity ordered per item and size.'}
          {tab === 'distributed' && 'Quantity already marked as distributed per item and size.'}
          {tab === 'remaining' && 'Quantity still left to hand out per item and size.'}
        </p>
      </div>
    </Modal>
  );
}
