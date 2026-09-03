import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  Users,
  Trophy,
  HelpCircle,
  LogOut,
  X,
  Code,
  Globe2,
  User,
  Check
} from 'lucide-react';
import { PageContainer } from '../components/PageContainer';
import { gameApi } from '../services/gameApi';
import { AdminStats, AdminQuestion } from '../types/admin';
import { ProfileModal } from '../components/ProfileModal';
import { useGame } from '../context/GameContext';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { admin, logoutAdmin } = useGame();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState<boolean>(false);

  // Filter states
  const [search, setSearch] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedActive, setSelectedActive] = useState<string>('all');

  // Modal states
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<AdminQuestion | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<AdminQuestion | null>(null);

  // Question Form state (raw multiline canonical code support)
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDesc, setFormDesc] = useState<string>('');
  const [formLang, setFormLang] = useState<string>('python');
  const [formDiff, setFormDiff] = useState<'easy' | 'moderate' | 'hard'>('easy');
  const [formRawCode, setFormRawCode] = useState<string>('');
  const [formOutput, setFormOutput] = useState<string>('');
  const [formExplanation, setFormExplanation] = useState<string>('');
  const [formPoints, setFormPoints] = useState<number>(5);
  const [formSaving, setFormSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Check Auth on Mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, qData] = await Promise.all([
        gameApi.getAdminStats(),
        gameApi.getAdminQuestions({
          search,
          language: selectedLanguage,
          difficulty: selectedDifficulty,
          active: selectedActive
        })
      ]);
      setStats(statsData);
      setQuestions(qData.questions);
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('denied')) {
        logoutAdmin();
        navigate('/admin/login');
      } else {
        setError(err.message || 'Failed to load admin data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedLanguage, selectedDifficulty, selectedActive]);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const openCreateModal = () => {
    setEditingQuestion(null);
    setFormTitle('');
    setFormDesc('');
    setFormLang('python');
    setFormDiff('easy');
    setFormRawCode('');
    setFormOutput('');
    setFormExplanation('');
    setFormPoints(5);
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (q: AdminQuestion) => {
    setEditingQuestion(q);
    setFormTitle(q.title);
    setFormDesc(q.description);
    setFormLang(q.language);
    setFormDiff(q.difficulty);
    const rawLines = [...q.lines]
      .sort((a, b) => a.correctPosition - b.correctPosition)
      .map((l) => l.code)
      .join('\n');
    setFormRawCode(rawLines);
    setFormOutput(q.expectedOutput || '');
    setFormExplanation(q.explanation || '');
    setFormPoints(q.points || (q.difficulty === 'hard' ? 9 : q.difficulty === 'moderate' ? 7 : 5));
    setFormError(null);
    setShowModal(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim()) {
      setFormError('Title and description are required.');
      return;
    }

    const codeLines = formRawCode.split('\n').filter((l) => l.trim().length > 0);
    if (codeLines.length < 2) {
      setFormError('Canonical code must contain at least 2 lines of code.');
      return;
    }

    setFormSaving(true);
    setFormError(null);

    const payload = {
      title: formTitle.trim(),
      description: formDesc.trim(),
      language: formLang,
      difficulty: formDiff,
      code: formRawCode,
      expectedOutput: formOutput.trim(),
      explanation: formExplanation.trim(),
      points: Number(formPoints)
    };

    try {
      if (editingQuestion) {
        await gameApi.updateAdminQuestion(editingQuestion._id, payload);
      } else {
        await gameApi.createAdminQuestion(payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save question.');
    } finally {
      setFormSaving(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await gameApi.toggleAdminQuestionActive(id);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deactivate this question? Existing game logs will remain intact.')) return;
    try {
      await gameApi.deleteAdminQuestion(id);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to deactivate question');
    }
  };

  const languagesList = ['all', 'c', 'python', 'cpp', 'java', 'javascript', 'csharp', 'php', 'typescript'];

  return (
    <PageContainer maxWidth="xl" className="py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="bg-dark-slate p-5 rounded-2xl border border-gunmetal flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber/20 text-amber flex items-center justify-center border border-amber/30 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-snow-white">Admin Management Dashboard</h2>
            <p className="text-xs text-cool-gray">Manage competition question bank & view event statistics</p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <button
            onClick={() => setShowProfile(true)}
            className="px-3.5 py-2.5 rounded-xl bg-graphite hover:bg-dark-slate text-snow-white border border-gunmetal text-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <User className="w-4 h-4 text-amber" />
            <span>{admin ? admin.displayName : 'Admin Profile'}</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-green hover:bg-emerald-600 text-jet-black font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>+ ADD QUESTION</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2.5 rounded-xl bg-graphite hover:bg-dark-slate text-cool-gray hover:text-crimson-red border border-gunmetal text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Logout Admin"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* EXACTLY FOUR PRIMARY STATISTICS BOXES */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          {/* 1. Total Questions */}
          <div className="bg-dark-slate p-5 rounded-2xl border border-gunmetal shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-cool-gray uppercase font-bold tracking-wider block">Total Questions</span>
              <span className="text-3xl font-extrabold text-snow-white mt-1 block">{stats.totalQuestions}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-green/10 text-emerald-green flex items-center justify-center border border-emerald-green/30">
              <HelpCircle className="w-6 h-6" />
            </div>
          </div>

          {/* 2. Languages */}
          <div className="bg-dark-slate p-5 rounded-2xl border border-gunmetal shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-cool-gray uppercase font-bold tracking-wider block">Languages</span>
              <span className="text-3xl font-extrabold text-amber mt-1 block">{stats.languagesCount}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber/10 text-amber flex items-center justify-center border border-amber/30">
              <Globe2 className="w-6 h-6" />
            </div>
          </div>

          {/* 3. Players */}
          <div className="bg-dark-slate p-5 rounded-2xl border border-gunmetal shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-cool-gray uppercase font-bold tracking-wider block">Players</span>
              <span className="text-3xl font-extrabold text-snow-white mt-1 block">{stats.playersCount}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-green/10 text-emerald-green flex items-center justify-center border border-emerald-green/30">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* 4. Top Player */}
          <div className="bg-dark-slate p-5 rounded-2xl border border-gunmetal shadow-lg flex items-center justify-between">
            <div className="overflow-hidden">
              <span className="text-xs text-cool-gray uppercase font-bold tracking-wider block">Top Player</span>
              <span className="text-lg font-bold text-gold mt-1 block truncate max-w-[160px]">
                {stats.topPlayer}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center border border-gold/30 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* QUESTION BANK MANAGEMENT SECTION */}
      <div className="bg-dark-slate p-6 rounded-2xl border border-gunmetal space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gunmetal pb-3">
          <h3 className="text-base font-bold text-snow-white font-mono uppercase tracking-wider">
            Question Bank Management
          </h3>
        </div>

        {/* Search & Filters Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-cool-gray absolute left-3 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions by title, description, or ID..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-jet-black border border-gunmetal text-snow-white text-xs font-mono focus:outline-none focus:border-amber"
            />
          </div>

          {/* Filter Selects */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            {/* Language filter */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-jet-black border border-gunmetal text-amber text-xs uppercase font-bold focus:outline-none focus:border-amber"
            >
              <option value="all">All Languages</option>
              {languagesList.filter(l => l !== 'all').map((lang) => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>

            {/* Difficulty filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-jet-black border border-gunmetal text-emerald-green text-xs uppercase font-bold focus:outline-none focus:border-emerald-green"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="hard">Hard</option>
            </select>

            {/* Status filter */}
            <select
              value={selectedActive}
              onChange={(e) => setSelectedActive(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-jet-black border border-gunmetal text-cool-gray text-xs uppercase font-bold focus:outline-none"
            >
              <option value="all">Status: All</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Question Bank Table */}
        {loading ? (
          <div className="py-12 text-center text-cool-gray font-mono text-xs flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-amber border-t-transparent rounded-full animate-spin" />
            <span>Loading Question Bank...</span>
          </div>
        ) : questions.length === 0 ? (
          <div className="py-12 text-center text-cool-gray font-mono text-xs bg-graphite/40 rounded-xl border border-gunmetal p-6">
            <p>No questions found for the selected filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-gunmetal text-cool-gray text-[10px] uppercase">
                  <th className="py-3.5 px-3">Title & Description</th>
                  <th className="py-3.5 px-2">Language</th>
                  <th className="py-3.5 px-2">Difficulty</th>
                  <th className="py-3.5 px-2">Lines</th>
                  <th className="py-3.5 px-2">Status</th>
                  <th className="py-3.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gunmetal/60">
                {questions.map((q) => (
                  <tr key={q._id} className="hover:bg-graphite/50 transition-colors">
                    <td className="py-3.5 px-3 max-w-xs sm:max-w-md">
                      <span className="font-bold text-snow-white block text-xs">{q.title}</span>
                      <span className="text-[11px] text-cool-gray truncate block font-sans mt-0.5">{q.description}</span>
                    </td>
                    <td className="py-3.5 px-2">
                      <span className="bg-amber/10 text-amber border border-amber/30 px-2 py-0.5 rounded uppercase font-bold text-[10px]">
                        {q.language}
                      </span>
                    </td>
                    <td className="py-3.5 px-2">
                      <span
                        className={`px-2 py-0.5 rounded uppercase font-bold text-[10px] ${
                          q.difficulty === 'hard'
                            ? 'bg-crimson-red/10 text-crimson-red border border-crimson-red/30'
                            : q.difficulty === 'moderate'
                            ? 'bg-golden-yellow/10 text-golden-yellow border border-golden-yellow/30'
                            : 'bg-emerald-green/10 text-emerald-green border border-emerald-green/30'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-cool-gray">{q.lines.length} lines</td>
                    <td className="py-3.5 px-2">
                      <button
                        onClick={() => handleToggleActive(q._id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          q.active
                            ? 'bg-emerald-green/20 text-emerald-green border border-emerald-green/40'
                            : 'bg-crimson-red/20 text-crimson-red border border-crimson-red/40'
                        }`}
                      >
                        {q.active ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewQuestion(q)}
                          className="p-1.5 rounded bg-graphite hover:bg-gunmetal text-amber transition-colors cursor-pointer"
                          title="Preview Question (Player View)"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(q)}
                          className="p-1.5 rounded bg-graphite hover:bg-gunmetal text-emerald-green transition-colors cursor-pointer"
                          title="Edit Question"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(q._id)}
                          className="p-1.5 rounded bg-graphite hover:bg-gunmetal text-crimson-red transition-colors cursor-pointer"
                          title="Deactivate Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT QUESTION MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-jet-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-dark-slate border border-gunmetal rounded-2xl w-full max-w-3xl p-6 space-y-5 my-8 shadow-2xl font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gunmetal pb-3">
              <h3 className="text-base font-bold text-snow-white">
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-cool-gray hover:text-snow-white p-1 rounded hover:bg-graphite transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-crimson-red/10 border border-crimson-red/30 rounded-xl text-crimson-red flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-cool-gray text-[10px] uppercase font-bold mb-1">Question Title</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Calculate Array Sum"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-jet-black border border-gunmetal text-snow-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-cool-gray text-[10px] uppercase font-bold mb-1">Language</label>
                  <select
                    value={formLang}
                    onChange={(e) => setFormLang(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-jet-black border border-gunmetal text-amber font-bold uppercase text-xs"
                  >
                    {languagesList.filter(l => l !== 'all').map(l => (
                      <option key={l} value={l}>{l.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-cool-gray text-[10px] uppercase font-bold mb-1">Description</label>
                  <input
                    type="text"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Brief problem statement instructions..."
                    required
                    className="w-full px-3 py-2 rounded-lg bg-jet-black border border-gunmetal text-snow-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-cool-gray text-[10px] uppercase font-bold mb-1">Difficulty</label>
                  <select
                    value={formDiff}
                    onChange={(e) => setFormDiff(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-jet-black border border-gunmetal text-emerald-green font-bold uppercase text-xs"
                  >
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Raw Multiline Code Area */}
              <div>
                <label className="block text-cool-gray text-[10px] uppercase font-bold mb-1">
                  Canonical Code (Paste/Enter line by line in correct order):
                </label>
                <textarea
                  value={formRawCode}
                  onChange={(e) => setFormRawCode(e.target.value)}
                  rows={6}
                  placeholder={`int a = 10;\nint b = 20;\nint sum = a + b;\nprintf("%d", sum);`}
                  required
                  className="w-full p-3 rounded-xl bg-jet-black border border-gunmetal text-emerald-green text-xs font-mono leading-relaxed focus:outline-none focus:border-emerald-green"
                />
                <span className="text-[10px] text-cool-gray block mt-1">
                  Each non-empty line will automatically receive a stable line ID and correct position number.
                </span>
              </div>

              {/* Explanation & Output */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gunmetal pt-3">
                <div>
                  <label className="block text-cool-gray text-[10px] uppercase font-bold mb-1">Expected Output (Optional)</label>
                  <textarea
                    value={formOutput}
                    onChange={(e) => setFormOutput(e.target.value)}
                    rows={2}
                    placeholder="Console output after execution..."
                    className="w-full px-3 py-2 rounded-lg bg-jet-black border border-gunmetal text-snow-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-cool-gray text-[10px] uppercase font-bold mb-1">Explanation</label>
                  <textarea
                    value={formExplanation}
                    onChange={(e) => setFormExplanation(e.target.value)}
                    rows={2}
                    placeholder="Step by step solution explanation..."
                    required
                    className="w-full px-3 py-2 rounded-lg bg-jet-black border border-gunmetal text-snow-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gunmetal">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-graphite hover:bg-gunmetal text-cool-gray font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-green hover:bg-emerald-600 text-jet-black font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {formSaving ? 'Saving...' : editingQuestion ? 'UPDATE QUESTION' : 'SAVE QUESTION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW QUESTION MODAL (PLAYER VIEW PREVIEW) */}
      {previewQuestion && (
        <div className="fixed inset-0 bg-jet-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-slate border border-gunmetal rounded-2xl w-full max-w-2xl p-6 space-y-4 my-8 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-gunmetal pb-3">
              <div>
                <span className="bg-amber/20 text-amber px-2 py-0.5 rounded text-[10px] font-bold uppercase mr-2">
                  PREVIEW MODE ({previewQuestion.language.toUpperCase()})
                </span>
                <span className="text-snow-white font-bold text-sm">{previewQuestion.title}</span>
              </div>
              <button onClick={() => setPreviewQuestion(null)} className="text-cool-gray hover:text-snow-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-cool-gray font-sans">{previewQuestion.description}</p>

            <div className="space-y-2">
              <span className="text-[10px] text-amber uppercase font-bold flex items-center gap-1">
                <Code className="w-3.5 h-3.5" /> Player Scrambled Lines Preview:
              </span>
              <div className="bg-jet-black p-3 rounded-xl border border-gunmetal space-y-1.5">
                {previewQuestion.lines.map((line, idx) => (
                  <div key={line.id} className="flex items-center gap-3 p-2 rounded bg-graphite text-xs">
                    <span className="w-6 h-6 rounded bg-amber/20 text-amber font-bold flex items-center justify-center text-xs shrink-0">
                      ?
                    </span>
                    <span className="text-snow-white whitespace-pre overflow-x-auto">{line.code}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-graphite rounded-xl border border-gunmetal">
              <span className="text-cool-gray text-[10px] uppercase font-bold block mb-1">Admin Solution Key:</span>
              <div className="space-y-1 text-[11px] text-emerald-green">
                {[...previewQuestion.lines]
                  .sort((a, b) => a.correctPosition - b.correctPosition)
                  .map((l) => (
                    <div key={l.id} className="truncate">
                      Pos {l.correctPosition}: {l.code}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </PageContainer>
  );
};
