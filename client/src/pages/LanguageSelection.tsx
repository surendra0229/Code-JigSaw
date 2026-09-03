import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, ArrowRight, ArrowLeft } from 'lucide-react';
import { PageContainer } from '../components/PageContainer';
import { LanguageCard } from '../components/LanguageCard';
import { LANGUAGES } from '../config/languages';
import { useGame } from '../context/GameContext';

export const LanguageSelection: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useGame();

  const handleNext = () => {
    if (!language) return;
    navigate('/select-difficulty');
  };

  return (
    <PageContainer maxWidth="xl" className="py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gunmetal pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-green font-semibold mb-1">
            <span>STEP 1 OF 3</span>
          </div>
          <h2 className="text-2xl font-bold text-snow-white">Select Programming Language</h2>
          <p className="text-xs text-cool-gray">Choose your preferred syntax for the 5 jigsaw questions</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/setup')}
            className="px-4 py-2 rounded-xl bg-dark-slate hover:bg-dark-slate/80 text-cool-gray hover:text-snow-white text-xs border border-gunmetal flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-emerald-green hover:bg-emerald-600 text-jet-black font-bold text-xs transition-all flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span>Next: Difficulty</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {LANGUAGES.map((lang) => (
          <LanguageCard
            key={lang.id}
            language={lang}
            selected={language === lang.id}
            onSelect={(id) => setLanguage(id)}
          />
        ))}
      </div>
    </PageContainer>
  );
};
