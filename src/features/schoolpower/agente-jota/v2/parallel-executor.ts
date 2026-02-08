import { findCapability, executeCapability } from '../capabilities';

export interface ParallelTask {
  id: string;
  capabilityName: string;
  params: Record<string, any>;
  dependsOn: string[];
  priority: number;
}

export interface ParallelResult {
  taskId: string;
  capabilityName: string;
  success: boolean;
  result: any;
  error?: string;
  duration: number;
}

export interface ExecutionPlan {
  layers: ParallelTask[][];
  totalTasks: number;
}

const CAPABILITY_DEPENDENCIES: Record<string, string[]> = {
  'pesquisar_atividades_disponiveis': [],
  'pesquisar_atividades_conta': [],
  'decidir_atividades_criar': ['pesquisar_atividades_disponiveis'],
  'gerar_conteudo_atividades': ['decidir_atividades_criar'],
  'criar_atividade': ['gerar_conteudo_atividades'],
  'salvar_atividades_bd': ['criar_atividade'],
  'criar_arquivo': ['criar_atividade'],
  'planejar_plano_de_acao': [],
};

export function buildExecutionPlan(tasks: ParallelTask[]): ExecutionPlan {
  const layers: ParallelTask[][] = [];
  const completed = new Set<string>();
  const remaining = [...tasks];

  while (remaining.length > 0) {
    const layer: ParallelTask[] = [];

    for (let i = remaining.length - 1; i >= 0; i--) {
      const task = remaining[i];
      const depsResolved = task.dependsOn.every(dep => completed.has(dep));

      if (depsResolved) {
        layer.push(task);
        remaining.splice(i, 1);
      }
    }

    if (layer.length === 0) {
      console.warn('⚠️ [ParallelExecutor] Dependências circulares detectadas, forçando execução');
      layer.push(remaining.shift()!);
    }

    layer.sort((a, b) => a.priority - b.priority);
    layers.push(layer);

    for (const task of layer) {
      completed.add(task.id);
      completed.add(task.capabilityName);
    }
  }

  return { layers, totalTasks: tasks.length };
}

export function getCapabilityDependencies(capabilityName: string): string[] {
  return CAPABILITY_DEPENDENCIES[capabilityName] || [];
}

export function createTasksFromCapabilities(
  capabilityNames: string[],
  params: Record<string, Record<string, any>> = {}
): ParallelTask[] {
  return capabilityNames.map((name, index) => ({
    id: `task-${name}-${Date.now()}`,
    capabilityName: name,
    params: params[name] || {},
    dependsOn: getCapabilityDependencies(name).filter(dep =>
      capabilityNames.includes(dep)
    ),
    priority: index,
  }));
}

export async function executeParallelLayer(
  layer: ParallelTask[],
  onProgress?: (taskId: string, status: string) => void
): Promise<ParallelResult[]> {
  if (layer.length === 1) {
    const task = layer[0];
    onProgress?.(task.id, 'executing');
    const result = await executeSingleTask(task);
    onProgress?.(task.id, result.success ? 'completed' : 'failed');
    return [result];
  }

  console.log(`⚡ [ParallelExecutor] Executando ${layer.length} tasks em paralelo: ${layer.map(t => t.capabilityName).join(', ')}`);

  const promises = layer.map(async (task) => {
    onProgress?.(task.id, 'executing');
    const result = await executeSingleTask(task);
    onProgress?.(task.id, result.success ? 'completed' : 'failed');
    return result;
  });

  const settled = await Promise.allSettled(promises);

  return settled.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }

    return {
      taskId: layer[index].id,
      capabilityName: layer[index].capabilityName,
      success: false,
      result: null,
      error: result.reason instanceof Error ? result.reason.message : String(result.reason),
      duration: 0,
    };
  });
}

async function executeSingleTask(task: ParallelTask): Promise<ParallelResult> {
  const startTime = Date.now();

  try {
    const cap = findCapability(task.capabilityName);
    if (!cap) {
      return {
        taskId: task.id,
        capabilityName: task.capabilityName,
        success: false,
        result: null,
        error: `Capability "${task.capabilityName}" não encontrada`,
        duration: Date.now() - startTime,
      };
    }

    const result = await executeCapability(task.capabilityName, task.params);

    return {
      taskId: task.id,
      capabilityName: task.capabilityName,
      success: result?.success !== false,
      result,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      taskId: task.id,
      capabilityName: task.capabilityName,
      success: false,
      result: null,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    };
  }
}

export async function executeFullPipeline(
  capabilityNames: string[],
  params: Record<string, Record<string, any>> = {},
  onProgress?: (taskId: string, status: string) => void
): Promise<ParallelResult[]> {
  const tasks = createTasksFromCapabilities(capabilityNames, params);
  const plan = buildExecutionPlan(tasks);

  console.log(`📋 [ParallelExecutor] Pipeline com ${plan.layers.length} camadas, ${plan.totalTasks} tasks total`);

  const allResults: ParallelResult[] = [];

  for (let i = 0; i < plan.layers.length; i++) {
    const layer = plan.layers[i];
    console.log(`🔄 [ParallelExecutor] Executando camada ${i + 1}/${plan.layers.length}: ${layer.map(t => t.capabilityName).join(' + ')}`);

    const layerResults = await executeParallelLayer(layer, onProgress);
    allResults.push(...layerResults);

    const failed = layerResults.filter(r => !r.success);
    if (failed.length > 0) {
      console.warn(`⚠️ [ParallelExecutor] ${failed.length} falha(s) na camada ${i + 1}:`, failed.map(f => f.capabilityName));
    }
  }

  return allResults;
}
