/**
 * CAPABILITY 1: pesquisar_atividades_conta
 * 
 * Responsabilidade: Buscar atividades que o professor já criou anteriormente
 * no sistema, armazenadas no banco de dados Neon PostgreSQL.
 * 
 * Fonte de Dados: Neon PostgreSQL (via DATABASE_URL)
 */

import { 
  AtividadeFromDB, 
  AtividadeForAI, 
  SearchAccountActivitiesResult,
  transformDBtoAI 
} from '../../shared/types';

interface PesquisarContaParams {
  professor_id: string;
  limit?: number;
  include_drafts?: boolean;
  disciplina?: string;
  tipo?: string;
}

const MAX_RETRIES = 2;
const QUERY_TIMEOUT = 10000;
const DEFAULT_LIMIT = 100;

async function executeQuery(query: string, params: any[]): Promise<any[]> {
  const response = await fetch('/api/database/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, params }),
    signal: AbortSignal.timeout(QUERY_TIMEOUT)
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Database query failed: ${error}`);
  }
  
  const result = await response.json();
  return result.rows || [];
}

export async function pesquisarAtividadesConta(
  params: PesquisarContaParams
): Promise<SearchAccountActivitiesResult> {
  const startTime = Date.now();
  console.log('🔍 [Capability:PESQUISAR_CONTA] Iniciando busca no banco de dados Neon');
  console.log(`   Professor ID: ${params.professor_id}`);
  
  const { 
    professor_id, 
    limit = DEFAULT_LIMIT,
    include_drafts = false,
    disciplina,
    tipo
  } = params;

  if (!professor_id) {
    console.error('❌ [Capability:PESQUISAR_CONTA] Professor ID é obrigatório');
    return {
      found: false,
      count: 0,
      activities: null,
      metadata: {
        query_timestamp: new Date().toISOString(),
        professor_id: 'invalid',
        database: "neon_production"
      },
      isEmpty: true,
      summary: "Erro: Professor ID não fornecido"
    };
  }

  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`   Tentativa ${attempt}/${MAX_RETRIES}...`);

      let whereClause = 'WHERE professor_id = $1';
      const queryParams: any[] = [professor_id];
      let paramIndex = 2;

      if (!include_drafts) {
        whereClause += ` AND (status IS NULL OR status != 'draft')`;
      }

      if (disciplina) {
        whereClause += ` AND disciplina = $${paramIndex}`;
        queryParams.push(disciplina);
        paramIndex++;
      }

      if (tipo) {
        whereClause += ` AND tipo = $${paramIndex}`;
        queryParams.push(tipo);
        paramIndex++;
      }

      const query = `
        SELECT 
          id,
          titulo,
          tipo,
          disciplina,
          conteudo,
          campos_preenchidos,
          created_at,
          updated_at,
          professor_id,
          status,
          turma_id
        FROM atividades
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex}
      `;
      queryParams.push(limit);

      const rows = await executeQuery(query, queryParams);

      const dbActivities: AtividadeFromDB[] = rows.map(row => ({
        id: row.id,
        titulo: row.titulo || 'Atividade sem título',
        tipo: row.tipo || 'atividade',
        disciplina: row.disciplina || 'geral',
        conteudo: row.conteudo,
        campos_preenchidos: row.campos_preenchidos,
        created_at: new Date(row.created_at),
        updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
        professor_id: row.professor_id,
        status: row.status,
        turma_id: row.turma_id
      }));

      const activitiesForAI = transformDBtoAI(dbActivities);

      const elapsedTime = Date.now() - startTime;
      console.log(`✅ [Capability:PESQUISAR_CONTA] Busca concluída em ${elapsedTime}ms`);
      console.log(`   Encontradas: ${activitiesForAI.length} atividades`);

      return {
        found: activitiesForAI.length > 0,
        count: activitiesForAI.length,
        activities: activitiesForAI,
        metadata: {
          query_timestamp: new Date().toISOString(),
          professor_id,
          database: "neon_production"
        },
        isEmpty: activitiesForAI.length === 0,
        summary: activitiesForAI.length > 0 
          ? `Encontradas ${activitiesForAI.length} atividade(s) criada(s) anteriormente pelo professor`
          : "Nenhuma atividade encontrada - Este é um professor novo no sistema"
      };

    } catch (error) {
      lastError = error as Error;
      console.warn(`⚠️ [Capability:PESQUISAR_CONTA] Erro na tentativa ${attempt}:`, error);
      
      if (attempt < MAX_RETRIES) {
        const backoffMs = Math.pow(2, attempt) * 500;
        console.log(`   Aguardando ${backoffMs}ms antes de tentar novamente...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
  }

  console.error('❌ [Capability:PESQUISAR_CONTA] Todas as tentativas falharam');
  
  return {
    found: false,
    count: 0,
    activities: null,
    metadata: {
      query_timestamp: new Date().toISOString(),
      professor_id,
      database: "neon_production"
    },
    isEmpty: true,
    summary: `Erro ao buscar atividades: ${lastError?.message || 'Erro desconhecido'}. O professor pode continuar sem dados históricos.`
  };
}

export function formatAccountActivitiesForPrompt(result: SearchAccountActivitiesResult): string {
  return `
DADOS DE ATIVIDADES NA CONTA DO PROFESSOR:
- Total encontrado: ${result.count}
- Status: ${result.isEmpty ? "VAZIO - Nenhuma atividade criada ainda" : "DADOS DISPONÍVEIS"}
- Banco de dados: ${result.metadata.database}
- Timestamp: ${result.metadata.query_timestamp}

${result.activities && result.activities.length > 0 ? `
ATIVIDADES ANTERIORES DO PROFESSOR:
${result.activities.map((a, idx) => `
${idx + 1}. ${a.titulo}
   - ID: ${a.id}
   - Tipo: ${a.tipo}
   - Disciplina: ${a.metadata.disciplina}
   - Criada em: ${a.created_at}
   - Sucesso anterior: ${a.was_successful ? 'Sim' : 'Não'}
`).join('')}
` : `
⚠️ PROFESSOR NOVO: Nenhuma atividade anterior encontrada.
Você pode criar atividades do zero sem referência a trabalhos anteriores.
`}

IMPORTANTE: 
- Se count = 0, NÃO mencione atividades anteriores do professor
- Use APENAS os dados listados acima como referência histórica
- NÃO invente atividades que o professor não criou
  `.trim();
}
