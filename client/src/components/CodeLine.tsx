import React from 'react';
import { LineNumberDropdown } from './LineNumberDropdown';
import { CodeLineItem } from '../types/game';

interface CodeLineProps {
  line: CodeLineItem;
  displayIndex: number;
  totalLines: number;
  selectedValue: number | null;
  usedNumbersMap: Record<string, number>;
  onSelectionChange: (lineId: string, value: number | null) => void;
  disabled?: boolean;
  highlightState?: 'correct' | 'incorrect' | 'neutral';
  highlightNumber?: number;
}

export const CodeLine: React.FC<CodeLineProps> = ({
  line,
  displayIndex,
  totalLines,
  selectedValue,
  usedNumbersMap,
  onSelectionChange,
  disabled = false,
  highlightState = 'neutral',
  highlightNumber
}) => {
  let borderClass = 'border-gunmetal/60';
  let bgClass = 'bg-charcoal-gray/80';

  if (highlightState === 'correct') {
    borderClass = 'border-emerald-green/60';
    bgClass = 'bg-emerald-green/10';
  } else if (highlightState === 'incorrect') {
    borderClass = 'border-crimson-red/60';
    bgClass = 'bg-crimson-red/10';
  } else if (selectedValue !== null) {
    borderClass = 'border-steel-blue/40';
    bgClass = 'bg-charcoal-gray';
  }

  return (
    <div
      className={`group flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg border transition-all duration-150 min-w-0 ${bgClass} ${borderClass} hover:border-gunmetal`}
    >
      {/* Dropdown position selector */}
      <LineNumberDropdown
        lineId={line.id}
        totalLines={totalLines}
        selectedValue={selectedValue}
        usedNumbersMap={usedNumbersMap}
        onChange={onSelectionChange}
        disabled={disabled}
      />

      {/* Shuffled Code Content */}
      <div className="flex-1 overflow-x-auto font-mono text-xs sm:text-sm text-snow-white whitespace-pre select-text py-1">
        {line.code}
      </div>

      {/* Display line tag if feedback mode active */}
      {highlightNumber !== undefined && (
        <div className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
          highlightState === 'correct' ? 'bg-emerald-green/20 text-emerald-green' : 'bg-crimson-red/20 text-crimson-red'
        }`}>
          Position {highlightNumber}
        </div>
      )}
    </div>
  );
};
