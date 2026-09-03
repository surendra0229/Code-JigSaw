import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Trophy, Award, Clock, RotateCcw, ArrowRight, CheckCircle2, XCircle, Code2, Zap } from 'lucide-react';
import { PageContainer } from '../components/PageContainer';
import { useGame } from '../context/GameContext';
import { gameApi } from '../services/gameApi';
import { GameState } from '../types/game';

export const ResultPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { resetSession } = useGame();

  const [state, setState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (gameId) {
      gameApi.getGameState(gameId)
        .then(res => setState(res))
        .catch(err => console.error('Failed to fetch game result:', err))
        .finally(() => setLoading(false));
    }
  }, [gameId]);

  if (loading || !state) {
    return (
      <PageContainer maxWidth="md" className="py-16 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-emerald-green border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-sm text-cool-gray">Calculating Final Session Score & Ranking...</p>
        </div>
      </PageContainer>
    );
  }

  const minutesUsed = Math.floor(state.timeRemaining ? (state.selectedTime - state.timeRemaining) / 60 : state.selectedTime / 60);
  const secondsUsed = (state.selectedTime - (state.timeRemaining || 0)) % 60;
  const formattedTimeUsed = `${String(minutesUsed).padStart(2, '0')}:${String(secondsUsed).padStart(2, '0')}`;

  const handlePlayAgain = () => {
    resetSession();
    navigate('/select-language');
  };

  return (
    <PageContainer maxWidth="lg" className="py-8 space-y-6">
      <div className="bg-dark-slate border border-gunmetal rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8">
        
        {/* Banner Header */}
        <div className="text-center space-y-3 border-b border-gunmetal pb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-green/10 border border-emerald-green/30 text-emerald-green flex items-center justify-center mx-auto shadow-lg">
            <Trophy className="w-8 h-8 text-gold" />
          </div>

          <h1 className="text-3xl font-extrabold text-snow-white">CHALLENGE COMPLETED</h1>
          <p className="text-sm font-mono text-cool-gray">
            Match results for <span className="text-snow-white font-bold">{state.playerName}</span>
          </p>
        </div>

        {/* Big Score Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-graphite border border-gunmetal text-center space-y-1">
            <span className="text-xs font-mono text-cool-gray uppercase font-bold tracking-wider">Total Score</span>
            <div className="text-3xl font-extrabold font-mono text-emerald-green">
              {state.totalScore} <span className="text-xs font-normal text-cool-gray">pts</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-graphite border border-gunmetal text-center space-y-1">
            <span className="text-xs font-mono text-cool-gray uppercase font-bold tracking-wider">Correct Answers</span>
            <div className="text-3xl font-extrabold font-mono text-snow-white">
              {state.correctAnswers} / {state.totalQuestions}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-graphite border border-gunmetal text-center space-y-1">
            <span className="text-xs font-mono text-cool-gray uppercase font-bold tracking-wider">Time Allocated</span>
            <div className="text-3xl font-extrabold font-mono text-amber">
              {Math.round(state.selectedTime / 60)} mins
            </div>
          </div>
        </div>

        {/* Match Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-graphite p-4 rounded-xl border border-gunmetal font-mono text-xs">
          <div>
            <span className="text-cool-gray block text-[10px] uppercase">Language:</span>
            <span className="text-steel-blue font-bold uppercase">{state.language}</span>
          </div>
          <div>
            <span className="text-cool-gray block text-[10px] uppercase">Difficulty:</span>
            <span className="text-amber font-bold capitalize">{state.difficulty}</span>
          </div>
          <div>
            <span className="text-cool-gray block text-[10px] uppercase">Status:</span>
            <span className="text-emerald-green font-bold uppercase">{state.status}</span>
          </div>
          <div>
            <span className="text-cool-gray block text-[10px] uppercase">Session ID:</span>
            <span className="text-cool-gray truncate block">{state.gameId.slice(-8)}</span>
          </div>
        </div>

        {/* Question Breakdown History */}
        <div className="space-y-3 font-mono text-xs">
          <h3 className="text-sm font-bold text-snow-white uppercase tracking-wider font-sans">
            Question Performance Breakdown:
          </h3>
          <div className="space-y-2">
            {state.questionHistory.map((q, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-jet-black border border-gunmetal">
                <div className="flex items-center gap-3">
                  {q.correct ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-green shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-crimson-red shrink-0" />
                  )}
                  <span className="text-snow-white font-semibold">Question {idx + 1}</span>
                  <span className="text-cool-gray text-[11px]">({q.attempts} {q.attempts === 1 ? 'attempt' : 'attempts'})</span>
                </div>

                <div className="font-bold text-emerald-green">
                  {q.correct ? `+${q.score} pts` : '0 pts'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="pt-4 border-t border-gunmetal flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={handlePlayAgain}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-dark-slate hover:bg-dark-slate/80 text-snow-white font-bold text-sm border border-gunmetal transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <Link
            to={`/leaderboard?gameId=${state.gameId}`}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-green hover:bg-emerald-600 text-jet-black font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span>View Global Leaderboard</span>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
};
