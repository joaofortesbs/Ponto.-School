/**
 * CAPABILITY 4: criar_atividade
 * 
 * Responsabilidade: Receber as atividades decididas pela capability 3,
 * preencher os campos obrigatórios com IA e ACIONAR a construção real
 * através do sistema de eventos que dispara o BuildController.
 * 
 * Input: Decisões da capability 3 (ChosenActivity[])
 * Output: Atividades construídas e persistidas via modal
 * 
 * ARQUITETURA:
 * 1. Gera campos via IA (fillActivityFields)
 * 2. Emite evento construction:build_activity
 * 3. BuildController recebe e executa buildActivityFromFormData (mesma lógica do modal)
 * 4. Aguarda evento construction:activity_built com confirmação
 */

import { executeWithCascadeFallback } from '../../../services/controle-APIs-gerais-school-power';
import {
  ChosenActivity,
  BuiltActivity,
  CreateActivityResult,
  ConstructionProgress,
  DecisionResult
} from '../shared/types';
import {
  emitBuildActivityRequest,
  waitForBuildResult,
  BuildActivityResult
} from '../../../construction/events/constructionEventBus';
import { powersService } from '@/services/powersService';

interface CriarAtividadeParams {
  decision_result: DecisionResult;
  professor_id: string;
  auto_save?: boolean;
  on_progress?: (progress: ConstructionProgress) => void;
}

const BUILD_TIMEOUT = 90000;

function buildFieldFillingPrompt(activity: ChosenActivity, userContext?: string): string {
  const schemaDescriptions = activity.campos_obrigatorios.map(campo => {
    const schema = activity.schema_campos[campo];
    if (!schema) return `  - ${campo}: (campo obrigatório)`;
    
    let desc = `  - **${campo}** (${schema.tipo})`;
    if (schema.label) desc += `: ${schema.label}`;
    if (schema.placeholder) desc += ` | Exemplo: ${schema.placeholder}`;
    if (schema.opcoes) desc += ` | Opções: [${schema.opcoes.slice(0, 5).join(', ')}]`;
    if (schema.min !== undefined) desc += ` | min: ${schema.min}`;
    if (schema.max !== undefined) desc += ` | max: ${schema.max}`;
    if (schema.min_items !== undefined) desc += ` | min_items: ${schema.min_items}`;
    
    return desc;
  }).join('\n');

  return `
Você é um especialista pedagógico. Preencha TODOS os campos obrigatórios desta atividade educacional.

## ATIVIDADE
- Título: ${activity.titulo}
- Tipo: ${activity.tipo}
- Categoria: ${activity.categoria || 'geral'}
- Matéria: ${activity.materia}
- Justificativa da escolha: ${activity.justificativa}

## CAMPOS OBRIGATÓRIOS A PREENCHER:

${schemaDescriptions}

## CONTEXTO ADICIONAL
${userContext || 'Nenhum contexto adicional fornecido'}

## INSTRUÇÕES CRÍTICAS:

1. Preencha TODOS os campos listados acima
2. Respeite o tipo de cada campo:
   - text: String curta
   - textarea: Texto longo e detalhado
   - number: Número respeitando min/max
   - select: Use EXATAMENTE uma das opções listadas
   - array: Lista de strings (mínimo conforme min_items)
   - array_objects: Lista de objetos conforme schema
   - boolean: true ou false

3. Conteúdo deve ser pedagogicamente relevante e aplicável
4. NÃO use placeholders como "...", "exemplo", "etc"

## FORMATO DE RESPOSTA (JSON VÁLIDO)

{
  "campos_preenchidos": {
    "campo1": "valor preenchido",
    "campo2": ["item1", "item2", "item3"],
    "campo3": 50
  },
  "resumo_conteudo": "Breve descrição do que foi criado"
}

Retorne APENAS o JSON, sem texto adicional.
  `.trim();
}

