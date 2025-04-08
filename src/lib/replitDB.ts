
import { Database } from '@replit/database';

// Inicializar o banco de dados do Replit
let db: Database | null = null;

try {
  db = new Database();
  console.log("Replit DB inicializado com sucesso");
} catch (error) {
  console.error("Erro ao inicializar Replit DB:", error);
  
  // Criar um objeto falso para suporte offline
  db = {
    get: async (key: string) => {
      console.log(`[Offline DB] Tentando obter: ${key}`);
      return localStorage.getItem(key);
    },
    set: async (key: string, value: string) => {
      console.log(`[Offline DB] Salvando: ${key}`);
      localStorage.setItem(key, value);
      return true;
    },
    delete: async (key: string) => {
      console.log(`[Offline DB] Removendo: ${key}`);
      localStorage.removeItem(key);
      return true;
    },
    list: async () => {
      console.log(`[Offline DB] Listando chaves`);
      return Object.keys(localStorage);
    },
    empty: async () => {
      console.log(`[Offline DB] Esvaziando banco`);
      localStorage.clear();
      return true;
    }
  } as unknown as Database;
}

// Tipos para os dados do usuário
export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  password: string; // Em produção, isso deveria ser hash
  full_name: string;
  username: string;
  display_name: string;
  institution?: string;
  birth_date?: string;
  plan_type?: string;
  level?: number;
  rank?: string;
  xp?: number;
  coins?: number;
  created_at: string;
}

// Classe para gerenciar usuários
export class UserService {
  // Obter um usuário pelo email
  static async getUserByEmail(email: string): Promise<UserProfile | null> {
    try {
      // Obter todos os IDs de usuários
      const userIdsStr = await db.get('user_ids') as string || '[]';
      const userIds = JSON.parse(userIdsStr);
      
      // Procurar o usuário pelo email
      for (const userId of userIds) {
        const userStr = await db.get(`user:${userId}`) as string;
        if (!userStr) continue;
        
        const user = JSON.parse(userStr) as UserProfile;
        if (user.email === email) {
          return user;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      return null;
    }
  }
  
  // Obter um usuário pelo ID
  static async getUserById(id: string): Promise<UserProfile | null> {
    try {
      const userStr = await db.get(`user:${id}`) as string;
      if (!userStr) return null;
      
      return JSON.parse(userStr) as UserProfile;
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      return null;
    }
  }
  
  // Criar um novo usuário
  static async createUser(userData: Omit<UserProfile, 'id' | 'created_at'>): Promise<UserProfile | null> {
    try {
      // Verificar se o usuário já existe
      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser) {
        console.error('Usuário já existe com este email');
        return null;
      }
      
      // Gerar ID único
      const id = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // Criar objeto de usuário
      const newUser: UserProfile = {
        id,
        ...userData,
        created_at: new Date().toISOString()
      };
      
      try {
        // Salvar usuário no banco de dados
        await db.set(`user:${id}`, JSON.stringify(newUser));
        
        // Atualizar lista de IDs de usuários
        const userIdsStr = await db.get('user_ids') as string || '[]';
        const userIds = JSON.parse(userIdsStr);
        userIds.push(id);
        await db.set('user_ids', JSON.stringify(userIds));
      } catch (dbError) {
        console.error('Erro ao salvar no DB, salvando localmente:', dbError);
        // Salvar localmente como fallback
        const localUsers = localStorage.getItem('localUsers') || '[]';
        const users = JSON.parse(localUsers);
        users.push(newUser);
        localStorage.setItem('localUsers', JSON.stringify(users));
      }
      
      // Também salvar no formato antigo para compatibilidade
      try {
        const tempProfiles = localStorage.getItem('tempUserProfiles') || '[]';
        const profiles = JSON.parse(tempProfiles);
        profiles.push(newUser);
        localStorage.setItem('tempUserProfiles', JSON.stringify(profiles));
      } catch (e) {
        console.warn('Erro ao salvar no formato legado:', e);
      }
      
      return newUser;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return null;
    }
  }
  
  // Método para registrar usuário (para compatibilidade com código existente)
  static async registerUser(userData: any): Promise<any> {
    try {
      const user = await this.createUser(userData);
      return user || { error: 'Falha ao registrar usuário' };
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return { error: 'Erro ao registrar usuário' };
    }
  }
  
  // Atualizar um usuário existente
  static async updateUser(id: string, userData: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const existingUser = await this.getUserById(id);
      if (!existingUser) {
        console.error('Usuário não encontrado');
        return null;
      }
      
      // Atualizar dados do usuário
      const updatedUser = {
        ...existingUser,
        ...userData
      };
      
      // Salvar usuário atualizado
      await db.set(`user:${id}`, JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return null;
    }
  }
  
  // Autenticar um usuário
  static async authenticateUser(email: string, password: string): Promise<UserProfile | null> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) return null;
      
      // Verificar senha (em produção, isso deveria usar hash)
      if (user.password !== password) return null;
      
      return user;
    } catch (error) {
      console.error('Erro ao autenticar usuário:', error);
      return null;
    }
  }
  
  // Salvar sessão do usuário
  static saveUserSession(user: UserProfile): void {
    try {
      // Salvar dados da sessão no localStorage
      localStorage.setItem('currentUserProfile', JSON.stringify(user));
      localStorage.setItem('cachedUserDisplayName', user.display_name || user.username || user.full_name);
      
      // Disparar evento de login bem-sucedido
      const loginEvent = new CustomEvent('login-status-changed', {
        detail: { user }
      });
      window.dispatchEvent(loginEvent);
    } catch (error) {
      console.error('Erro ao salvar sessão do usuário:', error);
    }
  }
  
  // Verificar se o usuário está logado
  static isUserLoggedIn(): boolean {
    return localStorage.getItem('currentUserProfile') !== null;
  }
  
  // Obter usuário atual
  static getCurrentUser(): UserProfile | null {
    try {
      const userStr = localStorage.getItem('currentUserProfile');
      if (!userStr) return null;
      
      return JSON.parse(userStr) as UserProfile;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  }
  
  // Fazer logout
  static logout(): void {
    localStorage.removeItem('currentUserProfile');
    localStorage.removeItem('cachedUserDisplayName');
    
    // Disparar evento de logout
    const logoutEvent = new CustomEvent('login-status-changed', {
      detail: { user: null }
    });
    window.dispatchEvent(logoutEvent);
  }
}

// Função para inicializar o banco de dados
export async function initializeDB() {
  try {
    // Verificar se já existe a lista de IDs de usuários
    const userIdsExist = await db.get('user_ids');
    if (!userIdsExist) {
      // Inicializar lista vazia de IDs de usuários
      await db.set('user_ids', '[]');
      console.log('Banco de dados inicializado com sucesso');
    } else {
      console.log('Banco de dados já inicializado');
    }
    return true;
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    // Criar estrutura local para modo offline
    localStorage.setItem('isOfflineMode', 'true');
    if (!localStorage.getItem('user_ids')) {
      localStorage.setItem('user_ids', '[]');
    }
    return false;
  }
}

// Exportar o banco de dados e serviços
export { db };
