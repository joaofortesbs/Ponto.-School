
interface ActivityFormData {
  title: string;
  description: string;
  subject: string;
  difficulty: string;
  format: string;
  duration: string;
  objectives: string;
  materials: string;
  instructions: string;
  evaluation: string;
}

interface GeneratedActivity {
  content: string;
  metadata: {
    estimatedTime: string;
    difficulty: string;
    format: string;
  };
}

export const generateActivity = async (formData: ActivityFormData): Promise<GeneratedActivity> => {
  // Simular delay da API
  await new Promise(resolve => setTimeout(resolve, 2000));

  const templates = {
    'Lista de Exercícios': `
# ${formData.title}

## Descrição da Atividade
${formData.description}

## Objetivos de Aprendizagem
${formData.objectives || 'Desenvolver habilidades específicas da disciplina através de exercícios práticos.'}

## Materiais Necessários
${formData.materials || '• Folha de exercícios\n• Material de escrita\n• Material de apoio (se necessário)'}

## Duração Estimada
${formData.duration}

## Instruções para o Aluno
${formData.instructions || `
1. Leia atentamente cada questão antes de responder
2. Organize seu tempo de acordo com o número de exercícios
3. Revise suas respostas antes de finalizar
4. Em caso de dúvidas, consulte o material de apoio
`}

## Exercícios

### Exercício 1: Conceitos Fundamentais
**Questão 1.1:** Defina os conceitos principais abordados na atividade.

**Questão 1.2:** Explique a importância desses conceitos no contexto da disciplina.

### Exercício 2: Aplicação Prática
**Questão 2.1:** Resolva os problemas apresentados aplicando os conceitos estudados.

**Questão 2.2:** Justifique suas respostas com base na teoria apresentada.

### Exercício 3: Análise e Síntese
**Questão 3.1:** Analise os exemplos fornecidos e identifique padrões.

**Questão 3.2:** Crie um resumo dos principais pontos abordados.

## Critérios de Avaliação
${formData.evaluation || `
- Compreensão dos conceitos: 40%
- Aplicação prática: 35%
- Clareza na apresentação: 25%
`}

## Recursos Adicionais
- Material de leitura complementar
- Vídeos explicativos relacionados
- Exercícios extras para prática
    `,
    
    'Prova': `
# ${formData.title}

**Disciplina:** ${formData.subject}  
**Duração:** ${formData.duration}  
**Dificuldade:** ${formData.difficulty}

---

## Instruções Gerais
${formData.instructions || `
1. Leia todas as questões antes de começar a responder
2. Responda com clareza e objetividade
3. Gerencie seu tempo adequadamente
4. Revise suas respostas antes de entregar
`}

## Questões

### Parte I - Questões Objetivas (40 pontos)

**Questão 1** (10 pontos)
Sobre os conceitos fundamentais da disciplina, assinale a alternativa correta:

a) Primeira alternativa
b) Segunda alternativa  
c) Terceira alternativa
d) Quarta alternativa

**Questão 2** (10 pontos)
Analise as afirmações abaixo e marque V para verdadeiro e F para falso:

( ) Primeira afirmação
( ) Segunda afirmação
( ) Terceira afirmação
( ) Quarta afirmação

### Parte II - Questões Dissertativas (60 pontos)

**Questão 3** (20 pontos)
Explique detalhadamente o conceito principal abordado na disciplina e sua aplicação prática.

**Questão 4** (20 pontos)
Resolva o problema apresentado, mostrando todos os passos da resolução.

**Questão 5** (20 pontos)
Elabore uma análise crítica sobre o tema proposto, apresentando argumentos fundamentados.

## Critérios de Avaliação
${formData.evaluation || `
- Objetivas: Resposta correta = pontuação total
- Dissertativas: Conteúdo (60%), Organização (25%), Clareza (15%)
`}
    `,
    
    'Jogo Didático': `
# ${formData.title}

## Descrição do Jogo
${formData.description}

## Objetivos de Aprendizagem
${formData.objectives || 'Promover o aprendizado de forma lúdica e interativa.'}

## Materiais Necessários
${formData.materials || '• Cartas ou fichas\n• Tabuleiro (se aplicável)\n• Dados ou marcadores\n• Cronômetro'}

## Número de Participantes
Ideal para: 2 a 6 jogadores

## Duração
${formData.duration}

## Regras do Jogo

### Preparação
1. Organize os materiais conforme especificado
2. Explique as regras para todos os participantes
3. Defina a ordem de jogada

### Desenvolvimento
1. **Rodada Inicial:** Cada jogador recebe seu material inicial
2. **Turnos:** Os jogadores alternam suas jogadas seguindo as regras
3. **Desafios:** Resolução de questões ou tarefas durante o jogo
4. **Pontuação:** Sistema de pontos baseado no desempenho

### Finalização
O jogo termina quando [condição de término] e o vencedor é determinado por [critério de vitória].

## Variações do Jogo
- **Modo Cooperativo:** Todos trabalham juntos para alcançar um objetivo comum
- **Modo Competitivo:** Cada jogador compete individualmente
- **Modo Equipes:** Divisão em grupos para competição

## Avaliação Durante o Jogo
${formData.evaluation || `
- Participação ativa: 30%
- Compreensão dos conceitos: 40%
- Colaboração e fair play: 30%
`}
    `
  };

  // Determinar o template baseado no título ou tipo
  let template = templates['Lista de Exercícios']; // padrão
  
  if (formData.title.toLowerCase().includes('prova') || formData.title.toLowerCase().includes('avaliação')) {
    template = templates['Prova'];
  } else if (formData.title.toLowerCase().includes('jogo')) {
    template = templates['Jogo Didático'];
  }

  return {
    content: template,
    metadata: {
      estimatedTime: formData.duration,
      difficulty: formData.difficulty,
      format: formData.format
    }
  };
};

export const validateFormData = (formData: ActivityFormData): string[] => {
  const errors: string[] = [];
  
  if (!formData.title.trim()) {
    errors.push('Título é obrigatório');
  }
  
  if (!formData.description.trim()) {
    errors.push('Descrição é obrigatória');
  }
  
  if (!formData.subject) {
    errors.push('Disciplina deve ser selecionada');
  }
  
  return errors;
};
