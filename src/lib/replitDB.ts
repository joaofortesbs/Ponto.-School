import { Database } from '@replit/database';

// Serviço de usuário simplificado usando o Replit Database
export class UserService {
  private db: Database;
  private initialized: boolean = false;
  private offlineMode: boolean = false;

  constructor(db: Database) {
    this.db = db;
    this.offlineMode = localStorage.getItem('isOfflineMode') === 'true';
  }

  async init() {
    try {
      if (this.offlineMode) {
        console.log("Inicializando em modo offline usando localStorage");
        if (!localStorage.getItem('users')) {
          localStorage.setItem('users', JSON.stringify([]));
        }
        this.initialized = true;
        return true;
      }

      // Inicializar o banco de dados, se necessário
      const hasUsers = await this.db.get('hasUsers');
      if (!hasUsers) {
        await this.db.set('hasUsers', true);
        await this.db.set('users', JSON.stringify([]));
      }
      this.initialized = true;

      // Sincronizar dados do localStorage, se existirem
      this.syncFromLocalStorage();

      return true;
    } catch (error) {
      console.error('Error initializing UserService:', error);
      // Fallback para localStorage
      this.offlineMode = true;
      localStorage.setItem('isOfflineMode', 'true');

      if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
      }
      this.initialized = true;
      return true; // Retornar true mesmo em fallback para não bloquear a aplicação
    }
  }

  // Sincronizar dados do localStorage para o DB quando estiver online
  private async syncFromLocalStorage() {
    try {
      const localUsers = localStorage.getItem('users');
      if (localUsers) {
        const usersToSync = JSON.parse(localUsers);
        if (usersToSync.length > 0) {
          const currentUsersStr = await this.db.get('users') as string;
          const currentUsers = JSON.parse(currentUsersStr || '[]');

          // Mesclar usuários locais com usuários do banco de dados
          const mergedUsers = [...currentUsers];

          for (const localUser of usersToSync) {
            const existingIndex = mergedUsers.findIndex((u: any) => u.email === localUser.email);
            if (existingIndex === -1) {
              mergedUsers.push(localUser);
            }
          }

          await this.db.set('users', JSON.stringify(mergedUsers));
          console.log("Usuários sincronizados do localStorage para o banco de dados");
        }
      }
    } catch (error) {
      console.error("Erro ao sincronizar usuários do localStorage:", error);
    }
  }

  async createUser(user: any) {
    try {
      if (!this.initialized) await this.init();

      if (this.offlineMode) {
        const usersStr = localStorage.getItem('users') || '[]';
        const users = JSON.parse(usersStr);

        // Verificar se o email já existe
        const existingUser = users.find((u: any) => u.email === user.email);
        if (existingUser) {
          return { error: 'User with this email already exists' };
        }

        // Adicionar novo usuário
        const newUser = {
          ...user,
          id: `user_${Date.now()}`,
          createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        return { user: newUser };
      }

      const usersStr = await this.db.get('users') as string;
      const users = JSON.parse(usersStr || '[]');

      // Verificar se o email já existe
      const existingUser = users.find((u: any) => u.email === user.email);
      if (existingUser) {
        return { error: 'User with this email already exists' };
      }

      // Adicionar novo usuário
      const newUser = {
        ...user,
        id: `user_${Date.now()}`,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      await this.db.set('users', JSON.stringify(users));

      // Também salvar no localStorage para uso offline
      localStorage.setItem('currentUser', JSON.stringify(newUser));

      // Atualizar também o cache local
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
      localUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(localUsers));

      return { user: newUser };
    } catch (error) {
      console.error('Error creating user:', error);

      // Tentar criar no localStorage em caso de erro
      try {
        const usersStr = localStorage.getItem('users') || '[]';
        const users = JSON.parse(usersStr);

        // Adicionar novo usuário
        const newUser = {
          ...user,
          id: `user_${Date.now()}`,
          createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(newUser));

        return { user: newUser };
      } catch (localError) {
        return { error: 'Failed to create user in any storage' };
      }
    }
  }

  async getUserByEmail(email: string) {
    try {
      if (!this.initialized) await this.init();

      if (this.offlineMode) {
        const usersStr = localStorage.getItem('users') || '[]';
        const users = JSON.parse(usersStr);

        const user = users.find((u: any) => u.email === email);

        return user ? { user } : { error: 'User not found' };
      }

      const usersStr = await this.db.get('users') as string;
      const users = JSON.parse(usersStr || '[]');

      const user = users.find((u: any) => u.email === email);

      if (user) {
        // Salvar usuário atual no localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
      }

      return user ? { user } : { error: 'User not found' };
    } catch (error) {
      console.error('Error getting user by email:', error);

      // Fallback para localStorage
      try {
        const usersStr = localStorage.getItem('users') || '[]';
        const users = JSON.parse(usersStr);

        const user = users.find((u: any) => u.email === email);

        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }

        return user ? { user } : { error: 'User not found' };
      } catch (localError) {
        return { error: 'Failed to get user from any storage' };
      }
    }
  }

  async updateUser(id: string, updates: any) {
    try {
      if (!this.initialized) await this.init();

      if (this.offlineMode) {
        const usersStr = localStorage.getItem('users') || '[]';
        const users = JSON.parse(usersStr);

        const userIndex = users.findIndex((u: any) => u.id === id);

        if (userIndex === -1) {
          return { error: 'User not found' };
        }

        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem('users', JSON.stringify(users));

        // Atualizar também o usuário atual
        if (JSON.parse(localStorage.getItem('currentUser') || '{}').id === id) {
          localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
        }

        return { user: users[userIndex] };
      }

      const usersStr = await this.db.get('users') as string;
      const users = JSON.parse(usersStr || '[]');

      const userIndex = users.findIndex((u: any) => u.id === id);

      if (userIndex === -1) {
        return { error: 'User not found' };
      }

      users[userIndex] = { ...users[userIndex], ...updates };
      await this.db.set('users', JSON.stringify(users));

      // Atualizar também o cache local
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const localUserIndex = localUsers.findIndex((u: any) => u.id === id);
      if (localUserIndex !== -1) {
        localUsers[localUserIndex] = { ...localUsers[localUserIndex], ...updates };
        localStorage.setItem('users', JSON.stringify(localUsers));
      }

      // Atualizar também o usuário atual
      if (JSON.parse(localStorage.getItem('currentUser') || '{}').id === id) {
        localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
      }

      return { user: users[userIndex] };
    } catch (error) {
      console.error('Error updating user:', error);

      // Fallback para localStorage
      try {
        const usersStr = localStorage.getItem('users') || '[]';
        const users = JSON.parse(usersStr);

        const userIndex = users.findIndex((u: any) => u.id === id);

        if (userIndex === -1) {
          return { error: 'User not found' };
        }

        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem('users', JSON.stringify(users));

        // Atualizar também o usuário atual
        if (JSON.parse(localStorage.getItem('currentUser') || '{}').id === id) {
          localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
        }

        return { user: users[userIndex] };
      } catch (localError) {
        return { error: 'Failed to update user in any storage' };
      }
    }
  }

  async getCurrentUser() {
    // Obter usuário atual do localStorage (mais rápido)
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      return { user: JSON.parse(storedUser) };
    }
    return { error: 'No user currently logged in' };
  }
}

