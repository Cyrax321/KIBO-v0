export interface Assessment {
  id: string;
  title: string;
  company: string;
  duration_minutes: number;
  difficulty: string;
  description: string | null;
  problem_ids: string[];
}

export interface Quiz {
  id: string;
  title: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  duration_minutes: number;
  description: string;
  questions: QuizQuestion[];
  icon?: string; // Deprecated - no longer used
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizResult {
  passed: boolean;
  score: number;
  correct: number;
  total: number;
  xpEarned: number;
}
