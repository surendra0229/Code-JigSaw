import React from 'react';
import { Trash2, Code2, AlertCircle } from 'lucide-react';
import { CodeLine } from './CodeLine';
import { CodeLineItem } from '../types/game';

interface CodeEditorProps {
  lines: CodeLineItem[];
  selections: Record<string, number | null>;
  onSelectionChange: (lineId: string, value: number | null) => void;
  onDiscardAll: () => void;
  disabled?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  lines,
  selections,
  onSelectionChange,
  onDiscardAll,
  disabled = false
}) => {
  // Check if at least one selection exists for Discard All button visibility
  const hasSelections = Object.values(selections).some(val => val !== null && val !== undefined);
  const usedNumbersMap: Record<string, number> = {};
  Object.entries(selections).forEach(([id, val]) => {
    if (val !== null) usedNumbersMap[id] = val;
  });

  return (
    <div className="rounded-xl border border-gunmetal bg-jet-black overflow-hidden shadow-2xl">
      {/* Editor Header Bar */}
      <div className="bg-dark-slate/90 px-4 py-3 border-b border-gunmetal flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <div className="w-3 h-3 rounded-full bg-crimson-red/80" />
            <div className="w-3 h-3 rounded-full bg-amber/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-green/80" />
          </div>
          <Code2 className="w-4 h-4 text-steel-blue" />
          <span className="text-xs font-mono text-cool-gray font-medium">Scrambled Code Editor</span>
        </div>

        {/* Discard All Button */}
        {hasSelections && !disabled && (
          <button
            type="button"
            onClick={onDiscardAll}
            className="flex items-center gap-1.5 text-xs font-mono text-crimson-red hover:text-red-300 bg-crimson-red/10 hover:bg-crimson-red/20 px-2.5 py-1 rounded border border-crimson-red/30 transition-all focus:outline-none focus:ring-2 focus:ring-crimson-red/50 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Discard All</span>
          </button>
        )}
      </div>

      {/* Code Lines List */}
      <div className="p-3 sm:p-4 space-y-2.5 max-h-[550px] overflow-y-auto">
        {lines.map((line, idx) => (
          <CodeLine
            key={line.id}
            line={line}
            displayIndex={idx}
            totalLines={lines.length}
            selectedValue={selections[line.id] ?? null}
            usedNumbersMap={usedNumbersMap}
            onSelectionChange={onSelectionChange}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Editor Footer / Helper Note */}
      <div className="bg-dark-slate/50 px-4 py-2 border-t border-gunmetal/60 flex items-center justify-between text-[11px] font-mono text-cool-gray">
        <span>Total lines: {lines.length}</span>
        <span className="flex items-center gap-1 text-steel-blue">
          <AlertCircle className="w-3 h-3" /> Assign original 1..{lines.length} positions
        </span>
      </div>
    </div>
  );
};
