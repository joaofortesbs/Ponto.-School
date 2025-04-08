
import { Database } from '@replit/database';

// Inicializar o banco de dados do Replit
const db = new Database();

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
      
      // Salvar usuário no banco de dados
      await db.set(`user:${id}`, JSON.stringify(newUser));
      
      // Atualizar lista de IDs de usuários
      const userIdsStr = await db.get('user_ids') as string || '[]';
      const userIds = JSON.parse(userIdsStr);
      userIds.push(id);
      await db.set('user_ids', JSON.stringify(userIds));
      
      return newUser;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return null;
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
      console.log('Banco de dados inicializado');
    }
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
  }
}

// Exportar o banco de dados e serviços
export { db };
