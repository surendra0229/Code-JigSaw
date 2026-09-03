import React from 'react';
import { ChevronDown } from 'lucide-react';

interface LineNumberDropdownProps {
  lineId: string;
  totalLines: number;
  selectedValue: number | null;
  usedNumbersMap: Record<string, number>; // lineId -> selected value
  onChange: (lineId: string, value: number | null) => void;
  disabled?: boolean;
}

export const LineNumberDropdown: React.FC<LineNumberDropdownProps> = ({
  lineId,
  totalLines,
  selectedValue,
  usedNumbersMap,
  onChange,
  disabled = false
}) => {
  // Determine which numbers are taken by OTHER lines
  const takenByOthers = new Set<number>();
  Object.entries(usedNumbersMap).forEach(([id, num]) => {
    if (id !== lineId && num !== null && num !== undefined) {
      takenByOthers.add(num);
    }
  });

  // Generate available options: 1..totalLines
  const allNumbers = Array.from({ length: totalLines }, (_, i) => i + 1);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '') {
      onChange(lineId, null);
    } else {
      onChange(lineId, Number(val));
    }
  };

  return (
    <div className="relative flex-shrink-0">
      <select
        value={selectedValue !== null ? selectedValue : ''}
        onChange={handleSelectChange}
        disabled={disabled}
        aria-label={`Select line number for code line`}
        className={`min-w-[84px] sm:min-w-[100px] h-10 px-3 rounded-lg bg-dark-slate font-mono font-bold text-xs sm:text-sm text-snow-white border transition-all cursor-pointer focus:outline-none focus:ring-2 ${
          selectedValue !== null
            ? 'border-steel-blue bg-steel-blue/20 text-steel-blue focus:ring-steel-blue/50'
            : 'border-gunmetal hover:border-slate-500 focus:border-steel-blue focus:ring-steel-blue/30'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <option value="" className="bg-dark-slate text-cool-gray">
          —
        </option>
        {allNumbers.map((num) => {
          const isTakenByOther = takenByOthers.has(num);
          if (isTakenByOther) {
            return null; // Hide number from dropdown options of other lines
          }
          return (
            <option key={num} value={num} className="bg-dark-slate text-snow-white font-mono">
              Line {num}
            </option>
          );
        })}
      </select>
    </div>
  );
};
