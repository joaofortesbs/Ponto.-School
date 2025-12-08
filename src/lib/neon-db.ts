
// Cliente TypeScript para interagir com a API Neon
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const response = await fetch('/api/database', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, params })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Erro ao executar query:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Verificar se uma tabela existe
export async function tableExists(tableName: string): Promise<boolean> {
  const query = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    );
  `;
  
  const result = await executeQuery(query, [tableName]);
  return result.success && result.data?.[0]?.exists;
}

// Funções específicas para perfis (com deduplicação centralizada)
export async function findProfileByEmail(email: string) {
  const { fetchProfileByEmail } = await import('@/lib/profile-api');
  return fetchProfileByEmail(email);
}

export async function findProfileByUsername(username: string) {
  try {
    const response = await fetch(`/api/perfis?username=${encodeURIComponent(username)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    return await response.json();
  } catch (error) {
    console.error('❌ Erro ao buscar perfil por username:', error);
    return { success: false, error: 'Erro ao buscar perfil' };
  }
}

export async function findProfileById(id: string) {
  const { fetchProfileById } = await import('@/lib/profile-api');
  return fetchProfileById(id);
}

export async function createProfile(profileData: {
  nome_completo: string;
  nome_usuario: string;
  email: string;
  senha: string;
  tipo_conta: string;
  pais?: string;
  estado: string;
  instituicao_ensino: string;
}) {
  try {
    const response = await fetch('/api/perfis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData)
    });

    return await response.json();
  } catch (error) {
    console.error('❌ Erro ao criar perfil:', error);
    return { success: false, error: 'Erro ao criar perfil' };
  }
}
