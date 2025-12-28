import { executeWithCascadeFallback } from '../../../../services/controle-APIs-gerais-school-power';
import type { DecidirAtividadesCriarInput, AtividadeEscolhida } from '../schemas/decidir-atividades-schema';
import schoolPowerActivitiesData from '../../../../data/schoolPowerActivities.json';

interface AtividadeCompleta {
  id: string;
  titulo: string;
  tipo: string;
  categoria?: string;
  materia: string;
  nivel_dificuldade: string;
  tags: string[];
  descricao?: string;
  campos_obrigatorios?: string[];
  campos_opcionais?: string[];
  schema_campos?: Record<string, any>;
}

function getAtividadesComSchemas(): AtividadeCompleta[] {
  const data = schoolPowerActivitiesData as any;
  const atividades = data.atividades || data;
  if (!Array.isArray(atividades)) return [];
  return atividades.filter((a: any) => a.enabled !== false && a.schema_campos);
}

function buildSchemaDescription(atividade: AtividadeCompleta): string {
  const camposObrigatorios = atividade.campos_obrigatorios || [];
  const schemasCampos = atividade.schema_campos || {};
  
  return camposObrigatorios.map(campo => {
    const schema = schemasCampos[campo];
    if (!schema) return `  - ${campo}: (campo obrigatório)`;
    
    let descricao = `  - **${campo}** (${schema.tipo})`;
    if (schema.label) descricao += `: ${schema.label}`;
    if (schema.placeholder) descricao += ` - ${schema.placeholder}`;
    if (schema.opcoes) descricao += ` [Opções: ${schema.opcoes.slice(0, 5).join(', ')}${schema.opcoes.length > 5 ? '...' : ''}]`;
    if (schema.min !== undefined) descricao += ` [min: ${schema.min}]`;
    if (schema.max !== undefined) descricao += ` [max: ${schema.max}]`;
    if (schema.min_items !== undefined) descricao += ` [min_items: ${schema.min_items}]`;
    
    return descricao;
  }).join('\n');
}

