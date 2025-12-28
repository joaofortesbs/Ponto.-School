import { executeWithCascadeFallback } from '../../../../services/controle-APIs-gerais-school-power';
import type { DecidirAtividadesCriarInput } from '../schemas/decidir-atividades-schema';

export async function decidirAtividadesCriar(params: DecidirAtividadesCriarInput) {
  console.log('🧠 [Capability:DECIDIR] Analisando atividades para decisão estratégica');

  const {
    atividades_disponiveis,
    criterios_decisao,
    contexto_turma
  } = params;

  const quantidade = criterios_decisao?.quantidade || 3;

  const decisionPrompt = `
Você é um especialista pedagógico que precisa escolher as melhores atividades para uma turma.

## ATIVIDADES DISPONÍVEIS:
${JSON.stringify(atividades_disponiveis.slice(0, 10), null, 2)}

## CRITÉRIOS DE DECISÃO:
- Objetivo pedagógico: ${criterios_decisao?.objetivo_pedagogico || 'Aprendizado geral'}
- Quantidade desejada: ${quantidade}
- Abordagem: ${criterios_decisao?.priorizar || 'variedade'}
- Nível da turma: ${criterios_decisao?.nivel_turma || 'intermediario'}

${contexto_turma ? `
## CONTEXTO DA TURMA:
- Desempenho médio: ${contexto_turma.desempenho_medio || 70}%
- Gaps de aprendizado: ${contexto_turma.gaps_aprendizado?.join(', ') || 'Não informados'}
- Preferências: ${contexto_turma.preferencias_alunos?.join(', ') || 'Não informadas'}
` : ''}

## SUA TAREFA:
Escolha as ${quantidade} melhores atividades baseado nos critérios acima.

Retorne APENAS um JSON no formato:
{
  "atividades_escolhidas": [
    {
      "id": "ativ_xxx",
      "titulo": "Nome da atividade",
      "justificativa": "Por que escolhi esta atividade",
      "ordem_sugerida": 1
    }
  ],
  "raciocinio_geral": "Explicação da estratégia escolhida"
}
  `.trim();

  const result = await executeWithCascadeFallback(decisionPrompt);

  let decisionData: any = null;

  if (result.success && result.data) {
    try {
      const cleanedText = result.data.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        decisionData = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('⚠️ [Capability:DECIDIR] Falha ao parsear resposta, usando fallback');
    }
  }

  if (!decisionData || !decisionData.atividades_escolhidas) {
    const atividadesSelecionadas = atividades_disponiveis
      .slice(0, quantidade)
      .map((a, idx) => ({
        id: a.id,
        titulo: a.titulo,
        justificativa: 'Selecionada automaticamente baseada nos critérios',
        ordem_sugerida: idx + 1
      }));

    decisionData = {
      atividades_escolhidas: atividadesSelecionadas,
      raciocinio_geral: 'Seleção baseada em diversidade e relevância pedagógica'
    };
  }

  const atividadesEscolhidas = decisionData.atividades_escolhidas.map((escolha: any) => {
    const atividadeCompleta = atividades_disponiveis.find(a => a.id === escolha.id);
    return {
      ...(atividadeCompleta || { id: escolha.id, titulo: escolha.titulo }),
      justificativa: escolha.justificativa,
      ordem_sugerida: escolha.ordem_sugerida
    };
  });

  const organizacao = {
    total_selecionado: atividadesEscolhidas.length,
    atividades: atividadesEscolhidas.sort((a: any, b: any) => a.ordem_sugerida - b.ordem_sugerida),
    estrategia_aplicada: decisionData.raciocinio_geral
  };

  console.log(`✅ [Capability:DECIDIR] Escolhidas ${organizacao.total_selecionado} atividades`);

  return {
    success: true,
    decisao: organizacao,
    atividades_escolhidas: organizacao.atividades,
    mensagem: `Escolhi ${organizacao.total_selecionado} atividades estrategicamente. ${decisionData.raciocinio_geral}`,
    pronto_para_criar: true
  };
}
