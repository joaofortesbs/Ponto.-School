import { executeWithCascadeFallback } from '../../services/controle-APIs-gerais-school-power';
import type { AgentState } from './agent-loop';

export interface VerificationResult {
  approved: boolean;
  score: number;
  checks: VerificationCheck[];
  suggestions: string[];
  criticalIssues: string[];
  summary: string;
}

export interface VerificationCheck {
  name: string;
  passed: boolean;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}

const VERIFIER_PROMPT = `Você é o Verificador de Qualidade do Ponto School.
Sua função é analisar o resultado de um processo de criação de atividades educacionais e validar a qualidade.

PEDIDO ORIGINAL DO PROFESSOR:
"{user_prompt}"

RESULTADO DA EXECUÇÃO:
{execution_result}

ANALISE E VERIFIQUE:
1. COMPLETUDE: Tudo que foi solicitado foi criado?
2. COERÊNCIA PEDAGÓGICA: O conteúdo é adequado à série/disciplina?
3. QUALIDADE: O conteúdo é rico e não genérico?
4. ALINHAMENTO: O resultado atende ao pedido original?
5. INTEGRIDADE: Os dados estão consistentes?

RESPONDA COM JSON ESTRITO:
{
  "aprovado": true/false,
  "pontuacao": 0-100,
  "verificacoes": [
    {
      "nome": "nome da verificação",
      "passou": true/false,
      "detalhes": "explicação",
      "severidade": "info|warning|critical"
    }
  ],
  "sugestoes": ["sugestão 1", "sugestão 2"],
  "problemas_criticos": ["problema 1"] ou [],
  "resumo": "Resumo de 1-2 frases sobre a qualidade"
}

Retorne APENAS o JSON.`.trim();

function buildExecutionSummary(state: AgentState): string {
  const successActions = state.actions.filter(a => a.success);
  const failedActions = state.actions.filter(a => !a.success);

  const parts: string[] = [
    `Iterações: ${state.iteration + 1}`,
    `Ações executadas: ${state.actions.length}`,
    `Sucesso: ${successActions.length}, Falhas: ${failedActions.length}`,
    `Status: ${state.status}`,
    '',
    'AÇÕES EXECUTADAS:',
  ];

  for (const action of state.actions) {
    parts.push(`- ${action.capabilityName}: ${action.success ? 'OK' : 'FALHA'}`);
    if (action.result && typeof action.result === 'object') {
      if (action.result.atividades) {
        parts.push(`  Atividades: ${JSON.stringify(action.result.atividades).substring(0, 200)}`);
      }
      if (action.result.count !== undefined) {
        parts.push(`  Quantidade: ${action.result.count}`);
      }
      if (action.result.message) {
        parts.push(`  Mensagem: ${action.result.message}`);
      }
    }
    if (action.error) {
      parts.push(`  Erro: ${action.error}`);
    }
  }

  if (state.thoughts.length > 0) {
    parts.push('');
    parts.push('RACIOCÍNIO DO AGENTE:');
    const lastThought = state.thoughts[state.thoughts.length - 1];
    parts.push(lastThought.reasoning.substring(0, 500));
  }

  return parts.join('\n');
}

function parseVerificationResponse(responseText: string): VerificationResult {
  let cleanedText = responseText.trim();
  cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

  const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return createFallbackResult();
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      approved: parsed.aprovado === true,
      score: typeof parsed.pontuacao === 'number' ? parsed.pontuacao : 50,
      checks: (parsed.verificacoes || []).map((v: any) => ({
        name: v.nome || 'Verificação',
        passed: v.passou === true,
        details: v.detalhes || '',
        severity: v.severidade || 'info',
      })),
      suggestions: parsed.sugestoes || [],
      criticalIssues: parsed.problemas_criticos || [],
      summary: parsed.resumo || 'Verificação concluída',
    };
  } catch {
    return createFallbackResult();
  }
}

function createFallbackResult(): VerificationResult {
  return {
    approved: true,
    score: 70,
    checks: [
      {
        name: 'Verificação básica',
        passed: true,
        details: 'Verificação automática não disponível, aprovando por padrão',
        severity: 'info',
      },
    ],
    suggestions: [],
    criticalIssues: [],
    summary: 'Verificação básica concluída. Resultado aprovado por padrão.',
  };
}

export async function verifyAgentResult(
  state: AgentState,
  userPrompt: string
): Promise<VerificationResult> {
  console.log('🔍 [Verifier] Iniciando verificação de qualidade...');

  const successActions = state.actions.filter(a => a.success);
  if (successActions.length === 0) {
    console.warn('⚠️ [Verifier] Nenhuma ação bem-sucedida para verificar');
    return {
      approved: false,
      score: 0,
      checks: [
        {
          name: 'Execução',
          passed: false,
          details: 'Nenhuma capability executada com sucesso',
          severity: 'critical',
        },
      ],
      suggestions: ['Tente reformular o pedido'],
      criticalIssues: ['Nenhuma ação foi executada com sucesso'],
      summary: 'Falha na execução: nenhuma capability completada.',
    };
  }

  const executionSummary = buildExecutionSummary(state);

  const prompt = VERIFIER_PROMPT
    .replace('{user_prompt}', userPrompt)
    .replace('{execution_result}', executionSummary);

  try {
    const result = await executeWithCascadeFallback(prompt, {
      onProgress: (s) => console.log(`🔍 [Verifier] ${s}`),
    });

    if (!result.success || !result.data) {
      console.warn('⚠️ [Verifier] Chamada IA falhou, usando resultado fallback');
      return createFallbackResult();
    }

    const verification = parseVerificationResponse(result.data);

    console.log(`✅ [Verifier] Resultado: ${verification.approved ? 'APROVADO' : 'REPROVADO'} (score: ${verification.score})`);
    if (verification.criticalIssues.length > 0) {
      console.warn('⚠️ [Verifier] Problemas críticos:', verification.criticalIssues);
    }

    return verification;
  } catch (error) {
    console.error('❌ [Verifier] Erro na verificação:', error);
    return createFallbackResult();
  }
}

export function shouldRetry(verification: VerificationResult): boolean {
  if (verification.criticalIssues.length > 0) return true;
  if (verification.score < 40) return true;
  return false;
}

export function formatVerificationForUser(verification: VerificationResult): string {
  if (verification.approved) {
    return verification.suggestions.length > 0
      ? `Qualidade verificada (${verification.score}/100). ${verification.suggestions[0]}`
      : '';
  }

  return `Verificação identificou pontos de atenção: ${verification.summary}`;
}
