export interface GroupDetailProps {
  group: {
    id?: string;
    nome?: string;
    descricao?: string;
    imagem?: string;
    membros?: number;
    curso?: string;
    professor?: string;
    dataInicio?: string;
    dataFim?: string;
    status?: string;
    categoria?: string;
    tags?: string[];
    progresso?: number;
  };
  onBack: () => void;
}
