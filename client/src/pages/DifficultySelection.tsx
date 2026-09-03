import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, ArrowLeft } from 'lucide-react';
import { PageContainer } from '../components/PageContainer';
import { DifficultyCard } from '../components/DifficultyCard';
import { useGame } from '../context/GameContext';
import { DifficultyLevel } from '../types/game';

export const DifficultySelection: React.FC = () => {
  const navigate = useNavigate();
  const { difficulty, setDifficulty } = useGame();

  const handleNext = () => {
    navigate('/select-time');
  };

  return (
    <PageContainer maxWidth="lg" className="py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gunmetal pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber font-semibold mb-1">
            <span>STEP 2 OF 3</span>
          </div>
          <h2 className="text-2xl font-bold text-snow-white">Select Challenge Difficulty</h2>
          <p className="text-xs text-cool-gray">Determines code length, structural complexity, and question progression</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/select-language')}
            className="px-4 py-2 rounded-xl bg-dark-slate hover:bg-dark-slate/80 text-cool-gray hover:text-snow-white text-xs border border-gunmetal flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-emerald-green hover:bg-emerald-600 text-jet-black font-bold text-xs transition-all flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span>Next: Time Selection</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DifficultyCard
          level="easy"
          title="Easy Level"
          description="Basic variables, simple arithmetic, and straightforward conditionals (4-6 lines)."
          timeRange="1 to 5 Minutes"
          selected={difficulty === 'easy'}
          onSelect={(lvl) => setDifficulty(lvl)}
        />

        <DifficultyCard
          level="moderate"
          title="Moderate Level"
          description="Loops, functions, arrays, and multi-step conditional logic (6-9 lines)."
          timeRange="1 to 6 Minutes"
          selected={difficulty === 'moderate'}
          onSelect={(lvl) => setDifficulty(lvl)}
        />

        <DifficultyCard
          level="hard"
          title="Hard Level"
          description="Nested algorithms, complex data manipulation, recursion, and object modeling (8-14 lines)."
          timeRange="1 to 10 Minutes"
          selected={difficulty === 'hard'}
          onSelect={(lvl) => setDifficulty(lvl)}
        />
      </div>
    </PageContainer>
  );
};
