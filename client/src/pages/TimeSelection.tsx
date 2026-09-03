import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { PageContainer } from '../components/PageContainer';
import { useGame } from '../context/GameContext';

export const TimeSelection: React.FC = () => {
  const navigate = useNavigate();
  const { difficulty, selectedTime, setSelectedTime } = useGame();

  // Get allowed times based on selected difficulty
  const timeOptionsMap: Record<string, number[]> = {
    easy: [1, 2, 3, 4, 5],
    moderate: [1, 2, 3, 4, 5, 6],
    hard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  };

  const allowedMinutes = timeOptionsMap[difficulty] || timeOptionsMap.easy;

  const handleSelectMinutes = (mins: number) => {
    setSelectedTime(mins * 60);
  };

  const currentMinutes = Math.round(selectedTime / 60) || allowedMinutes[allowedMinutes.length - 1];

  return (
    <PageContainer maxWidth="md" className="py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gunmetal pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-crimson-red font-semibold mb-1">
            <span>STEP 3 OF 3</span>
          </div>
          <h2 className="text-2xl font-bold text-snow-white">Total Game Timer Selection</h2>
          <p className="text-xs text-cool-gray">
            Selected timer applies to ALL 5 questions combined for <span className="capitalize text-snow-white font-bold">{difficulty}</span> mode.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/select-difficulty')}
            className="px-4 py-2 rounded-xl bg-dark-slate hover:bg-dark-slate/80 text-cool-gray hover:text-snow-white text-xs border border-gunmetal flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            onClick={() => navigate('/instructions')}
            className="px-6 py-2.5 rounded-xl bg-emerald-green hover:bg-emerald-600 text-jet-black font-bold text-xs transition-all flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span>Review Instructions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="bg-dark-slate p-6 rounded-2xl border border-gunmetal space-y-6">
        <div className="flex items-center gap-3 text-amber font-mono text-sm font-semibold bg-amber/10 p-3.5 rounded-xl border border-amber/20">
          <Clock className="w-5 h-5 shrink-0" />
          <p>
            Note: Faster answers yield speed bonus multipliers, but time expires across the entire session!
          </p>
        </div>

        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-cool-gray mb-3">
            Choose Total Duration:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {allowedMinutes.map((mins) => {
              const isSelected = currentMinutes === mins;
              return (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleSelectMinutes(mins)}
                  className={`relative p-4 rounded-xl font-mono text-center border transition-all cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-amber/10 border-amber text-amber ring-2 ring-amber/20 font-bold'
                      : 'bg-jet-black border-gunmetal text-snow-white hover:border-slate-500'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber text-jet-black flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                  <span className="text-xl font-bold">{mins}</span>
                  <span className="text-[10px] uppercase text-cool-gray">{mins === 1 ? 'Minute' : 'Minutes'}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
