import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, HelpCircle, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { PageContainer } from '../components/PageContainer';
import { useGame } from '../context/GameContext';

export const Instructions: React.FC = () => {
  const navigate = useNavigate();
  const { playerName, language, difficulty, selectedTime, startNewGame } = useGame();
  const [starting, setStarting] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  const handleStartGame = async () => {
    setStarting(true);
    setErr(null);
    try {
      const gameId = await startNewGame();
      navigate(`/game/${gameId}`);
    } catch (e: any) {
      setErr(e.message || 'Failed to start game session');
      setStarting(false);
    }
  };

  const minutes = Math.round(selectedTime / 60);

  return (
    <PageContainer maxWidth="lg" className="py-8 space-y-6">
      <div className="bg-dark-slate border border-gunmetal rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-gunmetal pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-green/10 border border-emerald-green/30 text-emerald-green flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-snow-white">Competition Rules & Instructions</h2>
              <p className="text-xs text-cool-gray">Understand the rules before starting your timed match</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/select-time')}
            className="px-3.5 py-1.5 rounded-lg bg-graphite hover:bg-dark-slate text-cool-gray text-xs border border-gunmetal flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        {/* Selected Config Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-graphite p-4 rounded-xl border border-gunmetal font-mono text-xs">
          <div>
            <span className="text-cool-gray block text-[10px] uppercase">Player:</span>
            <span className="text-snow-white font-bold">{playerName || 'Anonymous'}</span>
          </div>
          <div>
            <span className="text-cool-gray block text-[10px] uppercase">Language:</span>
            <span className="text-steel-blue font-bold uppercase">{language}</span>
          </div>
          <div>
            <span className="text-cool-gray block text-[10px] uppercase">Difficulty:</span>
            <span className="text-amber font-bold uppercase">{difficulty}</span>
          </div>
          <div>
            <span className="text-cool-gray block text-[10px] uppercase">Total Timer:</span>
            <span className="text-emerald-green font-bold">{minutes} {minutes === 1 ? 'min' : 'mins'}</span>
          </div>
        </div>

        {/* Rules Grid */}
        <div className="space-y-3 font-mono text-xs">
          <h3 className="text-sm font-bold text-snow-white uppercase tracking-wider font-sans">
            How to Play:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-jet-black border border-gunmetal">
              <CheckCircle2 className="w-4 h-4 text-emerald-green shrink-0 mt-0.5" />
              <span>You will receive <strong>exactly 5 questions</strong> in your selected language.</span>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-jet-black border border-gunmetal">
              <CheckCircle2 className="w-4 h-4 text-emerald-green shrink-0 mt-0.5" />
              <span>Code lines are randomly <strong>shuffled</strong>. Assign original line numbers (1..N) via dropdowns.</span>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-jet-black border border-gunmetal">
              <CheckCircle2 className="w-4 h-4 text-emerald-green shrink-0 mt-0.5" />
              <span>Each line number can be assigned to <strong>only one line</strong>. Selecting a taken number updates other dropdowns automatically.</span>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-jet-black border border-gunmetal">
              <CheckCircle2 className="w-4 h-4 text-indigo shrink-0 mt-0.5" />
              <span>Use <strong>Simulation</strong> after submitting to inspect step-by-step variable execution trace.</span>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-jet-black border border-gunmetal">
              <CheckCircle2 className="w-4 h-4 text-amber shrink-0 mt-0.5" />
              <span>Click <strong>Submit Answer</strong> when all line numbers are assigned to verify your arrangement.</span>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-jet-black border border-gunmetal">
              <CheckCircle2 className="w-4 h-4 text-emerald-green shrink-0 mt-0.5" />
              <span>Correct submissions award points. <strong>Faster responses yield speed bonus points</strong>!</span>
            </div>
          </div>
        </div>

        {err && (
          <div className="p-3 bg-crimson-red/10 border border-crimson-red/30 rounded-xl text-xs text-crimson-red font-mono">
            ⚠️ {err}
          </div>
        )}

        {/* Big Start Button */}
        <div className="pt-4 border-t border-gunmetal flex justify-end">
          <button
            onClick={handleStartGame}
            disabled={starting}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-green hover:bg-emerald-600 text-jet-black font-bold text-base transition-all focus:outline-none focus:ring-4 focus:ring-emerald-green/40 flex items-center justify-center gap-3 shadow-xl cursor-pointer disabled:opacity-50"
          >
            {starting ? (
              <>
                <div className="w-5 h-5 border-2 border-jet-black border-t-transparent rounded-full animate-spin" />
                <span>Initializing Session...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>START GAME NOW</span>
              </>
            )}
          </button>
        </div>
      </div>
    </PageContainer>
  );
};