// Inicializar o banco de dados
let dbService: UserService | null = null;

export async function initializeDB() {
  try {
    console.log("Iniciando banco de dados Replit...");

    // Tentar inicializar o banco de dados com 3 tentativas
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const db = new Database();
        dbService = new UserService(db);
        const success = await dbService.init();
        console.log(`Banco de dados inicializado com sucesso (tentativa ${attempt + 1})`);

        // Registrar como global para fácil acesso
        (window as any).userService = dbService;

        return success;
      } catch (error) {
        console.error(`Falha na tentativa ${attempt + 1} de inicializar DB:`, error);

        if (attempt < 2) {
          // Esperar um pouco antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // Se todas as tentativas falharem, inicializar em modo offline
    console.log("Todas as tentativas falharam, inicializando em modo offline");
    localStorage.setItem('isOfflineMode', 'true');

    const db = {
      get: async () => null,
      set: async () => null
    } as any;

    dbService = new UserService(db as Database);
    await dbService.init();

    // Registrar como global para fácil acesso
    (window as any).userService = dbService;

    return true;
  } catch (error) {
    console.error('Erro crítico inicializando DB:', error);
    // Garantir que a aplicação continue mesmo com erro
    localStorage.setItem('isOfflineMode', 'true');
    return true;
  }
}

// Função para obter o serviço de usuário
export function getUserService() {
  if (!dbService) {
    // Se não estiver inicializado, inicializar imediatamente
    initializeDB();
  }
  return dbService;
}