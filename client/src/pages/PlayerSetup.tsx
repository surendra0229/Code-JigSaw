import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { PageContainer } from '../components/PageContainer';
import { useGame } from '../context/GameContext';

export const PlayerSetup: React.FC = () => {
  const navigate = useNavigate();
  const { player, playerName } = useGame();
  const [inputName, setInputName] = useState<string>(playerName);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (player) {
      navigate('/select-language');
      return;
    }

    const clean = inputName.trim();
    if (!clean) {
      setErrorMsg('Please enter a display name or log in to your account.');
      return;
    }
    if (clean.length < 2) {
      setErrorMsg('Name must be at least 2 characters.');
      return;
    }
    if (clean.length > 30) {
      setErrorMsg('Name cannot exceed 30 characters.');
      return;
    }

    localStorage.setItem('cj_player_name', clean);
    navigate('/select-language');
  };

  return (
    <PageContainer maxWidth="md" className="py-12">
      <div className="bg-dark-slate border border-gunmetal rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-gunmetal pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-green/10 border border-emerald-green/30 text-emerald-green flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-snow-white">Player Identification</h2>
              <p className="text-xs text-cool-gray">Your permanent competitor identity for match records</p>
            </div>
          </div>

          {!player && (
            <Link
              to="/auth"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-green/10 hover:bg-emerald-green/20 text-emerald-green border border-emerald-green/30 text-xs font-mono font-bold transition-colors"
            >
              Log In / Register
            </Link>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 font-mono">
          {player ? (
            /* Permanent Read-Only Identity View for Authenticated Competitors */
            <div className="space-y-3">
              <label className="block text-xs uppercase font-bold tracking-wider text-cool-gray">
                Permanent Player Name
              </label>

              <div className="p-4 rounded-xl bg-jet-black border border-emerald-green/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-green/20 text-emerald-green flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-base font-bold text-snow-white block">{player.playerName}</span>
                    <span className="text-xs text-cool-gray font-sans">{player.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-emerald-green bg-emerald-green/10 px-2.5 py-1 rounded border border-emerald-green/30 font-bold uppercase">
                  <Lock className="w-3.5 h-3.5" /> Permanent
                </div>
              </div>

              <p className="text-[11px] text-cool-gray font-sans">
                Your account identity is bound to all match submissions and global leaderboard rankings.
              </p>
            </div>
          ) : (
            /* Unauthenticated Handle Input View */
            <div className="space-y-3">
              <label htmlFor="playerName" className="block text-xs font-bold uppercase tracking-wider text-cool-gray">
                Guest Handle / Display Name <span className="text-crimson-red">*</span>
              </label>

              <input
                id="playerName"
                type="text"
                value={inputName}
                onChange={(e) => {
                  setInputName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Your Name"
                maxLength={30}
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-jet-black border border-gunmetal text-snow-white text-base focus:outline-none focus:border-emerald-green transition-all"
              />

              {errorMsg && (
                <p className="text-xs text-crimson-red flex items-center gap-1">
                  ⚠️ {errorMsg}
                </p>
              )}

              <div className="bg-graphite p-3.5 rounded-xl border border-gunmetal flex items-start gap-3 text-xs text-cool-gray font-sans">
                <ShieldCheck className="w-4 h-4 text-emerald-green shrink-0 mt-0.5" />
                <p>
                  Tip: Register an account to lock in your permanent player name across device sessions!
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-green hover:bg-emerald-600 text-jet-black font-bold text-sm transition-all focus:outline-none focus:ring-4 focus:ring-emerald-green/40 flex items-center justify-center gap-2 cursor-pointer shadow-xl"
            >
              <span>Continue to Language Selection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
};
