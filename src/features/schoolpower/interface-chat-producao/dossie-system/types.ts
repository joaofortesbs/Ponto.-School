export interface DossieSessionEvent {
  id: string;
  type: 'capability_executed' | 'activity_created' | 'content_generated' | 'plan_created' | 'step_completed' | 'error' | 'user_message' | 'ai_response';
  timestamp: number;
  data: Record<string, any>;
  description: string;
}

export interface DossieActivity {
  id: string;
  titulo: string;
  tipo: string;
  materia?: string;
  nivel?: string;
  tema?: string;
  campos_gerados?: Record<string, any>;
  status: 'criada' | 'conteudo_gerado' | 'salva_bd';
}

export interface DossieContent {
  resumo_executivo: string;
  atividades_criadas: DossieActivity[];
  roadmap_aplicacao: RoadmapItem[];
  ganchos_atencao: string[];
  pilula_pais: string;
  resumo_coordenacao: string;
  estrategia_pedagogica: string;
  estatisticas: DossieStats;
}

export interface RoadmapItem {
  ordem: number;
  tempo: string;
  titulo: string;
  descricao: string;
  atividade_id?: string;
  dicas?: string[];
}

export interface DossieStats {
  total_atividades: number;
  tipos_atividades: Record<string, number>;
  tempo_estimado_aula: string;
  capabilities_executadas: number;
  tempo_processamento: string;
}

export interface DossieData {
  id: string;
  sessionId: string;
  titulo: string;
  materia?: string;
  tema_central?: string;
  content: DossieContent;
  status: 'building' | 'generating' | 'ready' | 'error';
  createdAt: number;
  completedAt?: number;
  error?: string;
}
