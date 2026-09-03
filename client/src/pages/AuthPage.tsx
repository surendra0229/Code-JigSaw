import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Code2,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';
import { PageContainer } from '../components/PageContainer';
import { useGame } from '../context/GameContext';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginPlayer, registerPlayer, player } = useGame();

  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form inputs
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Password visibility toggles
  const [showLoginPass, setShowLoginPass] = useState<boolean>(false);
  const [showRegPass, setShowRegPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (player) {
      navigate('/select-language');
    }
  }, [player, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await loginPlayer({ email: email.trim(), password });
      navigate('/select-language');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await registerPlayer({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        confirmPassword
      });
      navigate('/select-language');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (newMode: 'login' | 'register') => {
    setError(null);
    setMode(newMode);
  };

  return (
    <PageContainer maxWidth="xl" className="py-6 sm:py-12 flex flex-col justify-center min-h-[calc(100vh-5rem)]">
      {/* 3D BOOK-OPENING PERSPECTIVE CONTAINER */}
      <div className="w-full max-w-5xl mx-auto [perspective:1400px]">
        <div
          className={`w-full relative transition-all duration-700 [transform-style:preserve-3d] ${
            mode === 'register' ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
          }`}
        >
          {/* FRONT SIDE (LOGIN VIEW) */}
          <div className="[backface-visibility:hidden] w-full bg-dark-slate border border-gunmetal rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 font-mono">
            {/* Left: Login Form */}
            <div className="p-6 sm:p-10 space-y-6 flex flex-col justify-between bg-dark-slate">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-green/10 text-emerald-green flex items-center justify-center border border-emerald-green/30">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-snow-white">WELCOME BACK</h2>
                    <p className="text-xs text-cool-gray font-sans">Log in to your competitor profile</p>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-crimson-red/10 border border-crimson-red/30 rounded-xl text-xs text-crimson-red flex items-center gap-2 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-cool-gray text-[11px] uppercase font-bold mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-cool-gray absolute left-3 top-3.5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        required
                        className="w-full pl-9 pr-4 py-3 rounded-xl bg-jet-black border border-gunmetal text-snow-white focus:outline-none focus:border-emerald-green transition-colors text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-cool-gray text-[11px] uppercase font-bold mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-cool-gray absolute left-3 top-3.5" />
                      <input
                        type={showLoginPass ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-9 pr-10 py-3 rounded-xl bg-jet-black border border-gunmetal text-snow-white focus:outline-none focus:border-emerald-green transition-colors text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPass(!showLoginPass)}
                        aria-label="Toggle password visibility"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-cool-gray hover:text-snow-white focus:outline-none"
                      >
                        {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-emerald-green hover:bg-emerald-600 text-jet-black font-bold text-xs transition-all focus:outline-none focus:ring-4 focus:ring-emerald-green/40 flex items-center justify-center gap-2 cursor-pointer shadow-xl disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-jet-black border-t-transparent rounded-full animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span>LOG IN TO COMPETITION</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="pt-4 border-t border-gunmetal text-center font-sans space-y-1">
                <p className="text-xs text-cool-gray">
                  New competitor?{' '}
                  <button
                    type="button"
                    onClick={() => toggleMode('register')}
                    className="text-emerald-green hover:underline font-bold cursor-pointer transition-colors"
                  >
                    Create an account
                  </button>
                </p>
                <p className="text-[11px] text-cool-gray">
                  Competition Admin?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/admin/login')}
                    className="text-amber hover:underline font-bold cursor-pointer transition-colors"
                  >
                    Go to Admin Login
                  </button>
                </p>
              </div>
            </div>

            {/* Right: Competition Info Panel */}
            <div className="p-6 sm:p-10 bg-graphite border-t md:border-t-0 md:border-l border-gunmetal flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber/10 border border-amber/30 text-amber text-xs font-bold uppercase">
                  <Trophy className="w-3.5 h-3.5" /> Engineering Day Challenge
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-snow-white tracking-tight font-sans">
                    The code is scrambled.<br />Your logic isn't.
                  </h3>
                  <p className="text-xs text-cool-gray font-sans leading-relaxed">
                    Code Jigsaw is a timed programming puzzle platform. Reconstruct scrambled code lines, trace variable execution, and claim your place on the global hall of fame.
                  </p>
                </div>

                <div className="space-y-3 text-xs font-sans">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-dark-slate border border-gunmetal">
                    <CheckCircle2 className="w-4 h-4 text-emerald-green shrink-0 mt-0.5" />
                    <span>Permanent player identity bound to all match results.</span>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-dark-slate border border-gunmetal">
                    <CheckCircle2 className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                    <span>Real-time variable trace simulation for Python & JavaScript.</span>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-dark-slate border border-gunmetal">
                    <CheckCircle2 className="w-4 h-4 text-coral shrink-0 mt-0.5" />
                    <span>Deterministic 6-tier leaderboard sorting algorithm.</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-cool-gray border-t border-gunmetal pt-3 text-right">
                Code Jigsaw v2.5 • Verified Engineering Platform
              </div>
            </div>
          </div>

          {/* BACK SIDE (REGISTER VIEW — ROTATED 180 DEG) */}
          <div className="[backface-visibility:hidden] [transform:rotateY(180deg)] absolute top-0 left-0 w-full h-full bg-dark-slate border border-gunmetal rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 font-mono">
            {/* Left: Competition Info Panel */}
            <div className="p-6 sm:p-10 bg-graphite border-b md:border-b-0 md:border-r border-gunmetal flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-green/10 border border-emerald-green/30 text-emerald-green text-xs font-bold uppercase">
                  <Zap className="w-3.5 h-3.5" /> Join the Competition
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-snow-white tracking-tight font-sans">
                    Think like a programmer.<br />Solve like a competitor.
                  </h3>
                  <p className="text-xs text-cool-gray font-sans leading-relaxed">
                    Register once to create your permanent player name. Build your reputation and climb the Engineering Day leaderboard!
                  </p>
                </div>

                <div className="space-y-3 text-xs font-sans">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-dark-slate border border-gunmetal">
                    <ShieldCheck className="w-4 h-4 text-emerald-green shrink-0 mt-0.5" />
                    <span>Permanent player identity protected against unauthorized modification.</span>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-dark-slate border border-gunmetal">
                    <CheckCircle2 className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                    <span>Instant access to Easy, Moderate, and Hard challenge tiers.</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-cool-gray border-t border-gunmetal pt-3">
                Secure Account Protection
              </div>
            </div>

            {/* Right: Registration Form */}
            <div className="p-6 sm:p-10 space-y-6 flex flex-col justify-between bg-dark-slate">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-green/10 text-emerald-green flex items-center justify-center border border-emerald-green/30">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-snow-white">CREATE ACCOUNT</h2>
                    <p className="text-xs text-cool-gray font-sans">Register your permanent competitor identity</p>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-crimson-red/10 border border-crimson-red/30 rounded-xl text-xs text-crimson-red flex items-center gap-2 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-cool-gray text-[10px] uppercase font-bold mb-1">
                      Your name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-cool-gray absolute left-3 top-3" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your Name"
                        required
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-jet-black border border-gunmetal text-snow-white focus:outline-none focus:border-emerald-green transition-colors text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-cool-gray text-[10px] uppercase font-bold mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-cool-gray absolute left-3 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        required
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-jet-black border border-gunmetal text-snow-white focus:outline-none focus:border-emerald-green transition-colors text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-cool-gray text-[10px] uppercase font-bold mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-cool-gray absolute left-3 top-3" />
                        <input
                          type={showRegPass ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-jet-black border border-gunmetal text-snow-white focus:outline-none focus:border-emerald-green transition-colors text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPass(!showRegPass)}
                          aria-label="Toggle password visibility"
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-cool-gray hover:text-snow-white focus:outline-none"
                        >
                          {showRegPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-cool-gray text-[10px] uppercase font-bold mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-cool-gray absolute left-3 top-3" />
                        <input
                          type={showConfirmPass ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-jet-black border border-gunmetal text-snow-white focus:outline-none focus:border-emerald-green transition-colors text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          aria-label="Toggle confirm password visibility"
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-cool-gray hover:text-snow-white focus:outline-none"
                        >
                          {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-emerald-green hover:bg-emerald-600 text-jet-black font-bold text-xs transition-all focus:outline-none focus:ring-4 focus:ring-emerald-green/40 flex items-center justify-center gap-2 cursor-pointer shadow-xl disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-jet-black border-t-transparent rounded-full animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>CREATE COMPETITOR ACCOUNT</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="pt-3 border-t border-gunmetal text-center font-sans">
                <p className="text-xs text-cool-gray">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => toggleMode('login')}
                    className="text-emerald-green hover:underline font-bold cursor-pointer transition-colors"
                  >
                    Log in here
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
