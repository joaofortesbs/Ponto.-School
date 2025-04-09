
// Implementação simplificada de um serviço de usuários usando localStorage

interface User {
  id: string;
  email: string;
  password: string;
  full_name?: string;
  display_name?: string;
  avatar?: string | null;
  createdAt: string;
  [key: string]: any;
}

interface UserServiceResponse {
  user?: User | null;
  error?: string | null;
}

export class UserService {
  // Método para criar um novo usuário
  async createUser(userData: Partial<User>): Promise<UserServiceResponse> {
    try {
      // Verificar se já existe um usuário com o mesmo email
      const existingUsers = this.getAllUsers();
      const existingUser = existingUsers.find(user => user.email === userData.email);
      
      if (existingUser) {
        return { error: 'Usuário com este email já existe' };
      }
      
      // Criar novo usuário
      const user: User = {
        id: userData.id || `user_${Date.now()}`,
        email: userData.email || '',
        password: userData.password || '',
        createdAt: userData.createdAt || new Date().toISOString(),
        ...userData
      };
      
      // Salvar no localStorage
      existingUsers.push(user);
      localStorage.setItem('users', JSON.stringify(existingUsers));
      
      return { user };
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return { error: 'Erro ao criar usuário' };
    }
  }
  
  // Método para obter um usuário por email
  async getUserByEmail(email: string): Promise<UserServiceResponse> {
    try {
      const users = this.getAllUsers();
      const user = users.find(user => user.email === email);
      
      if (!user) {
        return { user: null };
      }
      
      return { user };
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return { error: 'Erro ao buscar usuário' };
    }
  }
  
  // Método para obter um usuário por ID
  async getUserById(id: string): Promise<UserServiceResponse> {
    try {
      const users = this.getAllUsers();
      const user = users.find(user => user.id === id);
      
      if (!user) {
        return { user: null };
      }
      
      return { user };
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return { error: 'Erro ao buscar usuário' };
    }
  }
  
  // Método para autenticar um usuário
  async loginUser(email: string, password: string): Promise<UserServiceResponse> {
    try {
      const users = this.getAllUsers();
      const user = users.find(user => user.email === email && user.password === password);
      
      if (!user) {
        return { error: 'Credenciais inválidas' };
      }
      
      // Salvar usuário atual no localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
      
      return { user };
    } catch (error) {
      console.error('Erro ao autenticar usuário:', error);
      return { error: 'Erro ao autenticar usuário' };
    }
  }
  
  // Método para atualizar um usuário
  async updateUser(id: string, userData: Partial<User>): Promise<UserServiceResponse> {
    try {
      let users = this.getAllUsers();
      const userIndex = users.findIndex(user => user.id === id);
      
      if (userIndex === -1) {
        return { error: 'Usuário não encontrado' };
      }
      
      // Atualizar usuário
      users[userIndex] = {
        ...users[userIndex],
        ...userData
      };
      
      // Salvar no localStorage
      localStorage.setItem('users', JSON.stringify(users));
      
      // Se for o usuário atual, atualizar também
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (currentUser.id === id) {
        localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
      }
      
      return { user: users[userIndex] };
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return { error: 'Erro ao atualizar usuário' };
    }
  }
  
  // Método para fazer logout
  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.setItem('isAuthenticated', 'false');
  }
  
  // Método para obter todos os usuários
  getAllUsers(): User[] {
    const usersJson = localStorage.getItem('users');
    return usersJson ? JSON.parse(usersJson) : [];
  }
}

// Criar instância global do serviço
const userService = new UserService();

// Tornar o serviço disponível globalmente
if (typeof window !== 'undefined') {
  (window as any).userService = userService;
}

export { userService };