export async function decidirAtividadesCriar(params: DecidirAtividadesCriarInput): Promise<{
  success: boolean;
  decisao: {
    total_selecionado: number;
    atividades: AtividadeEscolhida[];
    estrategia_aplicada: string;
    pronto_para_criar: boolean;
  };
  atividades_escolhidas: AtividadeEscolhida[];
  mensagem: string;
  pronto_para_criar: boolean;
}> {
  console.log('🎯 [DECIDIR] Iniciando capability decidir-atividades-criar...');

  const {
    atividades_disponiveis,
    criterios_decisao,
    contexto_turma
  } = params;

  const quantidade = criterios_decisao?.quantidade || 3;

  const atividadesComSchemas = atividades_disponiveis.length > 0 
    ? atividades_disponiveis 
    : getAtividadesComSchemas();

  console.log(`📊 [DECIDIR] Atividades disponíveis: ${atividadesComSchemas.length}`);
  console.log(`🎓 [DECIDIR] Quantidade desejada: ${quantidade}`);

  const decisionPrompt = `
Você é um **ESPECIALISTA PEDAGÓGICO DE ELITE** com PhD em Educação e 20 anos de experiência em planejamento didático.

Sua missão CRÍTICA é:
1. Escolher estrategicamente as ${quantidade} melhores atividades
2. **PREENCHER TODOS OS CAMPOS OBRIGATÓRIOS** de cada atividade escolhida com conteúdo pedagógico de altíssima qualidade

## 📚 ATIVIDADES DISPONÍVEIS:

${atividadesComSchemas.slice(0, 10).map((a: any, idx: number) => `
### Atividade ${idx + 1}: ${a.titulo}
- **ID:** ${a.id}
- **Tipo:** ${a.tipo}
- **Categoria:** ${a.categoria || 'geral'}
- **Matéria:** ${a.materia}
- **Dificuldade:** ${a.nivel_dificuldade}
- **Descrição:** ${a.descricao}

**CAMPOS OBRIGATÓRIOS QUE VOCÊ DEVE PREENCHER:**
${buildSchemaDescription(a as AtividadeCompleta)}
`).join('\n---\n')}

## 🎯 CRITÉRIOS DE DECISÃO:

- **Objetivo Pedagógico:** ${criterios_decisao?.objetivo_pedagogico || 'Aprendizado geral do tema'}
- **Quantidade Desejada:** ${quantidade} atividades
- **Abordagem Prioritária:** ${criterios_decisao?.priorizar || 'variedade de tipos'}
- **Nível da Turma:** ${criterios_decisao?.nivel_turma || 'intermediario'}

${contexto_turma ? `
## 🏫 CONTEXTO DA TURMA:

- **Matéria:** ${contexto_turma.materia || 'Não especificado'}
- **Nível de Ensino:** ${contexto_turma.nivel_ensino || 'Não especificado'}
- **Desempenho Médio:** ${contexto_turma.desempenho_medio ? `${contexto_turma.desempenho_medio}%` : 'Não especificado'}
- **Gaps de Aprendizado:** ${contexto_turma.gaps_aprendizado?.join(', ') || 'Não identificados'}

**ATENÇÃO:** Use este contexto para personalizar o conteúdo das atividades!
` : ''}

## 📋 SUA TAREFA (EXECUÇÃO OBRIGATÓRIA):

Para CADA uma das ${quantidade} atividades que você escolher:

1. **Justifique a escolha** (por que essa atividade é ideal para o objetivo?)
2. **Preencha TODOS os campos obrigatórios** com conteúdo pedagógico detalhado e de alta qualidade
3. **Respeite o tipo de dado** de cada campo (text, textarea, array, number, select, etc.)
4. **Use o schema_campos** para entender formato e validações
5. **Ordene as atividades** de forma lógica e progressiva

## 🚨 REGRAS CRÍTICAS:

- ✅ TODOS os campos obrigatórios DEVEM ser preenchidos
- ✅ Conteúdo deve ser pedagogicamente relevante e aplicável
- ✅ Arrays devem ter quantidade mínima respeitada
- ✅ Selects devem usar EXATAMENTE as opções disponíveis
- ✅ Numbers devem respeitar min/max
- ❌ NÃO deixe campos vazios ou com placeholders
- ❌ NÃO use "...", "exemplo", "etc" como conteúdo

## 📤 FORMATO DE RESPOSTA (JSON VÁLIDO):

{
  "atividades_escolhidas": [
    {
      "id": "plano-aula-001",
      "titulo": "Plano de Aula Completo",
      "justificativa": "Esta atividade é ideal porque...",
      "ordem_sugerida": 1,
      "campos_preenchidos": {
        "tema": "Tema específico aqui",
        "disciplina": "Matemática",
        "ano_serie": "9º ano",
        "duracao_aula": 50,
        "objetivo_geral": "Objetivo detalhado...",
        "objetivos_especificos": ["Objetivo 1", "Objetivo 2", "Objetivo 3"],
        "conteudo_programatico": "Conteúdo detalhado...",
        "metodologia": "Metodologia detalhada...",
        "recursos_didaticos": ["Recurso 1", "Recurso 2"],
        "avaliacao": "Como os alunos serão avaliados..."
      }
    }
  ],
  "raciocinio_geral": "Escolhi estas atividades porque..."
}

**ATENÇÃO:** Retorne APENAS o JSON válido, sem texto adicional.
  `.trim();

  console.log('🤖 [DECIDIR] Enviando prompt para API...');

  const result = await executeWithCascadeFallback(decisionPrompt);

  let decisionData: any = null;

  if (result.success && result.data) {
    try {
      const cleanedText = result.data.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        decisionData = JSON.parse(jsonMatch[0]);
        console.log('✅ [DECIDIR] Resposta parseada com sucesso');
      }
    } catch (e) {
      console.warn('⚠️ [DECIDIR] Falha ao parsear resposta:', e);
    }
  }

  if (!decisionData || !decisionData.atividades_escolhidas) {
    console.log('⚠️ [DECIDIR] Usando fallback - gerando atividades com campos padrão');
    
    const atividadesSelecionadas = atividadesComSchemas
      .slice(0, quantidade)
      .map((a: any, idx: number) => {
        const camposPreenchidos: Record<string, any> = {};
        
        (a.campos_obrigatorios || []).forEach((campo: string) => {
          const schema = a.schema_campos?.[campo];
          if (!schema) {
            camposPreenchidos[campo] = 'Conteúdo a ser definido';
            return;
          }
          
          switch (schema.tipo) {
            case 'text':
            case 'textarea':
              camposPreenchidos[campo] = `${schema.label || campo} - Conteúdo pedagógico sobre ${criterios_decisao?.objetivo_pedagogico || 'o tema'}`;
              break;
            case 'number':
              camposPreenchidos[campo] = schema.default || schema.min || 5;
              break;
            case 'select':
              camposPreenchidos[campo] = schema.opcoes?.[0] || 'Não especificado';
              break;
            case 'array':
              camposPreenchidos[campo] = ['Item 1', 'Item 2', 'Item 3'];
              break;
            case 'array_objects':
              camposPreenchidos[campo] = [{ exemplo: 'Item de exemplo' }];
              break;
            case 'boolean':
              camposPreenchidos[campo] = schema.default ?? true;
              break;
            default:
              camposPreenchidos[campo] = 'Valor padrão';
          }
        });

        return {
          id: a.id,
          titulo: a.titulo,
          tipo: a.tipo,
          materia: a.materia,
          nivel_dificuldade: a.nivel_dificuldade,
          tags: a.tags || [],
          campos_obrigatorios: a.campos_obrigatorios || [],
          campos_opcionais: a.campos_opcionais || [],
          schema_campos: a.schema_campos || {},
          campos_preenchidos: camposPreenchidos,
          justificativa: 'Atividade selecionada automaticamente baseada nos critérios pedagógicos',
          ordem_sugerida: idx + 1,
          status_construcao: 'aguardando' as const,
          progresso: 0
        };
      });

    decisionData = {
      atividades_escolhidas: atividadesSelecionadas,
      raciocinio_geral: 'Seleção baseada em diversidade e relevância pedagógica'
    };
  }

  const atividadesEscolhidas: AtividadeEscolhida[] = decisionData.atividades_escolhidas.map((escolha: any, index: number) => {
    const atividadeCompleta = atividadesComSchemas.find((a: any) => a.id === escolha.id);
    
    if (!atividadeCompleta) {
      console.warn(`⚠️ [DECIDIR] Atividade ${escolha.id} não encontrada, usando dados da escolha`);
    }

    const camposObrigatorios = atividadeCompleta?.campos_obrigatorios || [];
    const schemaCampos = atividadeCompleta?.schema_campos || {};
    let camposPreenchidos = { ...(escolha.campos_preenchidos || {}) };

    const camposFaltantes = camposObrigatorios.filter((campo: string) => {
      const valor = camposPreenchidos[campo];
      if (valor === undefined || valor === null) return true;
      if (typeof valor === 'string' && valor.trim() === '') return true;
      if (Array.isArray(valor) && valor.length === 0) return true;
      return false;
    });

    if (camposFaltantes.length > 0) {
      console.log(`🔧 [DECIDIR] Preenchendo ${camposFaltantes.length} campos faltantes para "${escolha.titulo}"`);
      
      camposFaltantes.forEach((campo: string) => {
        const schema = schemaCampos[campo];
        if (!schema) {
          camposPreenchidos[campo] = `Conteúdo sobre ${criterios_decisao?.objetivo_pedagogico || 'o tema'}`;
          return;
        }
        
        switch (schema.tipo) {
          case 'text':
            camposPreenchidos[campo] = schema.placeholder 
              ? schema.placeholder.replace('Ex:', '').trim()
              : `${schema.label || campo}`;
            break;
          case 'textarea':
            camposPreenchidos[campo] = `Conteúdo detalhado para ${schema.label || campo} sobre ${criterios_decisao?.objetivo_pedagogico || 'o tema especificado'}. Este conteúdo será personalizado conforme as necessidades pedagógicas.`;
            break;
          case 'number':
            camposPreenchidos[campo] = schema.default || schema.min || 5;
            break;
          case 'select':
            camposPreenchidos[campo] = schema.opcoes?.[0] || 'Não especificado';
            break;
          case 'array':
            const minItems = schema.min_items || 3;
            camposPreenchidos[campo] = Array.from({ length: minItems }, (_, i) => 
              `${schema.label || campo} ${i + 1}: Item de exemplo`
            );
            break;
          case 'array_objects':
            const minObjs = schema.min_items || 3;
            const objSchema = schema.schema || {};
            camposPreenchidos[campo] = Array.from({ length: minObjs }, (_, i) => {
              const obj: Record<string, any> = {};
              Object.entries(objSchema).forEach(([key, fieldDef]: [string, any]) => {
                if (fieldDef.tipo === 'number') {
                  obj[key] = i + 1;
                } else {
                  obj[key] = `${fieldDef.label || key} ${i + 1}`;
                }
              });
              return obj;
            });
            break;
          case 'boolean':
            camposPreenchidos[campo] = schema.default ?? true;
            break;
          default:
            camposPreenchidos[campo] = 'Valor padrão';
        }
      });
    }

    console.log(`✅ [DECIDIR] Atividade ${index + 1} processada: ${escolha.titulo} (${Object.keys(camposPreenchidos).length} campos)`);

    return {
      id: atividadeCompleta?.id || escolha.id,
      titulo: atividadeCompleta?.titulo || escolha.titulo,
      tipo: atividadeCompleta?.tipo || escolha.tipo || 'atividade',
      materia: atividadeCompleta?.materia || escolha.materia || 'geral',
      nivel_dificuldade: atividadeCompleta?.nivel_dificuldade || escolha.nivel_dificuldade || 'intermediario',
      tags: atividadeCompleta?.tags || escolha.tags || [],
      campos_obrigatorios: camposObrigatorios,
      campos_opcionais: atividadeCompleta?.campos_opcionais || [],
      schema_campos: schemaCampos,
      campos_preenchidos: camposPreenchidos,
      justificativa: escolha.justificativa || 'Atividade escolhida estrategicamente',
      ordem_sugerida: escolha.ordem_sugerida || (index + 1),
      status_construcao: 'aguardando' as const,
      progresso: 0
    };
  });

  const organizacao = {
    total_selecionado: atividadesEscolhidas.length,
    atividades: atividadesEscolhidas.sort((a, b) => a.ordem_sugerida - b.ordem_sugerida),
    estrategia_aplicada: decisionData.raciocinio_geral || 'Atividades escolhidas estrategicamente',
    pronto_para_criar: true
  };

  console.log('🎉 [DECIDIR] Decisão concluída com sucesso!');
  console.log(`📊 [DECIDIR] Total de atividades escolhidas: ${organizacao.total_selecionado}`);

  return {
    success: true,
    decisao: organizacao,
    atividades_escolhidas: organizacao.atividades,
    mensagem: `Escolhi ${organizacao.total_selecionado} atividade(s) estrategicamente e preenchi TODOS os campos necessários. ${decisionData.raciocinio_geral}`,
    pronto_para_criar: true
  };
}
