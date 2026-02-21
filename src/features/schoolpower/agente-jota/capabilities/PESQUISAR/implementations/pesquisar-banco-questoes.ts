import {
  BNCC_HABILIDADES,
  getBNCCHabilidades,
  type BNCCHabilidade,
} from '../../../prompts/bncc-reference';
import type {
  CapabilityInput,
  CapabilityOutput,
  DebugEntry,
} from '../../shared/types';
import { createDataConfirmation, createDataCheck } from '../../shared/types';

interface PesquisarBancoQuestoesParams {
  componente?: string;
  ano_serie?: string;
  tema?: string;
  dificuldade?: 'facil' | 'medio' | 'dificil';
  tipo_questao?: 'multipla_escolha' | 'dissertativa' | 'verdadeiro_falso' | 'todos';
  max_resultados?: number;
}

interface QuestaoReferencia {
  id: string;
  enunciado: string;
  tipo: 'multipla_escolha' | 'dissertativa' | 'verdadeiro_falso';
  alternativas?: string[];
  resposta_correta?: string;
  explicacao: string;
  componente: string;
  tema: string;
  dificuldade: 'facil' | 'medio' | 'dificil';
  ano_serie: string;
  habilidade_bncc?: string;
  fonte: string;
}

const BANCO_QUESTOES: QuestaoReferencia[] = [
  {
    id: 'q-mat-001',
    enunciado: 'Uma fração equivalente a 3/4 é:',
    tipo: 'multipla_escolha',
    alternativas: ['a) 6/8', 'b) 5/8', 'c) 9/16', 'd) 4/6'],
    resposta_correta: 'a',
    explicacao: 'Multiplicando numerador e denominador por 2: 3×2/4×2 = 6/8',
    componente: 'Matemática',
    tema: 'frações equivalentes',
    dificuldade: 'facil',
    ano_serie: '5º Ano',
    habilidade_bncc: 'EF05MA03',
    fonte: 'Banco de Questões Ponto School',
  },
  {
    id: 'q-mat-002',
    enunciado: 'Resolva a equação: 2x + 5 = 15. Qual o valor de x?',
    tipo: 'multipla_escolha',
    alternativas: ['a) 3', 'b) 5', 'c) 7', 'd) 10'],
    resposta_correta: 'b',
    explicacao: '2x + 5 = 15 → 2x = 10 → x = 5',
    componente: 'Matemática',
    tema: 'equações do 1º grau',
    dificuldade: 'facil',
    ano_serie: '7º Ano',
    habilidade_bncc: 'EF07MA18',
    fonte: 'Banco de Questões Ponto School',
  },
  {
    id: 'q-mat-003',
    enunciado: 'Qual é a área de um triângulo com base 10 cm e altura 6 cm?',
    tipo: 'multipla_escolha',
    alternativas: ['a) 16 cm²', 'b) 30 cm²', 'c) 60 cm²', 'd) 20 cm²'],
    resposta_correta: 'b',
    explicacao: 'Área = (base × altura) / 2 = (10 × 6) / 2 = 30 cm²',
    componente: 'Matemática',
    tema: 'geometria plana',
    dificuldade: 'medio',
    ano_serie: '8º Ano',
    habilidade_bncc: 'EF08MA19',
    fonte: 'Banco de Questões Ponto School',
  },
  {
    id: 'q-mat-004',
    enunciado: 'Determine as raízes da equação x² - 5x + 6 = 0.',
    tipo: 'dissertativa',
    explicacao: 'Usando a fórmula de Bhaskara ou fatoração: (x-2)(x-3) = 0, logo x = 2 ou x = 3',
    componente: 'Matemática',
    tema: 'equações do 2º grau',
    dificuldade: 'medio',
    ano_serie: '9º Ano',
    habilidade_bncc: 'EF09MA09',
    fonte: 'Banco de Questões Ponto School',
  },
  {
    id: 'q-mat-005',
    enunciado: 'O gráfico da função f(x) = 2x - 4 intercepta o eixo x no ponto:',
    tipo: 'multipla_escolha',
    alternativas: ['a) (0, -4)', 'b) (2, 0)', 'c) (-2, 0)', 'd) (4, 0)'],
    resposta_correta: 'b',
    explicacao: 'Para interceptar o eixo x, f(x) = 0: 2x - 4 = 0 → x = 2. Ponto: (2, 0)',
    componente: 'Matemática',
    tema: 'funções do 1º grau',
    dificuldade: 'medio',
    ano_serie: 'Ensino Médio',
    fonte: 'Banco de Questões Ponto School',
  },
  {
    id: 'q-cie-001',
    enunciado: 'Qual a principal função das mitocôndrias nas células?',
    tipo: 'multipla_escolha',
    alternativas: ['a) Síntese de proteínas', 'b) Produção de energia (ATP)', 'c) Armazenamento de água', 'd) Digestão celular'],
    resposta_correta: 'b',
    explicacao: 'As mitocôndrias são responsáveis pela respiração celular, produzindo ATP (energia) para a célula',
    componente: 'Ciências',
    tema: 'célula e organelas',
    dificuldade: 'facil',
    ano_serie: '7º Ano',
    habilidade_bncc: 'EF07CI01',
    fonte: 'Banco de Questões Ponto School',
  },
  {
    id: 'q-cie-002',
    enunciado: 'A fotossíntese é um processo realizado pelas plantas que transforma:',
    tipo: 'multipla_escolha',
    alternativas: ['a) Oxigênio em gás carbônico', 'b) Energia luminosa em energia química', 'c) Água em minerais', 'd) Proteínas em carboidratos'],
    resposta_correta: 'b',
    explicacao: 'Na fotossíntese, a planta absorve luz solar e CO₂, produzindo glicose (energia química) e O₂',
    componente: 'Ciências',
    tema: 'fotossíntese',
    dificuldade: 'facil',
    ano_serie: '7º Ano',
    habilidade_bncc: 'EF07CI06',
    fonte: 'Banco de Questões Ponto School',
  },
  {
    id: 'q-cie-003',
    enunciado: 'Explique a diferença entre calor e temperatura, dando um exemplo prático.',
    tipo: 'dissertativa',
    explicacao: 'Calor é a transferência de energia térmica entre corpos, enquanto temperatura é a medida da agitação das moléculas. Exemplo: uma xícara de café quente transfere calor para a mão (calor), e o termômetro mede a temperatura.',
    componente: 'Ciências',
    tema: 'calor e temperatura',
    dificuldade: 'medio',
    ano_serie: '7º Ano',
    habilidade_bncc: 'EF07CI02',
    fonte: 'Banco de Questões Ponto School',
  },
  {
    id: 'q-cie-004',
    enunciado: 'Quais são os níveis de organização de um ecossistema, do mais simples ao mais complexo?',
    tipo: 'dissertativa',
    explicacao: 'Organismo → População → Comunidade → Ecossistema → Bioma → Biosfera',
    componente: 'Ciências',
    tema: 'ecossistemas',
    dificuldade: 'medio',
    ano_serie: '7º Ano',
    habilidade_bncc: 'EF07CI07',
    fonte: 'Banco de Questões Ponto School',
  },
  {
    id: 'q-his-001',
    enunciado: 'A Revolução Francesa (1789) teve como principal causa:',
    tipo: 'multipla_escolha',
    alternativas: ['a) A invasão napoleônica', 'b) A crise econômica e a desigualdade social do Antigo Regime', 'c) A Guerra dos Cem Anos', 'd) A reforma protestante'],
    resposta_correta: 'b',
    explicacao: 'A Revolução Francesa foi motivada pela crise do Antigo Regime, com desigualdade entre estamentos, crise fiscal e influência das ideias iluministas',
    componente: 'História',
    tema: 'revolução francesa',
    dificuldade: 'facil',
    ano_serie: '8º Ano',
    fonte: 'Banco de Questões Ponto School',
  },
  {
    id: 'q-his-002',
    enunciado: 'Qual foi o principal objetivo da Proclamação da República no Brasil em 1889?',
    tipo: 'multipla_escolha',
    alternativas: ['a) Abolir a escravidão', 'b) Substituir a monarquia por um regime republicano', 'c) Declarar independência de Portugal', 'd) Criar uma nova constituição imperial'],
    resposta_correta: 'b',
    explicacao: 'A Proclamação da República em 15 de novembro de 1889 depôs o Imperador D. Pedro II e instaurou o regime republicano no Brasil',
    componente: 'História',
    tema: 'república brasileira',
    dificuldade: 'facil',
    ano_serie: '9º Ano',
    fonte: 'Banco de Questões Ponto School',
  },
  {
    id: 'q-geo-001',
    enunciado: 'O bioma Cerrado é considerado a "savana brasileira". Quais são duas de suas principais características?',
    tipo: 'dissertativa',
    explicacao: 'O Cerrado apresenta vegetação com árvores de troncos retorcidos e raízes profundas, clima tropical sazonal com duas estações bem definidas (seca e chuvosa), e é o segundo maior bioma do Brasil',
    componente: 'Geografia',
    tema: 'biomas brasileiros',
    dificuldade: 'facil',
    ano_serie: '7º Ano',
    fonte: 'Banco de Questões Ponto School',
  },
  {
    id: 'q-geo-002',
    enunciado: 'A urbanização acelerada no Brasil gerou diversos problemas. Cite e explique dois deles.',
    tipo: 'dissertativa',
    explicacao: 'Exemplos: 1) Favelização — o crescimento urbano sem planejamento levou à formação de habitações precárias em áreas de risco. 2) Trânsito — o aumento da frota veicular sem infraestrutura adequada causa congestionamentos e poluição',
    componente: 'Geografia',
    tema: 'urbanização',
    dificuldade: 'medio',
    ano_serie: '9º Ano',
    fonte: 'Banco de Questões Ponto School',
  },
  {
    id: 'q-lp-001',
    enunciado: 'Na frase "Os alunos estudaram bastante para a prova", o sujeito é:',
    tipo: 'multipla_escolha',
    alternativas: ['a) estudaram', 'b) bastante', 'c) Os alunos', 'd) para a prova'],
    resposta_correta: 'c',
    explicacao: 'O sujeito é "Os alunos", pois é quem pratica a ação de estudar',
    componente: 'Língua Portuguesa',
    tema: 'análise sintática',
    dificuldade: 'facil',
    ano_serie: '6º Ano',
    fonte: 'Banco de Questões Ponto School',
  },
  {
    id: 'q-lp-002',
    enunciado: 'Leia o trecho e identifique o tipo de narrador: "Maria abriu a porta e sentiu o vento frio. Ela pensou que deveria ter trazido um casaco."',
    tipo: 'multipla_escolha',
    alternativas: ['a) Narrador-personagem', 'b) Narrador-observador', 'c) Narrador onisciente', 'd) Narrador-testemunha'],
    resposta_correta: 'c',
    explicacao: 'O narrador é onisciente porque conhece os pensamentos da personagem ("Ela pensou que...")',
    componente: 'Língua Portuguesa',
    tema: 'tipos de narrador',
    dificuldade: 'medio',
    ano_serie: '8º Ano',
    fonte: 'Banco de Questões Ponto School',
  },
];

