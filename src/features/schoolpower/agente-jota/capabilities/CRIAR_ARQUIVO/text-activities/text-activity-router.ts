import type { TextActivityRouterResult, TextActivityTemplate, AutoEvolvedTemplate } from './text-activity-types';
import { detectActivityType, type DetectionResult } from './text-activity-detector';
import { AutoEvolutionEngine } from './auto-evolution-engine';

export async function routeActivityRequest(
  userPrompt: string,
  sessionContext?: string
): Promise<TextActivityRouterResult> {
  console.log(`[TextActivityRouter] 🔀 Roteando pedido: "${userPrompt.substring(0, 80)}..."`);

  const detection: DetectionResult = detectActivityType(userPrompt);
  console.log(`[TextActivityRouter] 📊 Detecção: tipo=${detection.tipo}, confiança=${detection.confianca}, motivo="${detection.motivo}"`);

  if (detection.tipo === 'interativa') {
    console.log(`[TextActivityRouter] ✅ Camada 1: Atividade INTERATIVA detectada → ${detection.interativaId}`);
    return {
      origem: 'interativa',
      template: null,
      templateId: null,
      categoria: null,
      metadata: {
        motivo: detection.motivo,
        confianca: detection.confianca,
        atividadeInterativaId: detection.interativaId!,
      },
    };
  }

  if (detection.tipo === 'template_textual' && detection.template) {
    const template = detection.template;
    const isEvolved = 'usosCount' in template;
    console.log(`[TextActivityRouter] ✅ Camada 2: Template TEXTUAL encontrado → ${template.nome} (${isEvolved ? 'auto-gerado' : 'catálogo'})`);
    return {
      origem: isEvolved ? 'auto_gerada' : 'template_textual',
      template,
      templateId: template.id,
      categoria: 'categoria' in template ? (template as TextActivityTemplate).categoria : 'auto_gerada',
      metadata: {
        motivo: detection.motivo,
        confianca: detection.confianca,
      },
    };
  }

  if (detection.tipo === 'auto_geravel') {
    console.log(`[TextActivityRouter] 🧬 Camada 3: Ativando AUTO-EVOLUÇÃO para pedido inédito`);
    try {
      const evolvedTemplate = await AutoEvolutionEngine.evolve(userPrompt, sessionContext);
      if (evolvedTemplate) {
        console.log(`[TextActivityRouter] ✅ Template auto-gerado com sucesso: ${evolvedTemplate.nome}`);
        return {
          origem: 'auto_gerada',
          template: evolvedTemplate,
          templateId: evolvedTemplate.id,
          categoria: 'auto_gerada',
          metadata: {
            motivo: `Template novo criado por auto-evolução: ${evolvedTemplate.nome}`,
            confianca: 'media',
          },
        };
      }
    } catch (error) {
      console.error('[TextActivityRouter] ❌ Erro na auto-evolução, usando documento_livre:', error);
    }
  }

  console.log(`[TextActivityRouter] 📄 Fallback: usando documento_livre`);
  return {
    origem: 'documento_livre',
    template: null,
    templateId: null,
    categoria: null,
    metadata: {
      motivo: 'Nenhuma atividade ou template identificado — usando documento livre',
      confianca: 'baixa',
    },
  };
}

export function isTextActivity(routerResult: TextActivityRouterResult): boolean {
  return routerResult.origem === 'template_textual' || routerResult.origem === 'auto_gerada';
}

const RICH_FORMATTING_INSTRUCTIONS = `

FORMATAÇÃO RICA OBRIGATÓRIA:
Use os seguintes recursos de formatação para criar materiais profissionais e visualmente atraentes:
- **Tabelas markdown** para comparações, rubricas, cronogramas, gabaritos (use | coluna1 | coluna2 |)
- **Listas de tarefas** com checkboxes (- [ ] item) para checklists e planejamentos
- **Callouts/Alertas** para destaques importantes (💡 Dica:, ⚠️ Atenção:, 📌 Importante:)
- **Negrito** para conceitos-chave e termos importantes
- *Itálico* para exemplos e citações
- **Headers hierárquicos** (##, ###, ####) para organizar seções
- **Listas numeradas** para passos sequenciais e questões
- **Listas com marcadores** para itens não sequenciais
- **Separadores** (---) entre seções principais
- ~~Tachado~~ quando mostrar erros comuns a evitar
NÃO retorne JSON — retorne texto formatado em markdown rico e profissional.
`;

export function getPromptForRoute(
  routerResult: TextActivityRouterResult,
  solicitacao: string,
  contexto: string
): string | null {
  if (!routerResult.template) return null;

  const template = routerResult.template;
  let prompt = template.promptTemplate;

  prompt = prompt.replace(/\{solicitacao\}/g, solicitacao);
  prompt = prompt.replace(/\{contexto\}/g, contexto || 'Nenhum contexto adicional disponível.');

  prompt += RICH_FORMATTING_INSTRUCTIONS;

  return prompt;
}
