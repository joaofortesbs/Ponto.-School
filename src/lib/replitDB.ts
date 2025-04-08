import { generateUserId } from './generate-user-id';

const DB_KEY = 'PS_DATABASE';
const DB_VERSION = '1.0.1'; // Incrementada para nova versão

// Interfaces para usuários e serviço do banco de dados
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  created_at: string;
}

// Estrutura do banco de dados
interface Database {
  users: User[];
  metadata: {
    created_at: string;
    version: string;
    last_updated: string;
  };
}

// Função para inicializar o banco de dados
export const initializeDB = async (): Promise<boolean> => {
  try {
    // Verificar se já existe um banco de dados no localStorage
    let dbExists = false;
    let db: Database;

    try {
      const existingData = localStorage.getItem(DB_KEY);
      if (existingData) {
        db = JSON.parse(existingData);
        dbExists = true;

        // Verificar e atualizar versão se necessário
        if (db.metadata?.version !== DB_VERSION) {
          db.metadata.version = DB_VERSION;
          db.metadata.last_updated = new Date().toISOString();
          localStorage.setItem(DB_KEY, JSON.stringify(db));
          console.log('Banco de dados atualizado para a versão', DB_VERSION);
        }
      } else {
        throw new Error('Banco de dados não encontrado');
      }
    } catch (error) {
      // Criar uma nova estrutura de banco de dados
      db = {
        users: [],
        metadata: {
          created_at: new Date().toISOString(),
          version: DB_VERSION,
          last_updated: new Date().toISOString()
        }
      };
      localStorage.setItem(DB_KEY, JSON.stringify(db));
      console.log('Novo banco de dados inicializado com sucesso');
    }

    // Tentar criar uma usuário demo se o banco estiver vazio
    if (db.users.length === 0) {
      const demoUser: User = {
        id: generateUserId(),
        email: 'demo@pontoschool.com',
        password: 'demo123',
        name: 'Usuário Demo',
        created_at: new Date().toISOString()
      };

      db.users.push(demoUser);
      localStorage.setItem(DB_KEY, JSON.stringify(db));
      console.log('Usuário demo criado para facilitar teste');
    }

    return true;
  } catch (error) {
    console.error('Erro na inicialização do banco de dados:', error);

    // Tentar criar uma estrutura mínima mesmo em caso de erro
    try {
      const fallbackDB = {
        users: [{
          id: 'demo-' + Date.now(),
          email: 'demo@pontoschool.com',
          password: 'demo123',
          name: 'Usuário Demo (Fallback)',
          created_at: new Date().toISOString()
        }],
        metadata: {
          created_at: new Date().toISOString(),
          version: 'fallback-' + DB_VERSION,
          last_updated: new Date().toISOString()
        }
      };
      localStorage.setItem(DB_KEY, JSON.stringify(fallbackDB));
      console.log('Banco de dados de fallback criado após erro');
      return true; // Retornar como sucesso mesmo sendo fallback
    } catch (fallbackError) {
      console.error('Falha crítica na inicialização do banco:', fallbackError);
      return false;
    }
  }
};

// Serviço para gerenciar usuários
export const UserService = {
  // Verifica se um usuário está logado baseado no localStorage
  isUserLoggedIn: () => {
    return !!localStorage.getItem('user');
  },

  // Busca um usuário pelo email
  getUserByEmail: (email: string): User | null => {
    try {
      // Garantir que o DB esteja inicializado
      const dbData = localStorage.getItem(DB_KEY);
      if (!dbData) {
        console.warn('Banco não inicializado ao buscar usuário');
        initializeDB(); // Tentar inicializar
        return null;
      }

      const db = JSON.parse(dbData) as Database;
      return db.users.find((u: User) => u.email === email) || null;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  },

  // Registra um novo usuário
  registerUser: (email: string, password: string, name: string): boolean => {
    try {
      // Garantir que o DB esteja inicializado
      const dbData = localStorage.getItem(DB_KEY);
      if (!dbData) {
        console.warn('Banco não inicializado ao registrar usuário');
        initializeDB(); // Tentar inicializar
      }

      const db = JSON.parse(localStorage.getItem(DB_KEY) || '{"users": []}') as Database;

      // Verificar se o e-mail já existe
      if (db.users.some((u: User) => u.email === email)) {
        console.warn('Usuário já existe com o email:', email);
        return false;
      }

      // Criar novo usuário
      const newUser: User = {
        id: generateUserId(),
        email,
        password, // Nota: Em produção, usar hash seguro
        name,
        created_at: new Date().toISOString()
      };

      // Adicionar ao banco
      db.users.push(newUser);
      db.metadata.last_updated = new Date().toISOString();
      localStorage.setItem(DB_KEY, JSON.stringify(db));

      // Armazenar usuário logado (sem a senha)
      const { password: _, ...userWithoutPassword } = newUser;
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      console.log('Usuário registrado com sucesso:', email);

      return true;
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return false;
    }
  },

  // Realiza login
  loginUser: (email: string, password: string): boolean => {
    try {
      // Tentar login com o usuário demo para diagnóstico
      if (email === 'demo@pontoschool.com' && password === 'demo123') {
        const demoUser = {
          id: 'demo-' + Date.now(),
          email: 'demo@pontoschool.com',
          name: 'Usuário Demo',
          created_at: new Date().toISOString()
        };

        localStorage.setItem('user', JSON.stringify(demoUser));
        console.log('Login com usuário demo realizado');
        return true;
      }

      const user = UserService.getUserByEmail(email);

      if (!user) {
        console.warn('Usuário não encontrado no login:', email);
        return false;
      }

      if (user.password === password) {
        // Armazenar usuário logado (sem a senha)
        const { password: _, ...userWithoutPassword } = user;
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        console.log('Login realizado com sucesso:', email);
        return true;
      }

      console.warn('Senha incorreta para usuário:', email);
      return false;
    } catch (error) {
      console.error('Erro no processo de login:', error);
      return false;
    }
  },

  // Realiza logout
  logoutUser: (): void => {
    localStorage.removeItem('user');
    console.log('Logout realizado com sucesso');
  },

  // Obtém o usuário atual
  getCurrentUser: (): Omit<User, 'password'> | null => {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  },

  // Obter nome do usuário atual
  getCurrentUserName: (): string => {
    try {
      const user = UserService.getCurrentUser();
      return user?.name || 'Usuário';
    } catch (error) {
      return 'Usuário';
    }
  }
};