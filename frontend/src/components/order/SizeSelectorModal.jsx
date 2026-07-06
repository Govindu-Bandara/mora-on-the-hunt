import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export function SizeSelectorModal({ isOpen, onClose, onSelect, productName }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-sm p-6" labelledBy="size-modal-title">
      <h3 id="size-modal-title" className="mb-1 text-lg font-semibold text-mora-white">
        Select a size
      </h3>
      <p className="mb-5 text-sm text-mora-white/60">{productName}</p>
      <div className="grid grid-cols-3 gap-3">
        {SIZES.map((size) => (
          <Button
            key={size}
            variant="outline"
            className="py-3 text-sm"
            onClick={() => onSelect(size)}
          >
            {size}
          </Button>
        ))}
      </div>
    </Modal>
  );
}