async function fillActivityFields(
  activity: ChosenActivity,
  userContext?: string
): Promise<Record<string, any>> {
  console.log(`📝 [CRIAR] Gerando campos via IA para: ${activity.titulo}`);
  
  const prompt = buildFieldFillingPrompt(activity, userContext);
  
  try {
    const result = await executeWithCascadeFallback(prompt);
    
    if (!result.success || !result.data) {
      throw new Error('Falha na chamada da API');
    }

    const cleanedText = result.data.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Resposta não contém JSON válido');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    if (!parsed.campos_preenchidos) {
      throw new Error('Resposta não contém campos_preenchidos');
    }

    const missingFields = activity.campos_obrigatorios.filter(
      campo => parsed.campos_preenchidos[campo] === undefined
    );

    if (missingFields.length > 0) {
      console.warn(`⚠️ [CRIAR] Campos faltantes: ${missingFields.join(', ')}`);
      
      missingFields.forEach(campo => {
        const schema = activity.schema_campos[campo];
        parsed.campos_preenchidos[campo] = getDefaultValue(schema);
      });
    }

    console.log(`✅ [CRIAR] Campos gerados com sucesso:`, Object.keys(parsed.campos_preenchidos));
    return parsed.campos_preenchidos;

  } catch (error) {
    console.error(`❌ [CRIAR] Erro ao gerar campos:`, error);
    
    const fallbackFields: Record<string, any> = {};
    activity.campos_obrigatorios.forEach(campo => {
      fallbackFields[campo] = getDefaultValue(activity.schema_campos[campo]);
    });
    
    return fallbackFields;
  }
}

function getDefaultValue(schema: any): any {
  if (!schema) return 'Conteúdo a ser definido';
  
  switch (schema.tipo) {
    case 'text':
      return schema.placeholder || 'Texto padrão';
    case 'textarea':
      return `Conteúdo detalhado para ${schema.label || 'este campo'}. Este conteúdo será personalizado conforme as necessidades pedagógicas.`;
    case 'number':
      return schema.default || schema.min || 5;
    case 'select':
      return schema.opcoes?.[0] || 'Não especificado';
    case 'array':
      const minItems = schema.min_items || 3;
      return Array.from({ length: minItems }, (_, i) => `Item ${i + 1}`);
    case 'array_objects':
      const minObjs = schema.min_items || 1;
      return Array.from({ length: minObjs }, () => ({ valor: 'Item de exemplo' }));
    case 'boolean':
      return schema.default ?? true;
    default:
      return 'Valor padrão';
  }
}

async function buildActivityViaEventSystem(
  activity: ChosenActivity,
  filledFields: Record<string, any>
): Promise<BuildActivityResult> {
  const requestId = `build-${activity.id}-${Date.now()}`;
  
  console.log(`\n🔨 ════════════════════════════════════════════════════════`);
  console.log(`🔨 [CRIAR] ACIONANDO CONSTRUÇÃO REAL via EventBus`);
  console.log(`🔨 ════════════════════════════════════════════════════════`);
  console.log(`🔨 [CRIAR] Activity ID: ${activity.id}`);
  console.log(`🔨 [CRIAR] Tipo: ${activity.tipo}`);
  console.log(`🔨 [CRIAR] Request ID: ${requestId}`);
  console.log(`🔨 [CRIAR] Campos a injetar:`, Object.keys(filledFields));

  const buildRequest = {
    activityId: activity.id,
    activityType: activity.tipo,
    fields: {
      ...filledFields,
      title: activity.titulo,
      tema: activity.titulo,
      theme: activity.titulo,
      subject: activity.materia,
      disciplina: activity.materia,
      objectives: activity.justificativa,
      objetivo: activity.justificativa
    },
    requestId
  };

  console.log(`📡 [CRIAR] Emitindo evento construction:build_activity...`);
  emitBuildActivityRequest(buildRequest);

  console.log(`⏳ [CRIAR] Aguardando confirmação de construção (timeout: ${BUILD_TIMEOUT}ms)...`);
  
  try {
    const result = await waitForBuildResult(requestId, BUILD_TIMEOUT);
    
    console.log(`\n🎉 ════════════════════════════════════════════════════════`);
    console.log(`🎉 [CRIAR] CONSTRUÇÃO CONFIRMADA!`);
    console.log(`🎉 ════════════════════════════════════════════════════════`);
    console.log(`🎉 [CRIAR] Activity ID: ${result.activityId}`);
    console.log(`🎉 [CRIAR] Sucesso: ${result.success}`);
    console.log(`🎉 [CRIAR] Chaves localStorage criadas:`);
    result.storageKeys.forEach(key => {
      console.log(`   💾 ${key}`);
    });
    console.log(`🎉 [CRIAR] Timestamp: ${result.timestamp}`);
    
    return result;
    
  } catch (error) {
    console.error(`❌ [CRIAR] Erro na construção via eventos:`, error);
    throw error;
  }
}

