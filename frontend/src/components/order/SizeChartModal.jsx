import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export function SizeChartModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl p-6" labelledBy="size-chart-title">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 id="size-chart-title" className="text-lg font-semibold text-mora-white">
          T-Shirt Size Chart
        </h3>
        <Button variant="ghost" className="px-4 py-2 text-sm" onClick={onClose}>
          Close
        </Button>
      </div>
      <img
        src="/size_chart.jpeg"
        alt="T-shirt sizing specifications chart"
        className="w-full rounded-lg"
      />
    </Modal>
  );
}
