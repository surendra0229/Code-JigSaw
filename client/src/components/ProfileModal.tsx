import React, { useState } from 'react';
import { User, ShieldCheck, Mail, Key, Edit2, Check, X, AlertCircle } from 'lucide-react';
import { useGame } from '../context/GameContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { player, admin, updatePlayerName, updateAdminName } = useGame();

  const isPlayer = Boolean(player);
  const isAdmin = Boolean(admin);

  const initialName = player ? player.playerName : (admin ? admin.displayName : '');
  const [editing, setEditing] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(initialName);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || (!player && !admin)) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = nameInput.trim();
    if (!clean || clean.length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isPlayer) {
        await updatePlayerName(clean);
      } else if (isAdmin) {
        await updateAdminName(clean);
      }
      setMessage('Name updated successfully!');
      setEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update name.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-jet-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-slate border border-gunmetal rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl font-mono text-xs animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gunmetal pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isAdmin ? 'bg-amber/20 text-amber border-amber/30' : 'bg-emerald-green/20 text-emerald-green border-emerald-green/30'
            }`}>
              {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-snow-white">Account Profile</h3>
              <p className="text-[10px] text-cool-gray">Manage your display identity</p>
            </div>
          </div>

          <button onClick={onClose} className="text-cool-gray hover:text-snow-white p-1 rounded hover:bg-graphite transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {message && (
          <div className="p-3 bg-emerald-green/10 border border-emerald-green/30 rounded-xl text-emerald-green flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-crimson-red/10 border border-crimson-red/30 rounded-xl text-crimson-red flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Info Cards */}
        <div className="space-y-3">
          {/* Display Name Field */}
          <div className="bg-graphite p-3 rounded-xl border border-gunmetal space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-cool-gray uppercase font-bold">Display Name</span>
              {!editing && (
                <button
                  onClick={() => {
                    setNameInput(player ? player.playerName : (admin ? admin.displayName : ''));
                    setEditing(true);
                  }}
                  className="text-emerald-green hover:underline flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" /> Edit Name
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSave} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter name..."
                  autoFocus
                  required
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-jet-black border border-gunmetal text-snow-white font-mono text-xs focus:outline-none focus:border-emerald-green"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg bg-emerald-green text-jet-black font-bold text-xs hover:bg-emerald-600 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-gunmetal text-cool-gray text-xs hover:text-snow-white"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <span className="text-sm font-bold text-snow-white block">
                {player ? player.playerName : (admin ? admin.displayName : '')}
              </span>
            )}
          </div>

          {/* Email Field */}
          <div className="bg-graphite p-3 rounded-xl border border-gunmetal space-y-1">
            <span className="text-[10px] text-cool-gray uppercase font-bold flex items-center gap-1">
              <Mail className="w-3 h-3 text-steel-blue" /> Email Address
            </span>
            <span className="text-xs font-bold text-snow-white block">
              {player ? player.email : (admin ? admin.email : '')}
            </span>
          </div>

          {/* Admin User ID (if admin) */}
          {isAdmin && admin && (
            <div className="bg-graphite p-3 rounded-xl border border-gunmetal space-y-1">
              <span className="text-[10px] text-cool-gray uppercase font-bold flex items-center gap-1">
                <Key className="w-3 h-3 text-amber" /> Admin User ID
              </span>
              <span className="text-xs font-bold text-amber block">{admin.userId}</span>
            </div>
          )}

          {/* Account Role */}
          <div className="bg-graphite p-3 rounded-xl border border-gunmetal space-y-1">
            <span className="text-[10px] text-cool-gray uppercase font-bold">Account Role</span>
            <span className={`text-xs font-bold uppercase block ${isAdmin ? 'text-amber' : 'text-emerald-green'}`}>
              {isAdmin ? 'ADMINISTRATOR' : 'COMPETITOR PLAYER'}
            </span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-graphite hover:bg-gunmetal text-cool-gray hover:text-snow-white font-bold text-xs transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
