import { useState } from 'react';
import { Select } from '../ui/Select';

const PRESET_BATCHES = ['22', '23', '24', '25', 'Staff'];
const BATCH_OPTIONS = [...PRESET_BATCHES, 'Other'].map((v) => ({ value: v, label: v }));

export function BatchSelectField({ value, onChange }) {
  const isPreset = PRESET_BATCHES.includes(value);
  const [selection, setSelection] = useState(() => {
    if (!value) return '';
    return isPreset ? value : 'Other';
  });
  const [customValue, setCustomValue] = useState(() => (!isPreset && value ? value : ''));

  function handleSelectionChange(next) {
    setSelection(next);
    onChange(next === 'Other' ? customValue : next);
  }

  function handleCustomChange(e) {
    const next = e.target.value;
    setCustomValue(next);
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <Select value={selection} onChange={handleSelectionChange} options={BATCH_OPTIONS} />
      {selection === 'Other' && (
        <input
          value={customValue}
          onChange={handleCustomChange}
          placeholder="Enter batch"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-mora-white placeholder-white/30 focus:border-mora-gold focus:outline-none"
        />
      )}
    </div>
  );
}
