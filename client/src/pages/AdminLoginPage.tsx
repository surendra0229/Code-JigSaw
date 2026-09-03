import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, UserCheck, AlertCircle, ArrowLeft, Eye, EyeOff, KeyRound, Sparkles } from 'lucide-react';
import { PageContainer } from '../components/PageContainer';
import { loginAdmin } from '../services/gameApi';
import { useGame } from '../context/GameContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAdminUser } = useGame();

  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please enter both Email/User ID and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await loginAdmin(identifier.trim(), password);
      setAdminUser(res.admin, res.token);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid Admin credentials. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center relative overflow-hidden bg-[#07090e] py-10 px-4 sm:px-6">
      {/* Handcrafted Ambient Glowing Backdrop Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[90px] pointer-events-none" />

      <PageContainer maxWidth="sm" className="w-full relative z-10">
        {/* Main Card Container with Handcrafted Obsidian Glass & Glowing Border */}
        <div className="bg-[#0f1420]/85 backdrop-blur-2xl border border-violet-500/20 rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_-10px_rgba(139,92,246,0.15)] space-y-7">
          
          {/* Header Bar */}
          <div className="flex items-start justify-between pb-5 border-b border-slate-800/80">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 text-[11px] font-semibold font-mono tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Restricted Portal</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-sans flex items-center gap-2.5">
                  Admin Vault <KeyRound className="w-5 h-5 text-amber-400 shrink-0" />
                </h1>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Engineering Day competition management portal
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-700/60 text-xs transition-all duration-200 hover:scale-105 active:scale-95 shadow-md shrink-0 cursor-pointer"
              title="Return to Game Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 font-mono flex items-center gap-3 animate-fadeIn shadow-lg">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5 font-mono text-xs">
            <div>
              <label className="block text-slate-300 text-[11px] uppercase font-bold tracking-wider mb-2 font-sans flex items-center justify-between">
                <span>Email or User ID</span>
                <span className="text-violet-400/70 text-[10px] font-normal font-mono">Required</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-400 transition-colors">
                  <UserCheck className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Email or User ID"
                  required
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#090d16] border border-slate-800 text-slate-100 placeholder-slate-500/70 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 transition-all text-xs font-mono shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-[11px] uppercase font-bold tracking-wider mb-2 font-sans flex items-center justify-between">
                <span>Password</span>
                <span className="text-violet-400/70 text-[10px] font-normal font-mono">Required</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-400 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3.5 rounded-2xl bg-[#090d16] border border-slate-800 text-slate-100 placeholder-slate-500/70 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 transition-all text-xs font-mono shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-100 focus:outline-none transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-violet-500/30 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_25px_-4px_rgba(139,92,246,0.45)] hover:shadow-[0_6px_30px_-2px_rgba(139,92,246,0.6)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating Admin...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Log In to Admin Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Note */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-sans text-slate-400">
            <span className="flex items-center gap-1.5 text-amber-400/90 font-medium">
              <Sparkles className="w-3.5 h-3.5" /> High-security session
            </span>
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="text-slate-400 hover:text-violet-300 transition-colors underline cursor-pointer"
            >
              Player Registration
            </button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};
