import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { gameApi } from '../services/gameApi';
import { GameState, DifficultyLevel } from '../types/game';
import { PlayerUser, LoginParams, RegisterParams } from '../types/auth';
import { AdminUser } from '../types/admin';

interface GameContextType {
  player: PlayerUser | null;
  playerToken: string | null;
  playerName: string;
  admin: AdminUser | null;
  adminToken: string | null;
  language: string;
  setLanguage: (lang: string) => void;
  difficulty: DifficultyLevel;
  setDifficulty: (diff: DifficultyLevel) => void;
  selectedTime: number;
  setSelectedTime: (timeSec: number) => void;
  activeGameId: string | null;
  gameState: GameState | null;
  loading: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  loginPlayer: (params: LoginParams) => Promise<PlayerUser>;
  registerPlayer: (params: RegisterParams) => Promise<PlayerUser>;
  updatePlayerName: (newName: string) => Promise<void>;
  updateAdminName: (newName: string) => Promise<void>;
  logoutPlayer: () => void;
  logoutAdmin: () => void;
  startNewGame: () => Promise<string>;
  refreshGameState: () => Promise<GameState | null>;
  resetSession: () => void;
  setAdminUser: (admin: AdminUser | null, token: string | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playerToken, setPlayerToken] = useState<string | null>(() => localStorage.getItem('player_token'));
  const [player, setPlayer] = useState<PlayerUser | null>(() => {
    const raw = localStorage.getItem('player_user');
    if (raw) {
      try { return JSON.parse(raw); } catch { return null; }
    }
    return null;
  });

  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('admin_token'));
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const raw = localStorage.getItem('admin_user');
    if (raw) {
      try { return JSON.parse(raw); } catch { return null; }
    }
    return null;
  });

  const playerName = player ? player.playerName : (localStorage.getItem('cj_player_name') || '');

  const [language, setLanguageState] = useState<string>(() => localStorage.getItem('cj_language') || 'python');
  const [difficulty, setDifficultyState] = useState<DifficultyLevel>(() => (localStorage.getItem('cj_difficulty') as DifficultyLevel) || 'easy');
  const [selectedTime, setSelectedTimeState] = useState<number>(() => Number(localStorage.getItem('cj_selected_time')) || 300);
  const [activeGameId, setActiveGameId] = useState<string | null>(() => localStorage.getItem('cj_active_game_id') || null);
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync player session on mount
  useEffect(() => {
    if (playerToken && !player) {
      gameApi.getPlayerMe()
        .then((user) => {
          setPlayer(user);
          localStorage.setItem('player_user', JSON.stringify(user));
          localStorage.setItem('cj_player_name', user.playerName);
        })
        .catch(() => {
          setPlayerToken(null);
          setPlayer(null);
          localStorage.removeItem('player_token');
          localStorage.removeItem('player_user');
        });
    }
  }, [playerToken, player]);

  // Sync admin session on mount
  useEffect(() => {
    if (adminToken && !admin) {
      gameApi.getAdminMe()
        .then((adm) => {
          setAdmin(adm);
          localStorage.setItem('admin_user', JSON.stringify(adm));
        })
        .catch(() => {
          setAdminToken(null);
          setAdmin(null);
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
        });
    }
  }, [adminToken, admin]);

  const setAdminUser = (adm: AdminUser | null, token: string | null) => {
    setAdmin(adm);
    setAdminToken(token);
    if (adm && token) {
      localStorage.setItem('admin_user', JSON.stringify(adm));
      localStorage.setItem('admin_token', token);
    } else {
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_token');
    }
  };

  const loginPlayer = async (params: LoginParams): Promise<PlayerUser> => {
    setLoading(true);
    setError(null);
    try {
      const res = await gameApi.playerLogin(params);
      setPlayerToken(res.token);
      setPlayer(res.player);
      localStorage.setItem('player_token', res.token);
      localStorage.setItem('player_user', JSON.stringify(res.player));
      localStorage.setItem('cj_player_name', res.player.playerName);
      return res.player;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerPlayer = async (params: RegisterParams): Promise<PlayerUser> => {
    setLoading(true);
    setError(null);
    try {
      const res = await gameApi.playerRegister(params);
      setPlayerToken(res.token);
      setPlayer(res.player);
      localStorage.setItem('player_token', res.token);
      localStorage.setItem('player_user', JSON.stringify(res.player));
      localStorage.setItem('cj_player_name', res.player.playerName);
      return res.player;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePlayerName = async (newName: string) => {
    const res = await gameApi.updatePlayerProfile({ playerName: newName });
    setPlayer(res.player);
    setPlayerToken(res.token);
    localStorage.setItem('player_token', res.token);
    localStorage.setItem('player_user', JSON.stringify(res.player));
    localStorage.setItem('cj_player_name', res.player.playerName);
  };

  const updateAdminName = async (newName: string) => {
    const updatedAdmin = await gameApi.updateAdminProfile({ displayName: newName });
    setAdmin(updatedAdmin);
    localStorage.setItem('admin_user', JSON.stringify(updatedAdmin));
  };

  const logoutPlayer = () => {
    setPlayerToken(null);
    setPlayer(null);
    localStorage.removeItem('player_token');
    localStorage.removeItem('player_user');
    localStorage.removeItem('cj_player_name');
    gameApi.playerLogout().catch(() => {});
  };

  const logoutAdmin = () => {
    setAdminToken(null);
    setAdmin(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  };

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('cj_language', lang);
  };

  const setDifficulty = (diff: DifficultyLevel) => {
    setDifficultyState(diff);
    localStorage.setItem('cj_difficulty', diff);
  };

  const setSelectedTime = (timeSec: number) => {
    setSelectedTimeState(timeSec);
    localStorage.setItem('cj_selected_time', String(timeSec));
  };

  const refreshGameState = useCallback(async (): Promise<GameState | null> => {
    if (!activeGameId) return null;
    try {
      const state = await gameApi.getGameState(activeGameId);
      setGameState(state);
      if (state.language) setLanguageState(state.language);
      if (state.difficulty) setDifficultyState(state.difficulty);
      return state;
    } catch (err: any) {
      console.warn('Failed to restore active game session:', err.message);
      setActiveGameId(null);
      localStorage.removeItem('cj_active_game_id');
      setGameState(null);
      return null;
    }
  }, [activeGameId]);

  useEffect(() => {
    if (activeGameId && !gameState) {
      setLoading(true);
      refreshGameState().finally(() => setLoading(false));
    }
  }, [activeGameId, gameState, refreshGameState]);

  const startNewGame = async (): Promise<string> => {
    const finalName = player ? player.playerName : playerName.trim();
    if (!finalName) {
      throw new Error('Please log in or enter a valid player name before starting.');
    }
    setLoading(true);
    setError(null);
    try {
      const result = await gameApi.startGame({
        playerName: finalName,
        language,
        difficulty,
        selectedTime
      });

      const gameId = result.gameId;
      setActiveGameId(gameId);
      localStorage.setItem('cj_active_game_id', gameId);

      const state = await gameApi.getGameState(gameId);
      setGameState(state);
      return gameId;
    } catch (err: any) {
      setError(err.message || 'Failed to start game session');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetSession = () => {
    setActiveGameId(null);
    setGameState(null);
    localStorage.removeItem('cj_active_game_id');
  };

  return (
    <GameContext.Provider
      value={{
        player,
        playerToken,
        playerName,
        admin,
        adminToken,
        language,
        setLanguage,
        difficulty,
        setDifficulty,
        selectedTime,
        setSelectedTime,
        activeGameId,
        gameState,
        loading,
        error,
        setError,
        loginPlayer,
        registerPlayer,
        updatePlayerName,
        updateAdminName,
        logoutPlayer,
        logoutAdmin,
        startNewGame,
        refreshGameState,
        resetSession,
        setAdminUser
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
