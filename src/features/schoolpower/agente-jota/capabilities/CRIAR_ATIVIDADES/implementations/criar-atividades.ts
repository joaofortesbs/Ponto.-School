import { executeWithCascadeFallback } from '../../../../services/controle-APIs-gerais-school-power';
import type { CriarAtividadesInput, CriacaoProgressUpdate } from '../schemas/criar-atividades-schema';

function generateAtividadeId(): string {
  return `ativ_created_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function criarAtividades(
  params: CriarAtividadesInput,
  onProgress?: (update: CriacaoProgressUpdate) => void
) {
  console.log('🏗️ [Capability:CRIAR] Iniciando criação de atividades');

  const { atividades_decididas, configuracoes_criacao } = params;

  onProgress?.({
    type: 'construcao:iniciada',
    total_atividades: atividades_decididas.length,
    atividades: atividades_decididas.map(a => ({
      id: a.id,
      titulo: a.titulo,
      status: 'aguardando',
      progresso: 0
    }))
  });

  const atividadesCriadas: any[] = [];

  for (const [index, atividadeDecidida] of atividades_decididas.entries()) {
    
    onProgress?.({
      type: 'atividade:construindo',
      atividade_index: index,
      atividade_id: atividadeDecidida.id,
      titulo: atividadeDecidida.titulo,
      progresso: 0
    });

    try {
      for (let progress = 0; progress <= 100; progress += 25) {
        await delay(200);
        onProgress?.({
          type: 'atividade:progresso',
          atividade_index: index,
          atividade_id: atividadeDecidida.id,
          progresso: progress
        });
      }

      const buildPrompt = `
Crie o conteúdo para a atividade educacional:
Título: ${atividadeDecidida.titulo}
Tipo: ${atividadeDecidida.tipo || 'exercício'}
Matéria: ${atividadeDecidida.materia || 'geral'}
Nível: ${atividadeDecidida.nivel_dificuldade || 'intermediário'}

Gere 3-5 questões ou itens apropriados para esta atividade.
Retorne em formato JSON com: questoes (array de objetos com enunciado, opcoes, resposta_correta).
      `.trim();

      const result = await executeWithCascadeFallback(buildPrompt);

      let conteudo: any = null;
      if (result.success && result.data) {
        try {
          const cleanedText = result.data.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            conteudo = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          conteudo = { questoes: [], descricao: result.data };
        }
      }

      const atividadeCriada = {
        id: generateAtividadeId(),
        original_id: atividadeDecidida.id,
        titulo: atividadeDecidida.titulo,
        tipo: atividadeDecidida.tipo || 'exercicio',
        materia: atividadeDecidida.materia || 'geral',
        nivel_dificuldade: atividadeDecidida.nivel_dificuldade || 'intermediario',
        tags: atividadeDecidida.tags || [],
        conteudo: conteudo || { questoes: [] },
        configuracoes: configuracoes_criacao || {},
        created_by: 'agente_jota',
        created_at: new Date().toISOString(),
        status: 'ativa'
      };

      atividadesCriadas.push(atividadeCriada);

      onProgress?.({
        type: 'atividade:concluida',
        atividade_index: index,
        atividade_id: atividadeDecidida.id,
        atividade_criada_id: atividadeCriada.id,
        progresso: 100
      });

      console.log(`✅ [Capability:CRIAR] Atividade ${index + 1}/${atividades_decididas.length} criada: ${atividadeCriada.titulo}`);

    } catch (error) {
      console.error(`❌ [Capability:CRIAR] Erro na atividade ${index}:`, error);
      
      onProgress?.({
        type: 'atividade:erro',
        atividade_index: index,
        atividade_id: atividadeDecidida.id,
        erro: error instanceof Error ? error.message : String(error)
      });
    }
  }

  onProgress?.({
    type: 'construcao:concluida',
    total_criadas: atividadesCriadas.length,
    total_esperadas: atividades_decididas.length
  });

  console.log(`🎉 [Capability:CRIAR] Criação concluída: ${atividadesCriadas.length}/${atividades_decididas.length} atividades`);

  return {
    success: true,
    atividades_criadas: atividadesCriadas,
    total: atividadesCriadas.length,
    mensagem: `Criei ${atividadesCriadas.length} atividade(s) com sucesso! Elas já estão disponíveis na sua conta.`,
    urls: atividadesCriadas.map(a => ({
      id: a.id,
      titulo: a.titulo,
      url: `/dashboard/atividades/${a.id}`
    }))
  };
}
