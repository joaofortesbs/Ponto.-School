import type { PesquisarAtividadesDisponiveisInput } from '../schemas/pesquisar-atividades-schema';

interface Atividade {
  id: string;
  titulo: string;
  tipo: string;
  materia: string;
  nivel_dificuldade: string;
  tags: string[];
  descricao: string;
  template: any;
  requisitos?: any;
}

const ATIVIDADES_DISPONIVEIS: Atividade[] = [
  {
    id: "ativ_001",
    titulo: "Equações do 1º Grau",
    tipo: "exercicio",
    materia: "matematica",
    nivel_dificuldade: "intermediario",
    tags: ["algebra", "equacoes", "resolucao_problemas"],
    descricao: "Atividade completa sobre resolução de equações de primeiro grau",
    template: {
      estrutura: "quiz",
      numero_questoes: 10,
      tempo_estimado: 30,
      pontuacao_maxima: 100
    },
    requisitos: {
      conhecimentos_previos: ["operacoes_basicas", "variavel"],
      nivel_ensino: ["7ano", "8ano"]
    }
  },
  {
    id: "ativ_002",
    titulo: "Interpretação Textual - Fábulas",
    tipo: "leitura_interpretacao",
    materia: "portugues",
    nivel_dificuldade: "basico",
    tags: ["leitura", "interpretacao", "fabulas"],
    descricao: "Atividade de interpretação de texto com fábulas clássicas",
    template: {
      estrutura: "questoes_abertas",
      numero_questoes: 5,
      tempo_estimado: 40,
      pontuacao_maxima: 50
    }
  },
  {
    id: "ativ_003",
    titulo: "Frações e Decimais",
    tipo: "exercicio",
    materia: "matematica",
    nivel_dificuldade: "basico",
    tags: ["fracoes", "decimais", "numeros"],
    descricao: "Exercícios práticos sobre conversão entre frações e decimais",
    template: {
      estrutura: "quiz",
      numero_questoes: 15,
      tempo_estimado: 25,
      pontuacao_maxima: 100
    }
  },
  {
    id: "ativ_004",
    titulo: "Produção de Texto Narrativo",
    tipo: "producao_textual",
    materia: "portugues",
    nivel_dificuldade: "intermediario",
    tags: ["escrita", "narrativa", "criatividade"],
    descricao: "Atividade de produção de texto narrativo com tema livre",
    template: {
      estrutura: "texto_livre",
      minimo_palavras: 200,
      tempo_estimado: 45,
      pontuacao_maxima: 100
    }
  },
  {
    id: "ativ_005",
    titulo: "Geometria Plana - Áreas",
    tipo: "exercicio",
    materia: "matematica",
    nivel_dificuldade: "avancado",
    tags: ["geometria", "areas", "formulas"],
    descricao: "Cálculo de áreas de figuras planas complexas",
    template: {
      estrutura: "quiz",
      numero_questoes: 8,
      tempo_estimado: 40,
      pontuacao_maxima: 100
    }
  },
  {
    id: "ativ_006",
    titulo: "Quiz de Ciências - Sistema Solar",
    tipo: "quiz",
    materia: "ciencias",
    nivel_dificuldade: "basico",
    tags: ["astronomia", "planetas", "sistema_solar"],
    descricao: "Quiz interativo sobre o sistema solar e seus planetas",
    template: {
      estrutura: "quiz_multipla_escolha",
      numero_questoes: 12,
      tempo_estimado: 20,
      pontuacao_maxima: 120
    }
  },
  {
    id: "ativ_007",
    titulo: "Verbos no Passado",
    tipo: "exercicio",
    materia: "portugues",
    nivel_dificuldade: "intermediario",
    tags: ["gramatica", "verbos", "conjugacao"],
    descricao: "Exercícios de conjugação verbal no pretérito",
    template: {
      estrutura: "completar_lacunas",
      numero_questoes: 20,
      tempo_estimado: 30,
      pontuacao_maxima: 100
    }
  },
  {
    id: "ativ_008",
    titulo: "Projeto de História Local",
    tipo: "projeto",
    materia: "historia",
    nivel_dificuldade: "avancado",
    tags: ["pesquisa", "historia_local", "comunidade"],
    descricao: "Projeto de pesquisa sobre a história do bairro ou cidade",
    template: {
      estrutura: "projeto_pesquisa",
      etapas: 4,
      tempo_estimado: 180,
      pontuacao_maxima: 200
    }
  },
  {
    id: "ativ_009",
    titulo: "Porcentagem no Dia a Dia",
    tipo: "exercicio",
    materia: "matematica",
    nivel_dificuldade: "intermediario",
    tags: ["porcentagem", "aplicacoes", "financas"],
    descricao: "Problemas práticos envolvendo porcentagem em situações reais",
    template: {
      estrutura: "problemas_contextualizados",
      numero_questoes: 10,
      tempo_estimado: 35,
      pontuacao_maxima: 100
    }
  },
  {
    id: "ativ_010",
    titulo: "Experimento de Física - Movimento",
    tipo: "experimento",
    materia: "fisica",
    nivel_dificuldade: "intermediario",
    tags: ["movimento", "experimento", "mecanica"],
    descricao: "Experimento prático sobre movimento retilíneo uniforme",
    template: {
      estrutura: "roteiro_experimental",
      etapas: 5,
      tempo_estimado: 60,
      pontuacao_maxima: 100
    }
  }
];

export async function pesquisarAtividadesDisponiveis(
  params: PesquisarAtividadesDisponiveisInput
) {
  console.log('🔍 [Capability:PESQUISAR] Pesquisando atividades disponíveis');

  let atividades = [...ATIVIDADES_DISPONIVEIS];

  if (params.filtros) {
    const { materia, tipo, nivel_dificuldade, tags, busca_texto } = params.filtros;

    if (materia) {
      atividades = atividades.filter(a => 
        a.materia.toLowerCase() === materia.toLowerCase()
      );
    }

    if (tipo) {
      atividades = atividades.filter(a => 
        a.tipo.toLowerCase() === tipo.toLowerCase()
      );
    }

    if (nivel_dificuldade) {
      atividades = atividades.filter(a => 
        a.nivel_dificuldade === nivel_dificuldade
      );
    }

    if (tags && tags.length > 0) {
      atividades = atividades.filter(a => 
        a.tags.some(tag => 
          tags.some(filterTag => 
            tag.toLowerCase().includes(filterTag.toLowerCase())
          )
        )
      );
    }

    if (busca_texto) {
      const searchLower = busca_texto.toLowerCase();
      atividades = atividades.filter(a => 
        a.titulo.toLowerCase().includes(searchLower) ||
        a.descricao.toLowerCase().includes(searchLower)
      );
    }
  }

  console.log(`✅ [Capability:PESQUISAR] Encontradas ${atividades.length} atividades`);

  return {
    success: true,
    total_encontrado: atividades.length,
    atividades: atividades.map(a => ({
      id: a.id,
      titulo: a.titulo,
      tipo: a.tipo,
      materia: a.materia,
      nivel_dificuldade: a.nivel_dificuldade,
      tags: a.tags,
      descricao: a.descricao,
      template: a.template,
      requisitos: a.requisitos
    })),
    filtros_aplicados: params.filtros || {},
    mensagem: `Encontrei ${atividades.length} atividade(s) disponível(is) que combinam com o que você procura.`
  };
}
