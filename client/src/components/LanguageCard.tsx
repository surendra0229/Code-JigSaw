import React from 'react';
import { Check, Code } from 'lucide-react';
import { LanguageMeta } from '../config/languages';

interface LanguageCardProps {
  language: LanguageMeta;
  selected: boolean;
  onSelect: (id: string) => void;
}

export const LanguageCard: React.FC<LanguageCardProps> = ({
  language,
  selected,
  onSelect
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(language.id)}
      className={`relative text-left p-4 rounded-xl bg-dark-slate border transition-all duration-200 focus:outline-none cursor-pointer flex flex-col justify-between ${
        selected
          ? `border-steel-blue ring-2 ring-steel-blue/30 bg-dark-slate/90 shadow-md`
          : 'border-gunmetal hover:border-slate-600 hover:bg-dark-slate/70'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center font-mono font-bold text-xs border"
            style={{
              backgroundColor: language.bgColor,
              color: language.accentHex,
              borderColor: `${language.accentHex}40`
            }}
          >
            {language.badge}
          </div>
          <div>
            <h4 className="text-sm font-bold text-snow-white">{language.name}</h4>
          </div>
        </div>

        {selected && (
          <div className="w-5 h-5 rounded-full bg-steel-blue text-white flex items-center justify-center">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        )}
      </div>

      <p className="text-[11px] text-cool-gray leading-tight mt-1">
        {language.tagline}
      </p>
    </button>
  );
};
