import { executeWithCascadeFallback } from '../../../../services/controle-APIs-gerais-school-power';
import type { CriarAtividadesInput, CriacaoProgressUpdate } from '../schemas/criar-atividades-schema';
import type { AtividadeEscolhida } from '../../DECIDIR/schemas/decidir-atividades-schema';

function generateAtividadeId(): string {
  return `ativ_created_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface AtividadeDecidida {
  id: string;
  titulo: string;
  tipo?: string;
  materia?: string;
  nivel_dificuldade?: string;
  tags?: string[];
  campos_preenchidos?: Record<string, any>;
  justificativa?: string;
  ordem_sugerida?: number;
}

export async function criarAtividades(
  params: CriarAtividadesInput & { atividades_decididas: AtividadeDecidida[] },
  onProgress?: (update: CriacaoProgressUpdate) => void
) {
  console.log('🏗️ [CRIAR] Iniciando capability criar-atividades');
  console.log(`📊 [CRIAR] Total de atividades a criar: ${params.atividades_decididas.length}`);

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

  window.dispatchEvent(new CustomEvent('agente-jota-progress', {
    detail: {
      type: 'construcao:iniciada',
      total_atividades: atividades_decididas.length,
      atividades: atividades_decididas.map(a => ({
        id: a.id,
        titulo: a.titulo,
        status: 'aguardando',
        progresso: 0
      }))
    }
  }));

  const atividadesCriadas: any[] = [];

  for (const [index, atividadeDecidida] of atividades_decididas.entries()) {
    
    console.log(`\n🔨 [CRIAR] Construindo atividade ${index + 1}/${atividades_decididas.length}: ${atividadeDecidida.titulo}`);

    onProgress?.({
      type: 'atividade:construindo',
      atividade_index: index,
      atividade_id: atividadeDecidida.id,
      titulo: atividadeDecidida.titulo,
      progresso: 0
    });

    window.dispatchEvent(new CustomEvent('agente-jota-progress', {
      detail: {
        type: 'atividade:construindo',
        atividade_index: index,
        atividade_id: atividadeDecidida.id,
        titulo: atividadeDecidida.titulo,
        progresso: 0
      }
    }));

    try {
      for (let progress = 0; progress <= 75; progress += 25) {
        await delay(300);
        onProgress?.({
          type: 'atividade:progresso',
          atividade_index: index,
          atividade_id: atividadeDecidida.id,
          progresso: progress
        });
        
        window.dispatchEvent(new CustomEvent('agente-jota-progress', {
          detail: {
            type: 'atividade:progresso',
            atividade_index: index,
            atividade_id: atividadeDecidida.id,
            progresso: progress
          }
        }));
      }

      const camposJaPreenchidos = atividadeDecidida.campos_preenchidos || {};
      const temCamposPreenchidos = Object.keys(camposJaPreenchidos).length > 0;

      let conteudoFinal: Record<string, any>;

      if (temCamposPreenchidos) {
        console.log(`✅ [CRIAR] Usando campos já preenchidos pela capability DECIDIR`);
        console.log(`📦 [CRIAR] Total de campos: ${Object.keys(camposJaPreenchidos).length}`);
        
        conteudoFinal = {
          ...camposJaPreenchidos,
          _meta: {
            gerado_por: 'capability_decidir',
            preenchido_em: new Date().toISOString()
          }
        };
      } else {
        console.log(`⚠️ [CRIAR] Sem campos preenchidos, gerando conteúdo via IA...`);
        
        const buildPrompt = `
Crie o conteúdo completo para a atividade educacional:
Título: ${atividadeDecidida.titulo}
Tipo: ${atividadeDecidida.tipo || 'exercício'}
Matéria: ${atividadeDecidida.materia || 'geral'}
Nível: ${atividadeDecidida.nivel_dificuldade || 'intermediário'}

Gere conteúdo educacional de alta qualidade apropriado para esta atividade.
Retorne em formato JSON com os campos necessários para o tipo de atividade.
        `.trim();

        const result = await executeWithCascadeFallback(buildPrompt);

        if (result.success && result.data) {
          try {
            const cleanedText = result.data.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              conteudoFinal = JSON.parse(jsonMatch[0]);
            } else {
              conteudoFinal = { conteudo: result.data };
            }
          } catch (e) {
            conteudoFinal = { descricao: result.data };
          }
        } else {
          conteudoFinal = { 
            titulo: atividadeDecidida.titulo,
            descricao: 'Conteúdo gerado automaticamente'
          };
        }
      }

      onProgress?.({
        type: 'atividade:progresso',
        atividade_index: index,
        atividade_id: atividadeDecidida.id,
        progresso: 90
      });

      window.dispatchEvent(new CustomEvent('agente-jota-progress', {
        detail: {
          type: 'atividade:progresso',
          atividade_index: index,
          atividade_id: atividadeDecidida.id,
          progresso: 90
        }
      }));

      await delay(200);

      const atividadeCriada = {
        id: generateAtividadeId(),
        original_id: atividadeDecidida.id,
        titulo: atividadeDecidida.titulo,
        tipo: atividadeDecidida.tipo || 'atividade',
        materia: atividadeDecidida.materia || 'geral',
        nivel_dificuldade: atividadeDecidida.nivel_dificuldade || 'intermediario',
        tags: atividadeDecidida.tags || [],
        campos: conteudoFinal,
        justificativa: atividadeDecidida.justificativa,
        configuracoes: configuracoes_criacao || {},
        created_by: 'agente_jota_school_power_2',
        created_at: new Date().toISOString(),
        status: 'ativa'
      };

      atividadesCriadas.push(atividadeCriada);

      console.log(`✅ [CRIAR] Atividade criada com ID: ${atividadeCriada.id}`);

      onProgress?.({
        type: 'atividade:concluida',
        atividade_index: index,
        atividade_id: atividadeDecidida.id,
        atividade_criada_id: atividadeCriada.id,
        progresso: 100
      });

      window.dispatchEvent(new CustomEvent('agente-jota-progress', {
        detail: {
          type: 'atividade:concluida',
          atividade_index: index,
          atividade_id: atividadeDecidida.id,
          atividade_criada_id: atividadeCriada.id,
          progresso: 100
        }
      }));

    } catch (error) {
      console.error(`❌ [CRIAR] Erro na atividade ${index}:`, error);
      
      onProgress?.({
        type: 'atividade:erro',
        atividade_index: index,
        atividade_id: atividadeDecidida.id,
        erro: error instanceof Error ? error.message : String(error)
      });

      window.dispatchEvent(new CustomEvent('agente-jota-progress', {
        detail: {
          type: 'atividade:erro',
          atividade_index: index,
          atividade_id: atividadeDecidida.id,
          erro: error instanceof Error ? error.message : String(error)
        }
      }));
    }
  }

  onProgress?.({
    type: 'construcao:concluida',
    total_criadas: atividadesCriadas.length,
    total_esperadas: atividades_decididas.length
  });

  window.dispatchEvent(new CustomEvent('agente-jota-progress', {
    detail: {
      type: 'construcao:concluida',
      total_criadas: atividadesCriadas.length,
      total_esperadas: atividades_decididas.length
    }
  }));

  console.log(`🎉 [CRIAR] Construção concluída: ${atividadesCriadas.length}/${atividades_decididas.length} atividades`);

  return {
    success: true,
    atividades_criadas: atividadesCriadas,
    total: atividadesCriadas.length,
    mensagem: `Criei ${atividadesCriadas.length} atividade(s) com sucesso! Elas já estão disponíveis na sua conta.`,
    urls: atividadesCriadas.map(a => ({
      id: a.id,
      titulo: a.titulo,
      url: `/dashboard/atividades/${a.id}`,
      url_editar: `/dashboard/atividades/${a.id}/editar`
    }))
  };
}
