import { useState } from 'react';
import { Select } from '../ui/Select';

const PRESET_FACULTIES = [
  'Faculty of Engineering',
  'Faculty of IT',
  'Faculty of Medicine',
  'Faculty of Architecture',
  'Faculty of Business',
  'BIT',
  'NDT',
];
const FACULTY_OPTIONS = [...PRESET_FACULTIES, 'Other'].map((v) => ({ value: v, label: v }));

export function FacultySelectField({ value, onChange }) {
  const isPreset = PRESET_FACULTIES.includes(value);
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
      <Select value={selection} onChange={handleSelectionChange} options={FACULTY_OPTIONS} />
      {selection === 'Other' && (
        <input
          value={customValue}
          onChange={handleCustomChange}
          placeholder="Enter faculty"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-mora-white placeholder-white/30 focus:border-mora-gold focus:outline-none"
        />
      )}
    </div>
  );
}