export async function pesquisarBancoQuestoesV2(
  input: CapabilityInput
): Promise<CapabilityOutput> {
  const debug_log: DebugEntry[] = [];
  const startTime = Date.now();
  const params = (input.context || {}) as PesquisarBancoQuestoesParams;
  const maxResults = params.max_resultados || 5;

  try {
    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'action',
      narrative: '📝 ETAPA 1: Iniciando pesquisa no Banco de Questões de Referência...',
      technical_data: {
        componente: params.componente || 'todos',
        ano_serie: params.ano_serie || 'todos',
        tema: params.tema || 'livre',
        dificuldade: params.dificuldade || 'todas',
        tipo_questao: params.tipo_questao || 'todos',
        max_resultados: maxResults,
      },
    });

    let resultados = [...BANCO_QUESTOES];

    if (params.componente) {
      const compLower = params.componente.toLowerCase().trim();
      const compAliases: Record<string, string> = {
        'matematica': 'Matemática', 'matemática': 'Matemática', 'mat': 'Matemática',
        'lingua portuguesa': 'Língua Portuguesa', 'língua portuguesa': 'Língua Portuguesa',
        'portugues': 'Língua Portuguesa', 'português': 'Língua Portuguesa', 'lp': 'Língua Portuguesa',
        'ciencias': 'Ciências', 'ciências': 'Ciências', 'cie': 'Ciências',
        'historia': 'História', 'história': 'História', 'hist': 'História',
        'geografia': 'Geografia', 'geo': 'Geografia',
      };
      const normalized = compAliases[compLower] || params.componente;
      resultados = resultados.filter(q => q.componente.toLowerCase() === normalized.toLowerCase());

      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: `🔍 ETAPA 2: Filtro por componente "${normalized}" → ${resultados.length} questão(ões)`,
        technical_data: { filtro: 'componente', valor: normalized, restantes: resultados.length },
      });
    }

    if (params.ano_serie) {
      const anoLower = params.ano_serie.toLowerCase();
      const beforeCount = resultados.length;
      resultados = resultados.filter(q => {
        const qAnoLower = q.ano_serie.toLowerCase();
        return qAnoLower.includes(anoLower) || anoLower.includes(qAnoLower);
      });

      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: `🔍 Filtro por ano/série "${params.ano_serie}" → ${beforeCount} → ${resultados.length} questão(ões)`,
        technical_data: { filtro: 'ano_serie', valor: params.ano_serie, antes: beforeCount, depois: resultados.length },
      });
    }

    if (params.tema && params.tema.trim().length > 0) {
      const temaLower = params.tema.toLowerCase();
      const beforeCount = resultados.length;
      const scored = resultados.map(q => {
        let score = 0;
        if (q.tema.toLowerCase().includes(temaLower)) score += 3;
        if (q.enunciado.toLowerCase().includes(temaLower)) score += 2;
        if (q.explicacao.toLowerCase().includes(temaLower)) score += 1;
        const temaWords = temaLower.split(/\s+/);
        for (const word of temaWords) {
          if (word.length > 3) {
            if (q.tema.toLowerCase().includes(word)) score += 1;
            if (q.enunciado.toLowerCase().includes(word)) score += 0.5;
          }
        }
        return { questao: q, score };
      }).filter(s => s.score > 0).sort((a, b) => b.score - a.score);

      resultados = scored.map(s => s.questao);

      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: `🔎 Filtro por tema "${params.tema}" → ${beforeCount} → ${resultados.length} questão(ões) relevantes`,
        technical_data: { filtro: 'tema', valor: params.tema, antes: beforeCount, depois: resultados.length },
      });
    }

    if (params.dificuldade) {
      const beforeCount = resultados.length;
      resultados = resultados.filter(q => q.dificuldade === params.dificuldade);

      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: `📊 Filtro por dificuldade "${params.dificuldade}" → ${beforeCount} → ${resultados.length} questão(ões)`,
        technical_data: { filtro: 'dificuldade', valor: params.dificuldade, antes: beforeCount, depois: resultados.length },
      });
    }

    if (params.tipo_questao && params.tipo_questao !== 'todos') {
      const beforeCount = resultados.length;
      resultados = resultados.filter(q => q.tipo === params.tipo_questao);

      debug_log.push({
        timestamp: new Date().toISOString(),
        type: 'action',
        narrative: `📋 Filtro por tipo "${params.tipo_questao}" → ${beforeCount} → ${resultados.length} questão(ões)`,
        technical_data: { filtro: 'tipo_questao', valor: params.tipo_questao, antes: beforeCount, depois: resultados.length },
      });
    }

    resultados = resultados.slice(0, maxResults);

    const componentesEncontrados = [...new Set(resultados.map(q => q.componente))];
    const temasEncontrados = [...new Set(resultados.map(q => q.tema))];
    const dificuldades = [...new Set(resultados.map(q => q.dificuldade))];

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'discovery',
      narrative: `📋 RESULTADO: Encontradas ${resultados.length} questão(ões) de referência de ${componentesEncontrados.length} componente(s) sobre ${temasEncontrados.length} tema(s)`,
      technical_data: {
        total_encontrado: resultados.length,
        componentes: componentesEncontrados,
        temas: temasEncontrados,
        dificuldades,
        questoes: resultados.map(q => ({
          id: q.id,
          tipo: q.tipo,
          componente: q.componente,
          tema: q.tema,
          dificuldade: q.dificuldade,
        })),
      },
    });

    const elapsedTime = Date.now() - startTime;

    const dataConfirmation = createDataConfirmation([
      createDataCheck('banco_loaded', 'Banco de questões carregado', BANCO_QUESTOES.length > 0, BANCO_QUESTOES.length, '> 0 questões'),
      createDataCheck('results_found', 'Questões encontradas', resultados.length > 0, resultados.length, '> 0'),
      createDataCheck('has_explanations', 'Questões com explicação', resultados.every(q => q.explicacao && q.explicacao.length > 0), resultados.length, 'todas com explicação'),
    ]);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'confirmation',
      narrative: `✅ Pesquisa no Banco de Questões concluída em ${elapsedTime}ms — ${resultados.length} questão(ões) de referência encontrada(s)`,
      technical_data: {
        duracao_ms: elapsedTime,
        total_resultados: resultados.length,
        resumo: dataConfirmation.summary,
      },
    });

    const formattedForPrompt = formatQuestoesForPrompt(resultados);

    return {
      success: true,
      capability_id: 'pesquisar_banco_questoes',
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: {
        questoes: resultados,
        count: resultados.length,
        componentes: componentesEncontrados,
        temas: temasEncontrados,
        dificuldades,
        prompt_context: formattedForPrompt,
        summary: `Encontradas ${resultados.length} questão(ões) de referência${params.componente ? ` de ${params.componente}` : ''}${params.tema ? ` sobre ${params.tema}` : ''}`,
      },
      error: null,
      debug_log,
      data_confirmation: dataConfirmation,
      metadata: {
        duration_ms: elapsedTime,
        retry_count: 0,
        data_source: 'Banco de Questões Ponto School (banco-questoes-referencia)',
      },
    };
  } catch (error) {
    const elapsedTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    debug_log.push({
      timestamp: new Date().toISOString(),
      type: 'error',
      narrative: `❌ ERRO: Falha na pesquisa no Banco de Questões — ${errorMessage}`,
      technical_data: {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        duration_ms: elapsedTime,
      },
    });

    console.error('❌ [Capability:PESQUISAR_BANCO_QUESTOES] ERRO:', errorMessage);

    return {
      success: false,
      capability_id: 'pesquisar_banco_questoes',
      execution_id: input.execution_id,
      timestamp: new Date().toISOString(),
      data: null,
      error: {
        code: 'BANCO_QUESTOES_SEARCH_FAILED',
        message: errorMessage,
        severity: 'medium',
        recoverable: true,
        recovery_suggestion: 'Verifique os parâmetros de busca (componente, tema, dificuldade) e tente novamente',
      },
      debug_log,
      metadata: {
        duration_ms: elapsedTime,
        retry_count: 0,
        data_source: 'Banco de Questões Ponto School',
      },
    };
  }
}

function formatQuestoesForPrompt(questoes: QuestaoReferencia[]): string {
  if (questoes.length === 0) {
    return 'Nenhuma questão de referência encontrada para os filtros especificados.';
  }

  const parts: string[] = ['QUESTÕES DE REFERÊNCIA ENCONTRADAS (use como modelo de qualidade e estilo):'];

  for (const q of questoes) {
    parts.push(`\n📝 [${q.componente} | ${q.tema} | ${q.dificuldade}]`);
    parts.push(`   Enunciado: ${q.enunciado}`);
    if (q.alternativas && q.alternativas.length > 0) {
      parts.push(`   Alternativas: ${q.alternativas.join(' | ')}`);
      parts.push(`   Resposta: ${q.resposta_correta}`);
    }
    parts.push(`   Explicação: ${q.explicacao}`);
    if (q.habilidade_bncc) {
      parts.push(`   BNCC: ${q.habilidade_bncc}`);
    }
  }

  parts.push('\n⚠️ IMPORTANTE: Use estas questões como REFERÊNCIA de qualidade e estilo. NÃO copie literalmente — crie questões ORIGINAIS inspiradas neste padrão.');

  return parts.join('\n');
}
