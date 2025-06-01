export interface GrupoEstudo {
  id: string;
  nome: string;
  topico: string;
  disciplina: string;
  membros: number;
  proximaReuniao: string;
  progresso: number;
  novasMensagens: boolean;
  nivel: string;
  imagem: string;
  curso: string;
  descricao: string;
  tags: string[];
  dataInicio?: string;
  matchScore?: number;
}

// Array vazio - preparado para receber novos dados no futuro
export const gruposEstudo: GrupoEstudo[] = [];