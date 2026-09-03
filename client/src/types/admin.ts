export interface AdminUser {
  id: string;
  email: string;
  userId: string;
  displayName: string;
  role: 'admin';
  createdAt?: string;
}

export interface AdminStats {
  totalQuestions: number;
  languagesCount: number;
  playersCount: number;
  topPlayer: string;
}

export interface AdminQuestionLine {
  id: string;
  code: string;
  correctPosition: number;
}

export interface AdminQuestion {
  _id: string;
  title: string;
  description: string;
  language: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  lines: AdminQuestionLine[];
  expectedOutput?: string;
  explanation?: string;
  points?: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuestionFilterParams {
  search?: string;
  language?: string;
  difficulty?: string;
  active?: string;
  page?: number;
  limit?: number;
}
