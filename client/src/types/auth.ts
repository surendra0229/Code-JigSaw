export interface PlayerUser {
  id: string;
  playerName: string;
  email: string;
  createdAt?: string;
}

export interface RegisterParams {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  player: PlayerUser;
}
