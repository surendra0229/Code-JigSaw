import api from './api';
import {
  GameState,
  AnswerFeedback,
  SimulationResult,
  LeaderboardItem,
  DifficultyLevel
} from '../types/game';
import {
  AdminUser,
  AdminStats,
  AdminQuestion,
  QuestionFilterParams
} from '../types/admin';
import {
  PlayerUser,
  RegisterParams,
  LoginParams,
  AuthResponse
} from '../types/auth';

export interface StartGameParams {
  playerName: string;
  language: string;
  difficulty: DifficultyLevel;
  selectedTime: number;
}

export const loginPlayer = async (email: string, password: string) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data.data || res.data;
};

export const loginAdmin = async (identifier: string, password: string) => {
  const res = await api.post('/admin/login', { identifier, password });
  const token = res.data.token || res.data.data?.token;
  const admin = res.data.data?.admin || {
    id: res.data.user?.id,
    email: res.data.user?.email,
    userId: res.data.user?.userId,
    displayName: res.data.user?.name || 'Admin',
    role: 'admin'
  };
  return { token, admin, user: res.data.user };
};

export const gameApi = {
  // Player Auth APIs
  playerRegister: async (params: RegisterParams): Promise<AuthResponse> => {
    const res = await api.post('/auth/register', params);
    return res.data.data;
  },

  playerLogin: async (params: LoginParams): Promise<AuthResponse> => {
    return loginPlayer(params.email, params.password);
  },

  getPlayerMe: async (): Promise<PlayerUser> => {
    const res = await api.get('/auth/me');
    return res.data.data;
  },

  updatePlayerProfile: async (payload: { playerName: string }): Promise<AuthResponse> => {
    const res = await api.put('/auth/profile', payload);
    return res.data.data;
  },

  playerLogout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // Game Gameplay APIs
  startGame: async (params: StartGameParams): Promise<{ gameId: string }> => {
    const res = await api.post('/game/start', params);
    return res.data.data;
  },

  getGameState: async (gameId: string): Promise<GameState> => {
    const res = await api.get(`/game/${gameId}`);
    return res.data.data;
  },

  submitAnswer: async (gameId: string, submittedSelection: Record<string, number>): Promise<AnswerFeedback> => {
    const res = await api.post(`/game/${gameId}/answer`, { submittedSelection });
    return res.data.data;
  },

  nextQuestion: async (gameId: string): Promise<GameState> => {
    const res = await api.post(`/game/${gameId}/next`);
    return res.data.data;
  },

  getSimulation: async (gameId: string, lines: { id: string; code: string }[]): Promise<SimulationResult> => {
    const res = await api.post(`/game/${gameId}/simulation`, { lines });
    return res.data.data;
  },

  completeGame: async (gameId: string): Promise<any> => {
    const res = await api.post(`/game/${gameId}/complete`);
    return res.data.data;
  },

  getLeaderboard: async (language?: string, difficulty?: string): Promise<LeaderboardItem[]> => {
    const res = await api.get('/leaderboard', {
      params: { language, difficulty }
    });
    return res.data.data;
  },

  getPlayerRank: async (gameId: string): Promise<any> => {
    const res = await api.get(`/leaderboard/rank/${gameId}`);
    return res.data.data;
  },

  // Admin APIs
  adminLogin: async (credentials: { identifier: string; password: string }): Promise<{ token: string; admin: AdminUser }> => {
    return loginAdmin(credentials.identifier, credentials.password);
  },

  getAdminMe: async (): Promise<AdminUser> => {
    const res = await api.get('/admin/me');
    return res.data.data;
  },

  updateAdminProfile: async (payload: { displayName: string }): Promise<AdminUser> => {
    const res = await api.put('/admin/profile', payload);
    return res.data.data;
  },

  getAdminStats: async (): Promise<AdminStats> => {
    const res = await api.get('/admin/stats');
    return res.data.data;
  },

  getAdminQuestions: async (params: QuestionFilterParams): Promise<{ questions: AdminQuestion[]; pagination: any }> => {
    const res = await api.get('/admin/questions', { params });
    return res.data.data;
  },

  createAdminQuestion: async (payload: any): Promise<AdminQuestion> => {
    const res = await api.post('/admin/questions', payload);
    return res.data.data;
  },

  updateAdminQuestion: async (id: string, payload: any): Promise<AdminQuestion> => {
    const res = await api.put(`/admin/questions/${id}`, payload);
    return res.data.data;
  },

  toggleAdminQuestionActive: async (id: string): Promise<{ id: string; active: boolean }> => {
    const res = await api.patch(`/admin/questions/${id}/toggle`);
    return res.data.data;
  },

  deleteAdminQuestion: async (id: string): Promise<{ id: string }> => {
    const res = await api.delete(`/admin/questions/${id}`);
    return res.data.data;
  }
};
