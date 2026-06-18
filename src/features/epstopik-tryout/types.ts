export interface Question {
  id: string;
  chapter: number;
  section: 'reading' | 'listening';
  question_number: number;
  group_instruction: string;
  question_text: string;
  options: string[];
  correct_answer: number | null;
  image_type?: 'reference' | 'options' | null;
  images?: string[] | null;
  image?: string | null;
  transcript?: string | null;
}

export type TryoutMode = 'setup' | 'quiz' | 'result';
export type TryoutType = 'practice' | 'cbt';
export type CbtSection = 'mix' | 'reading' | 'listening';
export type CbtDurationMode = 'official' | '30' | '40' | '50' | '60';

export interface TryoutResults {
  score: number;
  correctCount: number;
  items: {
    q: Question;
    userAns: number;
    correctAns: number | null;
    isCorrect: boolean;
  }[];
}

export interface TryoutHistoryItem {
  id: string;
  date: string;
  tryoutType: 'practice' | 'cbt';
  section: string; // 'mix' | 'reading' | 'listening' | 'custom'
  totalQuestions: number;
  correctCount: number;
  score: number;
}

export interface TryoutSession {
  quizQuestions: Question[];
  currentIndex: number;
  selectedAnswers: Record<number, number>;
  answeredState: Record<number, boolean>;
  timeLeft: number;
  isTimerActive: boolean;
  tryoutType: 'practice' | 'cbt';
  instantFeedback: boolean;
  isBlankOptions: boolean;
  isExamMode: boolean;
  cbtSection?: string;
  cbtQuestionCount?: number;
  cbtDurationMode?: string;
}

