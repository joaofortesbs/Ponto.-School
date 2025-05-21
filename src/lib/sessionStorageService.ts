import { supabase } from "@/lib/supabase";

// Interface para as sessões de flow
export interface FlowSession {
  id: string;
  timestamp: number;
  date: string; // Formato DD/MM/YYYY
  duration: string; // Formato HH:MM:SS
  elapsedTimeSeconds: number;
  subjects: string[];
  progress: number; // 0-100
  notes?: string;
  formattedDate?: string;
  xp?: number;
}

/**
 * Serviço para gerenciar o armazenamento das sessões de flow
 * usando uma estratégia híbrida (Supabase + localStorage)
 */
const SessionStorageService = {
  /**
   * Salva uma sessão de flow usando método híbrido
   */
  async saveSession(session: FlowSession): Promise<boolean> {
    // Primeiro, salvar localmente para garantir a persistência
    const savedLocally = await this.saveSessionLocally(session);

    // Tentar salvar remotamente no Supabase, se possível
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Verificar se a tabela existe primeiro
        const { error: checkError } = await supabase
          .from('flow_sessions')
          .select('count')
          .limit(1)
          .maybeSingle();

        if (!checkError) {
          // Tabela existe, vamos inserir
          const { error } = await supabase
            .from("flow_sessions")
            .insert({
              user_id: user.id,
              date: session.timestamp || new Date().toISOString(),
              duration_seconds: session.elapsedTimeSeconds,
              duration_formatted: session.duration,
              subjects: session.subjects,
              progress: session.progress,
              session_goal: session.session_goal,
              notes: session.notes
            });

          if (error) {
            console.error("Erro ao salvar sessão no Supabase:", error);
            return savedLocally;
          }

          return true;
        }
      }

      return savedLocally;
    } catch (error) {
      console.error("Erro ao salvar sessão remotamente:", error);
      return savedLocally;
    }
  },

  /**
   * Salva uma sessão apenas no armazenamento local
   */
  async saveSessionLocally(session: FlowSession): Promise<boolean> {
    try {
      const userId = await this.getUserId();
      const sessions = await this.getLocalSessions(userId);

      // Adicionar a nova sessão e salvar
      sessions.unshift(session);
      localStorage.setItem(`flow_sessions_${userId}`, JSON.stringify(sessions));

      return true;
    } catch (error) {
      console.error("Erro ao salvar sessão localmente:", error);
      return false;
    }
  },

  /**
   * Obtém todas as sessões para o usuário atual
   */
  async getSessions(): Promise<FlowSession[]> {
    try {
      const userId = await this.getUserId();
      let sessions: FlowSession[] = [];

      // 1. Carregar do localStorage
      const localSessions = await this.getLocalSessions(userId);

      // 2. Tentar carregar do Supabase se o usuário estiver logado
      let remoteSessions: FlowSession[] = [];

      if (userId !== 'anonymous') {
        try {
          // Verificar se a tabela existe primeiro
          const { error: checkError } = await supabase
            .from('flow_sessions')
            .select('count')
            .limit(1)
            .maybeSingle();

          if (!checkError) {
            // Buscar sessões do usuário
            const { data, error } = await supabase
              .from("flow_sessions")
              .select("*")
              .eq("user_id", userId)
              .order("date", { ascending: false });

            if (!error && data) {
              remoteSessions = data.map(session => ({
                id: session.id,
                date: new Date(session.date).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                }),
                duration: session.duration_formatted,
                subjects: session.subjects,
                progress: session.progress,
                elapsedTimeSeconds: session.duration_seconds,
                session_goal: session.session_goal,
                notes: session.notes,
                timestamp: session.date
              }));
            }
          }
        } catch (error) {
          console.error("Erro ao carregar sessões remotas:", error);
        }
      }

      // 3. Mesclar as sessões, evitando duplicações
      const mergedSessions = [...remoteSessions];

      localSessions.forEach(localSession => {
        // Evitar adicionar sessões que já existem remotamente
        const exists = remoteSessions.some(remoteSession => 
          remoteSession.id.toString() === localSession.id.toString());

        if (!exists) {
          mergedSessions.push(localSession);
        }
      });

      // 4. Ordenar por data (mais recentes primeiro)
      mergedSessions.sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return dateB - dateA;
      });

      // 5. Atualizar o armazenamento local com a lista mesclada
      localStorage.setItem(`flow_sessions_${userId}`, JSON.stringify(mergedSessions));

      return mergedSessions;
    } catch (error) {
      console.error("Erro ao obter sessões:", error);
      return [];
    }
  },

  /**
   * Obtém as sessões salvas localmente
   */
  async getLocalSessions(userId: string): Promise<FlowSession[]> {
    try {
      const stored = localStorage.getItem(`flow_sessions_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Erro ao carregar sessões localmente:", error);
      return [];
    }
  },

  /**
   * Obtém o ID do usuário atual ou retorna 'anonymous' se não logado
   */
  async getUserId(): Promise<string> {
    try {
      const { data } = await supabase.auth.getUser();
      return data.user?.id || 'anonymous';
    } catch (error) {
      return 'anonymous';
    }
  },

  /**
   * Sincroniza as sessões locais com o Supabase quando o usuário faz login
   */
  async syncSessionsOnLogin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return false;

      // Carregar sessões salvas localmente
      const localSessions = await this.getLocalSessions('anonymous');
      if (localSessions.length === 0) return true;

      // Verificar se a tabela existe
      const { error: checkError } = await supabase
        .from('flow_sessions')
        .select('count')
        .limit(1)
        .maybeSingle();

      if (checkError) return false;

      // Para cada sessão local, tentar sincronizar com o Supabase
      for (const session of localSessions) {
        await supabase
          .from("flow_sessions")
          .insert({
            user_id: user.id,
            date: session.timestamp || new Date().toISOString(),
            duration_seconds: session.elapsedTimeSeconds,
            duration_formatted: session.duration,
            subjects: session.subjects,
            progress: session.progress,
            session_goal: session.session_goal,
            notes: session.notes
          });
      }

      // Limpar sessões anônimas após sincronização
      localStorage.removeItem('flow_sessions_anonymous');

      return true;
    } catch (error) {
      console.error("Erro ao sincronizar sessões:", error);
      return false;
    }
  },

  /**
   * Salvar uma nova sessão de Flow
   */
  saveSession: async (session: FlowSession): Promise<boolean> => {
    try {
      // Recuperar as sessões existentes
      const existingSessions = await SessionStorageService.getSessions();

      // Adicionar a nova sessão
      const updatedSessions = [session, ...existingSessions];

      // Salvar as sessões atualizadas
      localStorage.setItem('flowSessions', JSON.stringify(updatedSessions));

      return true;
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
      return false;
    }
  },

  /**
   * Obter todas as sessões de Flow
   */
  getSessions: async (): Promise<FlowSession[]> => {
    try {
      const sessionsData = localStorage.getItem('flowSessions');
      if (!sessionsData) return [];

      return JSON.parse(sessionsData);
    } catch (error) {
      console.error('Erro ao obter sessões:', error);
      return [];
    }
  },

  /**
   * Remover uma sessão específica
   */
  removeSession: async (sessionId: string): Promise<boolean> => {
    try {
      const sessions = await SessionStorageService.getSessions();
      const updatedSessions = sessions.filter(session => session.id !== sessionId);

      localStorage.setItem('flowSessions', JSON.stringify(updatedSessions));
      return true;
    } catch (error) {
      console.error('Erro ao remover sessão:', error);
      return false;
    }
  },

  /**
   * Limpar todas as sessões
   */
  clearSessions: async (): Promise<boolean> => {
    try {
      localStorage.setItem('flowSessions', JSON.stringify([]));
      return true;
    } catch (error) {
      console.error('Erro ao limpar sessões:', error);
      return false;
    }
  }
};

export default SessionStorageService;