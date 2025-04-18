
import { supabase } from '@/lib/supabase';
import { QuizAttempt, QuizProgress } from '@/types/quiz-history';

// Chave para armazenamento local temporário
const LOCAL_STORAGE_KEY = 'quiz_history_attempts';

/**
 * Salva uma nova tentativa de quiz no histórico
 */
export async function saveQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'date'>) {
  try {
    // Obter sessão atual
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      console.log('Usuário não autenticado, salvando apenas localmente');
      saveLocalAttempt(attempt);
      return;
    }
    
    const newAttempt: QuizAttempt = {
      ...attempt,
      id: `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      date: new Date().toISOString()
    };
    
    // Salvar no Supabase
    const { error } = await supabase
      .from('quiz_attempts')
      .insert([{
        user_id: session.user.id,
        ...newAttempt
      }]);
    
    if (error) {
      console.error('Erro ao salvar tentativa de quiz:', error);
      // Fallback para armazenamento local
      saveLocalAttempt(attempt);
    }
    
    return newAttempt;
  } catch (err) {
    console.error('Exceção ao salvar tentativa de quiz:', err);
    saveLocalAttempt(attempt);
  }
}

/**
 * Obtém o histórico de tentativas de quiz do usuário
 */
export async function getQuizHistory(): Promise<QuizAttempt[]> {
  try {
    // Obter sessão atual
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      console.log('Usuário não autenticado, obtendo do armazenamento local');
      return getLocalAttempts();
    }
    
    // Obter do Supabase
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', session.user.id)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Erro ao obter histórico de quiz:', error);
      return getLocalAttempts();
    }
    
    return data as QuizAttempt[];
  } catch (err) {
    console.error('Exceção ao obter histórico de quiz:', err);
    return getLocalAttempts();
  }
}

/**
 * Analisa o progresso do usuário em um determinado tema
 */
export async function analyzeQuizProgress(theme: string): Promise<QuizProgress> {
  const allAttempts = await getQuizHistory();
  
  // Filtrar tentativas pelo tema
  const themeAttempts = allAttempts.filter(a => a.theme === theme);
  
  // Ordenar por data (mais recentes primeiro)
  themeAttempts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Se não houver tentativas suficientes, retorna apenas as tentativas
  if (themeAttempts.length < 2) {
    return { attempts: themeAttempts };
  }
  
  // Pegar a tentativa mais recente e as 3 anteriores (se houver)
  const current = themeAttempts[0];
  const previous = themeAttempts.slice(1, 4);
  
  // Calcular média de acertos das tentativas anteriores
  const prevAvg = previous.reduce((sum, attempt) => {
    return sum + (attempt.correctAnswers / attempt.totalQuestions);
  }, 0) / previous.length;
  
  // Calcular taxa de acerto atual
  const currentRate = current.correctAnswers / current.totalQuestions;
  
  // Calcular tendência
  const percentageDiff = ((currentRate - prevAvg) / prevAvg) * 100;
  
  let trend: 'up' | 'down' | 'stable';
  
  if (percentageDiff > 5) {
    trend = 'up';
  } else if (percentageDiff < -5) {
    trend = 'down';
  } else {
    trend = 'stable';
  }
  
  return {
    attempts: themeAttempts,
    evolution: {
      trend,
      percentage: Math.abs(Math.round(percentageDiff))
    }
  };
}

// Funções auxiliares para armazenamento local
function saveLocalAttempt(attempt: Omit<QuizAttempt, 'id' | 'date'>) {
  try {
    const attempts = getLocalAttempts();
    
    const newAttempt: QuizAttempt = {
      ...attempt,
      id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      date: new Date().toISOString()
    };
    
    attempts.unshift(newAttempt);
    
    // Limitar a 50 tentativas locais
    if (attempts.length > 50) {
      attempts.length = 50;
    }
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(attempts));
    return newAttempt;
  } catch (e) {
    console.error('Erro ao salvar tentativa local:', e);
  }
}

function getLocalAttempts(): QuizAttempt[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (e) {
    console.error('Erro ao ler tentativas locais:', e);
    return [];
  }
}
