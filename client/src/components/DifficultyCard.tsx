import React from 'react';
import { Shield, Zap, Flame, Check } from 'lucide-react';
import { DifficultyLevel } from '../types/game';

interface DifficultyCardProps {
  level: DifficultyLevel;
  title: string;
  description: string;
  timeRange: string;
  selected: boolean;
  onSelect: (level: DifficultyLevel) => void;
}

export const DifficultyCard: React.FC<DifficultyCardProps> = ({
  level,
  title,
  description,
  timeRange,
  selected,
  onSelect
}) => {
  const configs = {
    easy: {
      color: 'emerald-green',
      icon: Shield,
      badgeBg: 'bg-emerald-green/10',
      badgeText: 'text-emerald-green',
      borderColor: selected ? 'border-emerald-green ring-2 ring-emerald-green/20' : 'border-gunmetal hover:border-emerald-green/50',
      glow: 'shadow-emerald-green/10'
    },
    moderate: {
      color: 'amber',
      icon: Zap,
      badgeBg: 'bg-amber/10',
      badgeText: 'text-amber',
      borderColor: selected ? 'border-amber ring-2 ring-amber/20' : 'border-gunmetal hover:border-amber/50',
      glow: 'shadow-amber/10'
    },
    hard: {
      color: 'crimson-red',
      icon: Flame,
      badgeBg: 'bg-crimson-red/10',
      badgeText: 'text-crimson-red',
      borderColor: selected ? 'border-crimson-red ring-2 ring-crimson-red/20' : 'border-gunmetal hover:border-crimson-red/50',
      glow: 'shadow-crimson-red/10'
    }
  };

  const config = configs[level];
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(level)}
      className={`relative w-full text-left p-5 rounded-xl bg-dark-slate border transition-all duration-200 focus:outline-none cursor-pointer flex flex-col justify-between ${config.borderColor} ${selected ? 'bg-dark-slate/90 shadow-lg' : 'hover:bg-dark-slate/80'}`}
    >
      {selected && (
        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-emerald-green text-jet-black flex items-center justify-center">
          <Check className="w-4 h-4 stroke-[3]" />
        </div>
      )}

      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-lg ${config.badgeBg} flex items-center justify-center ${config.badgeText}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-snow-white uppercase tracking-wider">{title}</h3>
            <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded ${config.badgeBg} ${config.badgeText}`}>
              {level}
            </span>
          </div>
        </div>

        <p className="text-xs text-cool-gray leading-relaxed mb-4">{description}</p>
      </div>

      <div className="pt-3 border-t border-gunmetal flex items-center justify-between text-[11px] font-mono text-cool-gray">
        <span>Available Total Time:</span>
        <span className="text-snow-white font-semibold">{timeRange}</span>
      </div>
    </button>
  );
};
