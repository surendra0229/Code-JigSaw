import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Code2, Shield, Clock, Trophy, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { PageContainer } from '../components/PageContainer';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageContainer maxWidth="xl" className="flex flex-col justify-center py-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-green/10 border border-emerald-green/30 text-emerald-green text-xs font-mono font-semibold tracking-wide">
          <Zap className="w-3.5 h-3.5" />
          <span>ENGINEERING DAY CODING PUZZLE</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-snow-white">
          CODE JIGSAW
        </h1>

        <p className="text-xl sm:text-2xl font-mono font-bold text-emerald-green">
          Rebuild. Think. Code.
        </p>

        <p className="text-base sm:text-lg text-cool-gray leading-relaxed max-w-2xl mx-auto">
          Reconstruct scrambled lines of source code, beat the global clock, and prove your algorithmic syntax mastery on the leaderboard.
        </p>

        {/* Primary CTA */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/setup')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-green hover:bg-emerald-600 text-jet-black font-bold text-lg transition-all focus:outline-none focus:ring-4 focus:ring-emerald-green/40 flex items-center justify-center gap-3 shadow-xl cursor-pointer group"
          >
            <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
            <span>PLAY NOW</span>
          </button>

          <Link
            to="/leaderboard"
            className="w-full sm:w-auto px-6 py-4 rounded-xl bg-dark-slate hover:bg-dark-slate/80 text-snow-white font-semibold text-base border border-gunmetal transition-all flex items-center justify-center gap-2"
          >
            <Trophy className="w-5 h-5 text-gold" />
            <span>View Leaderboard</span>
          </Link>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        <div className="p-4 rounded-xl bg-dark-slate border border-gunmetal text-center space-y-1">
          <Code2 className="w-6 h-6 text-steel-blue mx-auto mb-2" />
          <div className="text-xl font-bold font-mono text-snow-white">8 Languages</div>
          <div className="text-xs text-cool-gray">C, Python, C++, Java, JS, C#, PHP, TS</div>
        </div>

        <div className="p-4 rounded-xl bg-dark-slate border border-gunmetal text-center space-y-1">
          <Shield className="w-6 h-6 text-emerald-green mx-auto mb-2" />
          <div className="text-xl font-bold font-mono text-snow-white">3 Difficulties</div>
          <div className="text-xs text-cool-gray">Easy, Moderate, Hard</div>
        </div>

        <div className="p-4 rounded-xl bg-dark-slate border border-gunmetal text-center space-y-1">
          <CheckCircle2 className="w-6 h-6 text-amber mx-auto mb-2" />
          <div className="text-xl font-bold font-mono text-snow-white">5 Questions</div>
          <div className="text-xs text-cool-gray">Progressive line count & complexity</div>
        </div>

        <div className="p-4 rounded-xl bg-dark-slate border border-gunmetal text-center space-y-1">
          <Clock className="w-6 h-6 text-crimson-red mx-auto mb-2" />
          <div className="text-xl font-bold font-mono text-snow-white">Timed Challenge</div>
          <div className="text-xs text-cool-gray">Server-validated countdown</div>
        </div>
      </div>
    </PageContainer>
  );
};