async function saveActivityToDB(
  activity: BuiltActivity,
  professorId: string
): Promise<{ success: boolean; db_id?: string; error?: string }> {
  try {
    const response = await fetch('/api/atividades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        professor_id: professorId,
        titulo: activity.titulo,
        tipo: activity.tipo,
        categoria: activity.categoria,
        materia: activity.materia,
        nivel_dificuldade: activity.nivel_dificuldade,
        campos_preenchidos: activity.campos_preenchidos,
        conteudo: activity.conteudo_gerado,
        status: 'published',
        original_template_id: activity.original_id
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const result = await response.json();
    return { success: true, db_id: result.id };

  } catch (error) {
    console.error(`❌ [CRIAR] Erro ao salvar no banco:`, error);
    return { success: false, error: (error as Error).message };
  }
}

export async function criarAtividade(
  params: CriarAtividadeParams
): Promise<CreateActivityResult> {
  console.log('\n');
  console.log('🔨 ╔═══════════════════════════════════════════════════════════════╗');
  console.log('🔨 ║     CAPABILITY 4: CRIAR_ATIVIDADE (Construção Real)           ║');
  console.log('🔨 ╚═══════════════════════════════════════════════════════════════╝');
  
  const startTime = Date.now();
  const { decision_result, professor_id, auto_save = true, on_progress } = params;
  
  const activitiesToBuild = decision_result.chosen_activities;
  const builtActivities: BuiltActivity[] = [];
  const errors: string[] = [];

  const progress: ConstructionProgress = {
    total: activitiesToBuild.length,
    completed: 0,
    failed: 0,
    current: null,
    percentage: 0
  };

  const updateProgress = () => {
    progress.percentage = Math.round(
      ((progress.completed + progress.failed) / progress.total) * 100
    );
    if (on_progress) {
      on_progress({ ...progress });
    }
  };

  console.log(`📦 [CRIAR] Total de atividades para construir: ${activitiesToBuild.length}`);
  console.log(`📦 [CRIAR] Atividades:`, activitiesToBuild.map(a => a.titulo).join(', '));

  for (let i = 0; i < activitiesToBuild.length; i++) {
    const activity = activitiesToBuild[i];
    progress.current = activity.id;
    updateProgress();

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🔧 [CRIAR] [${i + 1}/${activitiesToBuild.length}] Construindo: ${activity.titulo}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    try {
      console.log(`📝 [CRIAR] PASSO 1: Gerando campos via IA...`);
      const filledFields = await fillActivityFields(activity);

      console.log(`🔨 [CRIAR] PASSO 2: Acionando construção real via BuildController...`);
      const buildResult = await buildActivityViaEventSystem(activity, filledFields);

      const builtActivity: BuiltActivity = {
        id: `built-${activity.id}-${Date.now()}`,
        original_id: activity.id,
        titulo: activity.titulo,
        tipo: activity.tipo,
        categoria: activity.categoria,
        materia: activity.materia,
        nivel_dificuldade: activity.nivel_dificuldade,
        campos_preenchidos: filledFields,
        conteudo_gerado: buildResult.result ? JSON.stringify(buildResult.result) : JSON.stringify(filledFields),
        status: 'completed',
        created_at: new Date().toISOString(),
        saved_to_db: false,
        storage_keys: buildResult.storageKeys
      };

      if (auto_save) {
        console.log(`💾 [CRIAR] PASSO 3: Salvando no banco de dados...`);
        const saveResult = await saveActivityToDB(builtActivity, professor_id);
        builtActivity.saved_to_db = saveResult.success;
        builtActivity.db_id = saveResult.db_id;
        
        if (!saveResult.success) {
          console.warn(`⚠️ [CRIAR] Aviso: Falha ao salvar no DB, mas atividade foi construída`);
        } else {
          console.log(`✅ [CRIAR] Salvo no banco com ID: ${saveResult.db_id}`);
        }
      }

      builtActivities.push(builtActivity);
      progress.completed++;
      
      console.log(`\n✅ [CRIAR] ATIVIDADE CONSTRUÍDA COM SUCESSO: ${activity.titulo}`);
      console.log(`   📋 Campos preenchidos: ${Object.keys(filledFields).length}`);
      console.log(`   💾 Chaves localStorage: ${buildResult.storageKeys.length}`);

      const chargeResult = await powersService.chargeForCapability(
        'criar_atividade',
        1,
        {
          activityId: builtActivity.id,
          activityTitle: activity.titulo,
        }
      );

      if (chargeResult.success && chargeResult.charged > 0) {
        console.log(`   💰 Powers cobrados: ${chargeResult.charged} | Saldo restante: ${chargeResult.remainingBalance}`);
      } else if (!chargeResult.success) {
        console.warn(`   ⚠️ Aviso: Não foi possível cobrar Powers - ${chargeResult.error}`);
      }

    } catch (error) {
      console.error(`\n❌ [CRIAR] FALHA ao construir ${activity.titulo}:`, error);
      
      builtActivities.push({
        id: `failed-${activity.id}-${Date.now()}`,
        original_id: activity.id,
        titulo: activity.titulo,
        tipo: activity.tipo,
        categoria: activity.categoria,
        materia: activity.materia,
        nivel_dificuldade: activity.nivel_dificuldade,
        campos_preenchidos: {},
        status: 'failed',
        error_message: (error as Error).message,
        created_at: new Date().toISOString(),
        saved_to_db: false
      });
      
      progress.failed++;
      errors.push(`${activity.titulo}: ${(error as Error).message}`);
    }

    updateProgress();
  }

  progress.current = null;
  updateProgress();

  const elapsedTime = Date.now() - startTime;
  
  console.log(`\n`);
  console.log(`🎉 ╔═══════════════════════════════════════════════════════════════╗`);
  console.log(`🎉 ║              CONSTRUÇÃO FINALIZADA                            ║`);
  console.log(`🎉 ╚═══════════════════════════════════════════════════════════════╝`);
  console.log(`   ⏱️  Tempo total: ${elapsedTime}ms`);
  console.log(`   ✅ Sucesso: ${progress.completed} atividade(s)`);
  console.log(`   ❌ Falhas: ${progress.failed} atividade(s)`);
  
  if (progress.completed > 0) {
    console.log(`\n   📋 ATIVIDADES CONSTRUÍDAS:`);
    builtActivities
      .filter(a => a.status === 'completed')
      .forEach(a => {
        console.log(`      • ${a.titulo}`);
        if (a.storage_keys) {
          a.storage_keys.forEach(key => console.log(`        💾 ${key}`));
        }
      });
  }
  
  if (errors.length > 0) {
    console.log(`\n   ⚠️  ERROS:`);
    errors.forEach(err => console.log(`      • ${err}`));
  }

  return {
    success: progress.failed === 0,
    activities_built: builtActivities,
    progress,
    errors,
    summary: progress.failed === 0
      ? `Todas as ${progress.completed} atividade(s) foram construídas com sucesso!`
      : `${progress.completed} atividade(s) construída(s), ${progress.failed} falha(s)`,
    metadata: {
      build_timestamp: new Date().toISOString(),
      total_time_ms: elapsedTime,
      saved_to_database: builtActivities.filter(a => a.saved_to_db).length > 0
    }
  };
}

export default criarAtividade;
