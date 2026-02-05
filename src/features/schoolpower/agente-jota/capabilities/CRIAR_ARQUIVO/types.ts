export interface ArtifactSection {
  id: string;
  titulo: string;
  tipo: 'texto' | 'lista' | 'timeline' | 'estatisticas';
  conteudo: string | string[] | TimelineItem[] | Record<string, string>;
  icone?: string;
  copiavel?: boolean;
}

export interface TimelineItem {
  ordem: number;
  tempo: string;
  titulo: string;
  descricao: string;
  dicas?: string[];
}

export interface ArtifactStats {
  total_atividades: number;
  tipos_atividades: Record<string, number>;
  tempo_estimado_aula: string;
  capabilities_executadas: number;
  tempo_processamento: string;
}

export interface ArtifactActivity {
  id: string;
  titulo: string;
  tipo: string;
  materia?: string;
  nivel?: string;
  tema?: string;
  status: 'criada' | 'conteudo_gerado' | 'salva_bd';
}

export interface ArtifactData {
  id: string;
  sessionId: string;
  titulo: string;
  subtitulo?: string;
  tipo: 'dossie' | 'resumo' | 'roadmap' | 'relatorio' | 'generico';
  materia?: string;
  tema_central?: string;
  sections: ArtifactSection[];
  atividades: ArtifactActivity[];
  estatisticas: ArtifactStats;
  status: 'generating' | 'ready' | 'error';
  createdAt: number;
  completedAt?: number;
  error?: string;
}

export interface ArtifactGenerationInput {
  sessionId: string;
  contextoCompleto: string;
  objetivo: string;
  atividadesCriadas: string[];
  etapasCompletas: number;
  totalEtapas: number;
}
