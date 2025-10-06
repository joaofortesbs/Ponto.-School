export type JoinStatus = "not-joined" | "pending" | "joined";

export interface GroupDetailProps {
  group: {
    id?: string;
    nome?: string;
    disciplina?: string;
    membros?: any[];
    proximaReuniao?: string;
    progresso?: number;
    novasMensagens?: boolean;
    nivel?: string;
    imagem?: string;
    curso?: string;
    descricao?: string;
    tags?: string[];
    dataInicio?: string;
    matchScore?: number;
    joinStatus?: JoinStatus;
  };
  onBack: () => void;
}
