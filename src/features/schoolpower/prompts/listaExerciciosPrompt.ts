
/**
 * Prompt específico para geração de lista de exercícios pelo Gemini
 */
export function buildListaExerciciosPrompt(formData: any): string {
  return `
Você é um especialista em educação e criação de materiais didáticos. Precisa criar uma lista de exercícios estruturada baseada nos seguintes dados:

**DADOS DA ATIVIDADE:**
- Título: ${formData.titulo || 'Lista de Exercícios'}
- Disciplina: ${formData.disciplina || 'Não especificada'}
- Tema Principal: ${formData.tema || 'Não especificado'}
- Tipo de Questões: ${formData.tipoQuestoes || 'Mista'}
- Número de Questões: ${formData.numeroQuestoes || 10}
- Nível de Dificuldade: ${formData.dificuldade || 'Médio'}
- Conteúdo Programático: ${formData.conteudoPrograma || 'Não especificado'}
- Objetivos de Aprendizagem: ${formData.objetivos || 'Não especificado'}
- Tempo Estimado: ${formData.tempoEstimado || 45} minutos
- Observações: ${formData.observacoes || 'Nenhuma'}

**INSTRUÇÕES PARA CRIAÇÃO:**

1. **Formato de Saída**: Retorne APENAS um JSON válido no seguinte formato:
{
  "titulo": "Nome da Lista de Exercícios",
  "disciplina": "Nome da Disciplina",
  "tema": "Tema Principal",
  "objetivos": "Objetivos claros de aprendizagem",
  "instrucoes": "Instruções gerais para resolução",
  "questoes": [
    {
      "id": 1,
      "tipo": "multipla-escolha|discursiva|verdadeiro-falso",
      "enunciado": "Texto da questão clara e bem formulada",
      "alternativas": ["A) Opção 1", "B) Opção 2", "C) Opção 3", "D) Opção 4"],
      "respostaCorreta": 0,
      "explicacao": "Explicação detalhada da resposta correta",
      "dificuldade": "facil|medio|dificil",
      "tema": "Subtema específico da questão"
    }
  ]
}

2. **Tipos de Questões por Configuração:**
   - Múltipla Escolha: 4 alternativas (A, B, C, D)
   - Verdadeiro ou Falso: 2 alternativas (Verdadeiro, Falso)
   - Discursivas: Sem alternativas, apenas enunciado
   - Mista: Combine os tipos conforme apropriado

3. **Qualidade das Questões:**
   - Enunciados claros e sem ambiguidade
   - Questões progressivas em complexidade
   - Alternativas plausíveis nas múltipla escolha
   - Explicações educativas e construtivas
   - Alinhamento com os objetivos de aprendizagem

4. **Distribuição de Dificuldade:**
   - Fácil: 30% das questões
   - Médio: 50% das questões  
   - Difícil: 20% das questões

5. **Conteúdo Educacional:**
   - Questões devem abordar conceitos fundamentais
   - Incluir aplicação prática dos conhecimentos
   - Estimular pensamento crítico
   - Conectar teoria com exemplos reais

**IMPORTANTE:**
- Retorne APENAS o JSON válido, sem texto adicional
- Todas as questões devem estar completas e bem estruturadas
- As explicações devem ser educativas e claras
- Respeite rigorosamente o número de questões solicitado
- Adapte o vocabulário ao nível educacional apropriado

Crie agora a lista de exercícios seguindo estas especificações:
`;
}

export default buildListaExerciciosPrompt;
