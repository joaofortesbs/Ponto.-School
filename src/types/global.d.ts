
// Definições globais para TypeScript

// Extendendo a interface Window
interface Window {
  PONTO_SCHOOL_CONFIG?: {
    defaultLogo: string;
    logoLoaded: boolean;
    logoVersion?: number;
    theme?: 'light' | 'dark' | 'system';
    features?: {
      epictusAI: boolean;
      mentorAI: boolean;
      conexaoExpert: boolean;
    };
  };
  
  // Adicionar outras propriedades globais conforme necessário
  __SUPABASE_INITIALIZED__?: boolean;
  __DEVELOPMENT_MODE__?: boolean;
  __USERNAME_INITIALIZED__?: boolean;
}

// Tipos para temas
type ThemeType = 'light' | 'dark' | 'system';

// Tipo para funções de utilidade comuns
type Nullable<T> = T | null;
type Optional<T> = T | undefined;
type AsyncFunction<T = void> = () => Promise<T>;
type CallbackFunction<T = void, U = any> = (param: U) => T;

// Enums comuns
declare enum MaterialType {
  PDF = 'pdf',
  VIDEO = 'video',
  AUDIO = 'audio',
  IMAGE = 'image',
  DOCUMENT = 'document',
  PRESENTATION = 'presentation',
  SPREADSHEET = 'spreadsheet',
  LINK = 'link',
  QUIZ = 'quiz',
  EXERCISE = 'exercise',
  OTHER = 'other'
}

declare enum UserRole {
  ADMIN = 'admin',
  PROFESSOR = 'professor',
  STUDENT = 'student',
  GUEST = 'guest'
}

declare enum EventType {
  MEETING = 'meeting',
  DEADLINE = 'deadline',
  CLASS = 'class',
  EXAM = 'exam',
  CHALLENGE = 'challenge',
  REMINDER = 'reminder',
  HOMEWORK = 'homework',
  PROJECT = 'project'
}
