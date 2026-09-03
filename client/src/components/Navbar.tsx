import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Code2, Trophy, User, ShieldCheck, LogOut, LogIn, UserCheck } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Timer } from './Timer';
import { ProfileModal } from './ProfileModal';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { gameState, player, playerName, admin, logoutPlayer, logoutAdmin } = useGame();
  const location = useLocation();
  const isGamePage = location.pathname.startsWith('/game');
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  const handleLogout = () => {
    if (admin) {
      logoutAdmin();
      navigate('/admin/login');
    } else {
      logoutPlayer();
      navigate('/auth');
    }
  };

  return (
    <>
      <header className="bg-dark-slate/90 backdrop-blur-md border-b border-gunmetal sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-emerald-green rounded-md px-1 py-1">
            <div className="w-10 h-10 rounded-lg bg-emerald-green/10 border border-emerald-green/30 flex items-center justify-center text-emerald-green group-hover:scale-105 transition-transform">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-snow-white">CODE JIGSAW</span>
                <span className="text-[10px] uppercase font-mono tracking-widest bg-emerald-green/20 text-emerald-green px-1.5 py-0.5 rounded border border-emerald-green/30 font-semibold">
                  EVENT
                </span>
              </div>
              <p className="text-[11px] text-cool-gray hidden sm:block">Rebuild. Think. Code.</p>
            </div>
          </Link>

          {/* Center / Game Info Header */}
          {isGamePage && gameState && !gameState.completed && (
            <div className="hidden md:flex items-center gap-6 bg-graphite/80 px-4 py-1.5 rounded-lg border border-gunmetal">
              <div className="text-xs font-mono text-cool-gray">
                Question <span className="text-snow-white font-bold">{gameState.currentQuestionIndex + 1}</span> / {gameState.totalQuestions}
              </div>
              <div className="h-4 w-px bg-gunmetal" />
              <div className="text-xs font-mono capitalize">
                <span className="text-cool-gray">Difficulty: </span>
                <span className={
                  gameState.difficulty === 'hard' ? 'text-ruby-red font-semibold' :
                  gameState.difficulty === 'moderate' ? 'text-golden-yellow font-semibold' :
                  'text-emerald-green font-semibold'
                }>
                  {gameState.difficulty}
                </span>
              </div>
              <div className="h-4 w-px bg-gunmetal" />
              <Timer />
            </div>
          )}

          {/* Right Navigation */}
          <div className="flex items-center gap-3 font-mono">
            {admin ? (
              /* ADMIN NAVBAR VIEW */
              <div className="flex items-center gap-2">
                <Link
                  to="/admin/dashboard"
                  className="hidden sm:flex items-center gap-2 text-xs bg-amber/10 text-amber border border-amber/30 px-3 py-1.5 rounded-lg font-bold"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin</span>
                </Link>

                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-1.5 text-xs text-snow-white hover:text-amber bg-graphite hover:bg-dark-slate px-3 py-1.5 rounded-lg border border-gunmetal transition-colors cursor-pointer"
                  title="Admin Profile"
                >
                  <UserCheck className="w-3.5 h-3.5 text-amber" />
                  <span className="hidden sm:inline">Profile</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs text-cool-gray hover:text-crimson-red bg-graphite hover:bg-dark-slate px-3 py-1.5 rounded-lg border border-gunmetal transition-colors cursor-pointer"
                  title="Logout Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : player ? (
              /* PLAYER NAVBAR VIEW */
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 text-xs bg-graphite px-3 py-1.5 rounded-lg border border-gunmetal text-cool-gray">
                  <User className="w-3.5 h-3.5 text-emerald-green" />
                  <span className="text-snow-white font-bold">{player.playerName}</span>
                </div>

                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-1.5 text-xs text-snow-white hover:text-emerald-green bg-graphite hover:bg-dark-slate px-3 py-1.5 rounded-lg border border-gunmetal transition-colors cursor-pointer"
                  title="Player Profile"
                >
                  <User className="w-3.5 h-3.5 text-emerald-green" />
                  <span className="hidden sm:inline">Profile</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs text-cool-gray hover:text-crimson-red bg-graphite hover:bg-dark-slate px-3 py-1.5 rounded-lg border border-gunmetal transition-colors cursor-pointer"
                  title="Logout Player"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              /* GUEST NAVBAR VIEW */
              <div className="flex items-center gap-2">
                <Link
                  to="/auth"
                  className="flex items-center gap-1.5 text-xs font-medium text-emerald-green hover:text-emerald-300 bg-emerald-green/10 hover:bg-emerald-green/20 px-3 py-2 rounded-lg border border-emerald-green/30 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Log In / Register</span>
                </Link>
              </div>
            )}

            <Link
              to="/leaderboard"
              className="flex items-center gap-2 text-xs font-medium text-cool-gray hover:text-snow-white bg-graphite hover:bg-dark-slate px-3 py-2 rounded-lg border border-gunmetal transition-colors"
            >
              <Trophy className="w-4 h-4 text-gold" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </>
  );
};
