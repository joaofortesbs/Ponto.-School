
export const buildSequenciaDidaticaPrompt = (contextData: any): string => {
  const titulo = contextData.tituloTemaAssunto || contextData.title || 'Sequência Didática';
  const anoSerie = contextData.anoSerie || contextData.schoolYear || '6º ano';
  const disciplina = contextData.disciplina || contextData.subject || 'Português';
  const bnccCompetencias = contextData.bnccCompetencias || contextData.competencies || '';
  const publicoAlvo = contextData.publicoAlvo || contextData.context || '';
  const objetivos = contextData.objetivosAprendizagem || contextData.objectives || '';
  const quantidadeAulas = contextData.quantidadeAulas || '4';
  const quantidadeDiagnosticos = contextData.quantidadeDiagnosticos || '2';
  const quantidadeAvaliacoes = contextData.quantidadeAvaliacoes || '2';
  const cronograma = contextData.cronograma || '';

  return `
Você é um especialista em educação responsável por criar sequências didáticas completas e estruturadas. 

DADOS FORNECIDOS:
- Título/Tema: ${titulo}
- Ano/Série: ${anoSerie}
- Disciplina: ${disciplina}
- BNCC Competências: ${bnccCompetencias}
- Público-Alvo: ${publicoAlvo}
- Objetivos de Aprendizagem: ${objetivos}
- Quantidade de Aulas: ${quantidadeAulas}
- Quantidade de Diagnósticos: ${quantidadeDiagnosticos}
- Quantidade de Avaliações: ${quantidadeAvaliacoes}
- Cronograma: ${cronograma}

TAREFA: Criar uma sequência didática completa e detalhada seguindo rigorosamente a estrutura abaixo.

IMPORTANTE: Responda APENAS com o JSON estruturado, sem texto adicional antes ou depois.

{
  "tituloTemaAssunto": "${titulo}",
  "anoSerie": "${anoSerie}",
  "disciplina": "${disciplina}",
  "bnccCompetencias": "${bnccCompetencias || 'Competências específicas da disciplina conforme BNCC'}",
  "publicoAlvo": "${publicoAlvo || 'Estudantes do ' + anoSerie}",
  "objetivosAprendizagem": "${objetivos || 'Desenvolver conhecimentos e habilidades relacionados ao tema'}",
  "quantidadeAulas": "${quantidadeAulas}",
  "quantidadeDiagnosticos": "${quantidadeDiagnosticos}",
  "quantidadeAvaliacoes": "${quantidadeAvaliacoes}",
  "cronograma": "${cronograma || 'Cronograma flexível conforme calendário escolar'}",
  "estruturaDetalhada": {
    "introducao": {
      "titulo": "Introdução à Sequência Didática",
      "descricao": "Apresentação contextualizada do tema e sua relevância para os estudantes",
      "duracaoEstimada": "1 aula",
      "recursosNecessarios": ["Material audiovisual", "Textos introdutórios"]
    },
    "desenvolvimentoPorAula": [
      {
        "numeroAula": 1,
        "tema": "Aula introdutória sobre ${titulo}",
        "objetivosEspecificos": "Apresentar o tema e despertar o interesse dos estudantes",
        "metodologia": "Aula expositiva dialogada com recursos visuais",
        "recursosDidaticos": ["Slides", "Vídeos", "Textos"],
        "atividadesPropostas": "Discussão em grupo sobre conhecimentos prévios",
        "avaliacaoProcessual": "Observação da participação dos estudantes",
        "duracaoMinutos": 50
      }
    ],
    "avaliacoes": {
      "diagnostica": {
        "descricao": "Avaliação inicial para verificar conhecimentos prévios",
        "instrumentos": ["Questionário", "Roda de conversa"],
        "criterios": "Identificação do nível de conhecimento dos estudantes"
      },
      "formativa": {
        "descricao": "Avaliações contínuas durante o processo",
        "instrumentos": ["Atividades práticas", "Participação em aula"],
        "criterios": "Acompanhamento do progresso de aprendizagem"
      },
      "somativa": {
        "descricao": "Avaliação final dos objetivos alcançados",
        "instrumentos": ["Prova", "Projeto final"],
        "criterios": "Verificação do domínio dos conteúdos trabalhados"
      }
    },
    "recursosNecessarios": {
      "materiaisDidaticos": ["Livro didático", "Textos complementares", "Recursos audiovisuais"],
      "tecnologicos": ["Computador", "Projetor", "Internet"],
      "fisicos": ["Sala de aula", "Biblioteca", "Laboratório"]
    },
    "referencias": [
      "BNCC - Base Nacional Comum Curricular",
      "Material didático da disciplina",
      "Literatura complementar específica do tema"
    ]
  }
}

Certifique-se de que:
1. Todos os campos obrigatórios estão preenchidos
2. A estrutura está completa e coerente
3. As atividades são adequadas ao ano/série especificado
4. Os objetivos estão alinhados com a BNCC
5. A sequência tem progressão lógica e pedagógica
6. Todas as avaliações estão bem definidas
`;
};
