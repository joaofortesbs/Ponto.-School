
// Configuração do banco Neon para o ambiente client-side
const DATABASE_URL = import.meta.env.VITE_DATABASE_URL || process.env.DATABASE_URL;

interface QueryResult {
  success: boolean;
  data?: any[];
  error?: string;
  rowCount?: number;
}

// Função para fazer requisições HTTP para a API do banco
async function executeHttpQuery(query: string, params: any[] = []): Promise<QueryResult> {
  try {
    const response = await fetch('/api/database', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        params
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Erro ao executar query:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

// Função para testar a conexão
export async function testConnection() {
  try {
    const result = await executeHttpQuery('SELECT NOW() as timestamp');
    if (result.success && result.data?.[0]) {
      return { success: true, timestamp: result.data[0].timestamp };
    }
    return { success: false, error: 'Falha na conexão' };
  } catch (error) {
    console.error('Erro na conexão com o banco:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro na conexão' 
    };
  }
}

// Função para executar queries
export async function executeQuery(query: string, params: any[] = []): Promise<QueryResult> {
  return executeHttpQuery(query, params);
}

// Pool e Client placeholders para compatibilidade (não usados no browser)
export const pool = null;
export const createClient = () => null;
