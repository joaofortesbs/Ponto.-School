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
  curso?: string;
  descricao?: string;
  tags?: string[];
  dataInicio?: string;
  matchScore?: number;
}

export const gruposEstudo: GrupoEstudo[] = [
  // Física - Mecânica Quântica Avançada (Original)
  {
    id: "fis-mecanica-quantica-avancada",
    nome: "Matemática",
    topico: "Mecânica Quântica",
    disciplina: "Física",
    membros: 8,
    proximaReuniao: "14/03, 17:00",
    progresso: 75,
    novasMensagens: true,
    nivel: "Avançado",
    imagem:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    curso: "Física",
    descricao:
      "Grupo dedicado ao estudo de mecânica quântica e suas aplicações na física moderna. Discutimos desde os fundamentos até aplicações avançadas como computação quântica e criptografia quântica.",
    tags: ["quântica", "física", "avançado"],
    dataInicio: "05/01/2023",
    matchScore: 98,
  },
  // Física - Cópia de Mecânica Quântica Avançada
  {
    id: "fis-mecanica-quantica-avancada-copia",
    nome: "Mecânica Quântica Avançada (Cópia)",
    topico: "Mecânica Quântica",
    disciplina: "Física",
    membros: 3,
    proximaReuniao: "16/03, 18:00",
    progresso: 68,
    novasMensagens: true,
    nivel: "Avançado",
    imagem:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    curso: "Física",
    descricao:
      "Grupo dedicado ao estudo de mecânica quântica e suas aplicações na física moderna. Discutimos desde os fundamentos até aplicações avançadas como computação quântica e criptografia quântica.",
    tags: ["quântica", "física", "avançado"],
    dataInicio: "10/01/2023",
    matchScore: 92,
  },
  // Física - Segunda Cópia de Mecânica Quântica Avançada
  {
    id: "fis-mecanica-quantica-avancada-copia-2",
    nome: "Mecânica Quântica Avançada (Cópia 2)",
    topico: "Mecânica Quântica",
    disciplina: "Física",
    membros: 5,
    proximaReuniao: "18/03, 19:30",
    progresso: 72,
    novasMensagens: true,
    nivel: "Avançado",
    imagem:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    curso: "Física",
    descricao:
      "Grupo dedicado ao estudo de mecânica quântica e suas aplicações na física moderna. Discutimos desde os fundamentos até aplicações avançadas como computação quântica e criptografia quântica.",
    tags: ["quântica", "física", "avançado"],
    dataInicio: "15/01/2023",
    matchScore: 95,
  },
  // Física - Projeto Final de Física Aplicada
  {
    id: "fis-projeto-final-fisica-aplicada",
    nome: "Projeto Final de Física Aplicada",
    topico: "Física Aplicada",
    disciplina: "Física",
    membros: 6,
    proximaReuniao: "20/03, 16:00",
    progresso: 60,
    novasMensagens: true,
    nivel: "Avançado",
    imagem:
      "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&q=80",
    curso: "Física",
    descricao:
      "Grupo dedicado ao desenvolvimento de projetos finais em física aplicada, com foco em soluções práticas e inovadoras para problemas reais.",
    tags: ["projeto", "aplicação", "inovação"],
    dataInicio: "01/02/2023",
    matchScore: 90,
  },
  // Matemática - Cálculo Avançado e Aplicações
  {
    id: "mat-calculo-avancado-aplicacoes",
    nome: "Cálculo Avançado e Aplicações",
    topico: "Cálculo",
    disciplina: "Matemática",
    membros: 10,
    proximaReuniao: "19/03, 15:30",
    progresso: 65,
    novasMensagens: true,
    nivel: "Avançado",
    imagem:
      "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800&q=80",
    curso: "Matemática",
    descricao:
      "Grupo focado no estudo de cálculo avançado e suas aplicações em diversas áreas como física, engenharia e economia.",
    tags: ["cálculo", "aplicações", "modelagem"],
    dataInicio: "05/02/2023",
    matchScore: 94,
  },
  // Matemática
  {
    id: "mat-funcao-1grau",
    nome: "Função 1° Grau",
    topico: "Função 1° Grau",
    disciplina: "Matemática",
    membros: 18,
    proximaReuniao: "15/06/2023, 19:00",
    progresso: 75,
    novasMensagens: true,
    nivel: "Intermediário",
    imagem:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    curso: "Matemática",
    descricao:
      "Grupo dedicado ao estudo de funções do primeiro grau, suas aplicações e resolução de problemas.",
    tags: ["álgebra", "funções", "gráficos"],
    dataInicio: "10/01/2023",
    matchScore: 92,
  },
  {
    id: "mat-dizima-periodica",
    nome: "Dízima Periódica",
    topico: "Dízima Periódica",
    disciplina: "Matemática",
    membros: 12,
    proximaReuniao: "18/06/2023, 17:30",
    progresso: 60,
    novasMensagens: false,
    nivel: "Básico",
    imagem:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",
    curso: "Matemática",
    descricao:
      "Estudo sobre dízimas periódicas, frações geratrizes e aplicações práticas.",
    tags: ["números", "frações", "decimais"],
    dataInicio: "15/02/2023",
    matchScore: 85,
  },
  {
    id: "mat-conjuntos",
    nome: "Conjuntos",
    topico: "Conjuntos",
    disciplina: "Matemática",
    membros: 15,
    proximaReuniao: "20/06/2023, 18:00",
    progresso: 80,
    novasMensagens: true,
    nivel: "Básico",
    imagem:
      "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=800&q=80",
    curso: "Matemática",
    descricao:
      "Grupo para estudo da teoria dos conjuntos, operações e aplicações em problemas.",
    tags: ["conjuntos", "lógica", "operações"],
    dataInicio: "05/03/2023",
    matchScore: 88,
  },

  // Língua Portuguesa
  {
    id: "port-interpretacao",
    nome: "Interpretação de Texto",
    topico: "Interpretação de Texto",
    disciplina: "Língua Portuguesa",
    membros: 22,
    proximaReuniao: "16/06/2023, 19:30",
    progresso: 70,
    novasMensagens: true,
    nivel: "Intermediário",
    imagem:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
    curso: "Letras",
    descricao:
      "Grupo focado em técnicas de interpretação textual para vestibulares e concursos.",
    tags: ["leitura", "compreensão", "análise"],
    dataInicio: "20/01/2023",
    matchScore: 94,
  },
  {
    id: "port-literatura",
    nome: "Literatura",
    topico: "Literatura",
    disciplina: "Língua Portuguesa",
    membros: 19,
    proximaReuniao: "19/06/2023, 18:30",
    progresso: 65,
    novasMensagens: false,
    nivel: "Avançado",
    imagem:
      "https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=800&q=80",
    curso: "Letras",
    descricao:
      "Estudo das escolas literárias brasileiras e portuguesas, com análise de obras clássicas.",
    tags: ["literatura", "obras", "análise"],
    dataInicio: "12/02/2023",
    matchScore: 90,
  },
  {
    id: "port-genero-textual",
    nome: "Gênero Textual",
    topico: "Gênero Textual",
    disciplina: "Língua Portuguesa",
    membros: 16,
    proximaReuniao: "21/06/2023, 17:00",
    progresso: 75,
    novasMensagens: true,
    nivel: "Intermediário",
    imagem:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    curso: "Letras",
    descricao:
      "Grupo para estudo dos diferentes gêneros textuais e suas características.",
    tags: ["redação", "gêneros", "escrita"],
    dataInicio: "25/02/2023",
    matchScore: 87,
  },

  // Química
  {
    id: "quim-densidade",
    nome: "Densidade",
    topico: "Densidade",
    disciplina: "Química",
    membros: 14,
    proximaReuniao: "17/06/2023, 16:00",
    progresso: 85,
    novasMensagens: false,
    nivel: "Básico",
    imagem:
      "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&q=80",
    curso: "Química",
    descricao:
      "Estudo do conceito de densidade, cálculos e aplicações práticas em laboratório.",
    tags: ["físico-química", "propriedades", "experimentos"],
    dataInicio: "05/02/2023",
    matchScore: 83,
  },
  {
    id: "quim-sistemas",
    nome: "Sistemas - Química",
    topico: "Sistemas - Química",
    disciplina: "Química",
    membros: 13,
    proximaReuniao: "22/06/2023, 18:30",
    progresso: 60,
    novasMensagens: true,
    nivel: "Intermediário",
    imagem:
      "https://images.unsplash.com/photo-1616069093412-37unlnua0d7?w=800&q=80",
    curso: "Química",
    descricao: "Grupo para estudo de sistemas químicos, equilíbrio e reações.",
    tags: ["sistemas", "equilíbrio", "reações"],
    dataInicio: "15/03/2023",
    matchScore: 81,
  },
  {
    id: "quim-misturas",
    nome: "Misturas - Química",
    topico: "Misturas - Química",
    disciplina: "Química",
    membros: 15,
    proximaReuniao: "23/06/2023, 17:30",
    progresso: 70,
    novasMensagens: false,
    nivel: "Básico",
    imagem:
      "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80",
    curso: "Química",
    descricao:
      "Estudo sobre tipos de misturas, métodos de separação e aplicações.",
    tags: ["misturas", "separação", "soluções"],
    dataInicio: "10/03/2023",
    matchScore: 85,
  },

  // Física
  {
    id: "fis-notacao-cientifica",
    nome: "Notação Científica",
    topico: "Notação Científica",
    disciplina: "Física",
    membros: 11,
    proximaReuniao: "18/06/2023, 16:30",
    progresso: 90,
    novasMensagens: true,
    nivel: "Básico",
    imagem:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    curso: "Física",
    descricao:
      "Grupo para estudo e prática de notação científica e operações com potências.",
    tags: ["notação", "cálculos", "potências"],
    dataInicio: "20/02/2023",
    matchScore: 82,
  },
  {
    id: "fis-velocidade-media",
    nome: "Velocidade Média",
    topico: "Velocidade Média",
    disciplina: "Física",
    membros: 17,
    proximaReuniao: "24/06/2023, 19:00",
    progresso: 75,
    novasMensagens: false,
    nivel: "Intermediário",
    imagem:
      "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&q=80",
    curso: "Física",
    descricao:
      "Estudo de cinemática com foco em velocidade média, aceleração e gráficos de movimento.",
    tags: ["cinemática", "movimento", "gráficos"],
    dataInicio: "01/03/2023",
    matchScore: 89,
  },

  // Biologia
  {
    id: "bio-celulas-fotossintese",
    nome: "Células - Fotossíntese",
    topico: "Células - Fotossíntese",
    disciplina: "Biologia",
    membros: 20,
    proximaReuniao: "19/06/2023, 18:00",
    progresso: 80,
    novasMensagens: true,
    nivel: "Intermediário",
    imagem:
      "https://images.unsplash.com/photo-1618015358954-331fab1c2ddf?w=800&q=80",
    curso: "Biologia",
    descricao:
      "Grupo dedicado ao estudo da fotossíntese, estruturas celulares e processos bioquímicos.",
    tags: ["células", "fotossíntese", "bioquímica"],
    dataInicio: "15/01/2023",
    matchScore: 93,
  },
  {
    id: "bio-fermentacao",
    nome: "Fermentação",
    topico: "Fermentação",
    disciplina: "Biologia",
    membros: 14,
    proximaReuniao: "25/06/2023, 17:00",
    progresso: 65,
    novasMensagens: false,
    nivel: "Avançado",
    imagem:
      "https://images.unsplash.com/photo-1516189974004-aa494e0423b5?w=800&q=80",
    curso: "Biologia",
    descricao:
      "Estudo dos processos de fermentação, respiração celular e metabolismo energético.",
    tags: ["metabolismo", "respiração", "energia"],
    dataInicio: "10/02/2023",
    matchScore: 86,
  },

  // Geografia
  {
    id: "geo-relevo",
    nome: "Relevo",
    topico: "Relevo",
    disciplina: "Geografia",
    membros: 16,
    proximaReuniao: "20/06/2023, 19:30",
    progresso: 70,
    novasMensagens: true,
    nivel: "Intermediário",
    imagem:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
    curso: "Geografia",
    descricao:
      "Grupo para estudo das formas de relevo, processos de formação e transformação da paisagem.",
    tags: ["geomorfologia", "paisagem", "formações"],
    dataInicio: "25/01/2023",
    matchScore: 84,
  },
  {
    id: "geo-projecoes",
    nome: "Projeções",
    topico: "Projeções",
    disciplina: "Geografia",
    membros: 12,
    proximaReuniao: "26/06/2023, 18:30",
    progresso: 75,
    novasMensagens: false,
    nivel: "Avançado",
    imagem:
      "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80",
    curso: "Geografia",
    descricao:
      "Estudo das diferentes projeções cartográficas, suas características e aplicações.",
    tags: ["cartografia", "mapas", "escalas"],
    dataInicio: "05/03/2023",
    matchScore: 80,
  },
  {
    id: "geo-geomorfologia",
    nome: "Geomorfologia",
    topico: "Geomorfologia",
    disciplina: "Geografia",
    membros: 15,
    proximaReuniao: "27/06/2023, 17:30",
    progresso: 65,
    novasMensagens: true,
    nivel: "Avançado",
    imagem:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    curso: "Geografia",
    descricao:
      "Grupo dedicado ao estudo aprofundado da geomorfologia, processos erosivos e formação do relevo.",
    tags: ["relevo", "erosão", "formação"],
    dataInicio: "15/02/2023",
    matchScore: 87,
  },

  // História
  {
    id: "hist-memoria",
    nome: "Memória",
    topico: "Memória",
    disciplina: "História",
    membros: 18,
    proximaReuniao: "21/06/2023, 19:00",
    progresso: 60,
    novasMensagens: false,
    nivel: "Intermediário",
    imagem:
      "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&q=80",
    curso: "História",
    descricao:
      "Grupo para discussão sobre memória histórica, patrimônio cultural e identidade.",
    tags: ["memória", "patrimônio", "identidade"],
    dataInicio: "20/02/2023",
    matchScore: 85,
  },

  // Filosofia
  {
    id: "fil-senso-comum",
    nome: "Senso Comum",
    topico: "Senso Comum",
    disciplina: "Filosofia",
    membros: 13,
    proximaReuniao: "22/06/2023, 18:00",
    progresso: 75,
    novasMensagens: true,
    nivel: "Básico",
    imagem:
      "https://images.unsplash.com/photo-1544396821-4dd40b938ad3?w=800&q=80",
    curso: "Filosofia",
    descricao:
      "Estudo sobre o senso comum, conhecimento científico e epistemologia.",
    tags: ["epistemologia", "conhecimento", "ciência"],
    dataInicio: "10/03/2023",
    matchScore: 82,
  },
  {
    id: "fil-discurso-filosofico",
    nome: "Discurso Filosófico",
    topico: "Discurso Filosófico",
    disciplina: "Filosofia",
    membros: 15,
    proximaReuniao: "28/06/2023, 19:30",
    progresso: 70,
    novasMensagens: false,
    nivel: "Avançado",
    imagem:
      "https://images.unsplash.com/photo-1555861496-0666c8981751?w=800&q=80",
    curso: "Filosofia",
    descricao:
      "Grupo para análise do discurso filosófico, argumentação e retórica.",
    tags: ["discurso", "argumentação", "lógica"],
    dataInicio: "01/03/2023",
    matchScore: 88,
  },

  // Sociologia
  {
    id: "soc-iluminismo",
    nome: "Iluminismo",
    topico: "Iluminismo",
    disciplina: "Sociologia",
    membros: 19,
    proximaReuniao: "23/06/2023, 18:30",
    progresso: 85,
    novasMensagens: true,
    nivel: "Intermediário",
    imagem:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
    curso: "Sociologia",
    descricao:
      "Estudo do movimento iluminista, seus pensadores e impacto na sociedade moderna.",
    tags: ["iluminismo", "pensadores", "modernidade"],
    dataInicio: "15/01/2023",
    matchScore: 91,
  },
  {
    id: "soc-positivismo",
    nome: "Positivismo",
    topico: "Positivismo",
    disciplina: "Sociologia",
    membros: 14,
    proximaReuniao: "29/06/2023, 17:00",
    progresso: 75,
    novasMensagens: false,
    nivel: "Avançado",
    imagem:
      "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&q=80",
    curso: "Sociologia",
    descricao:
      "Grupo dedicado ao estudo do positivismo, Auguste Comte e sua influência no pensamento social.",
    tags: ["positivismo", "Comte", "ciência"],
    dataInicio: "20/02/2023",
    matchScore: 83,
  },
];

export const getGruposByDisciplina = (disciplina: string) => {
  return gruposEstudo.filter((grupo) => grupo.disciplina === disciplina);
};

export const getGrupoById = (id: string) => {
  return gruposEstudo.find((grupo) => grupo.id === id);
};

export const getAllDisciplinas = () => {
  const disciplinas = new Set(gruposEstudo.map((grupo) => grupo.disciplina));
  return Array.from(disciplinas);
};

export const getGruposByTopico = (topico: string) => {
  return gruposEstudo.filter((grupo) => grupo.topico === topico);
};

export const getAllTopicos = () => {
  const topicos = new Set(gruposEstudo.map((grupo) => grupo.topico));
  return Array.from(topicos);
};

export const getTopicosByDisciplina = (disciplina: string) => {
  const grupos = getGruposByDisciplina(disciplina);
  const topicos = new Set(grupos.map((grupo) => grupo.topico));
  return Array.from(topicos);
};
