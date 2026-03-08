import{u as p,v as m}from"./index-CPYz9D2u.js";import"./vendor-dnd-Bk0uCLZh.js";import"./vendor-react-BnNhJ7M9.js";import"./vendor-pdf-rIeVEN6z.js";import"./vendor-ui-T310bGui.js";import"./vendor-motion-DTXDxMAn.js";import"./vendor-utils-DEVWMqOY.js";import"./vendor-icons-JI-XpGv6.js";class E{async generateFlashCardsContent(e){console.log("🃏 Iniciando geração de Flash Cards com Gemini API:",e);try{if(!e.theme||typeof e.theme!="string"||e.theme.trim()==="")throw new Error("Tema é obrigatório para gerar flash cards");if(!e.topicos||typeof e.topicos!="string"||e.topicos.trim()==="")throw new Error("Tópicos são obrigatórios para gerar flash cards");const o=parseInt(e.numberOfFlashcards?.toString()||"10");if(o<=0||o>50)throw new Error("Número de cards deve estar entre 1 e 50");console.log("✅ Validação inicial passou - Tema:",e.theme,"| Tópicos:",e.topicos,"| Quantidade:",o);const c=this.buildFlashCardsPrompt(e,o);console.log("📝 Prompt enviado para Gemini:",c);const s=await p.generateContent(c);console.log("✅ Resposta recebida do Gemini:",s);const r=this.processGeminiResponse(s,e,o);return console.log("📦 Conteúdo processado dos Flash Cards:",r),r}catch(o){return console.error("❌ Erro ao gerar Flash Cards:",o),this.generateFallbackContent(e)}}buildFlashCardsPrompt(e,o){const c={tema:e.theme,disciplina:e.subject||"Geral",anoSerie:e.schoolYear||"Ensino Médio",objetivo:`Flash Cards sobre ${e.theme}`},s=m(c);return`
Você é um especialista em educação e técnicas de memorização ativa. Gere exatamente ${o} flash cards educativos de ALTA QUALIDADE sobre o tema: "${e.theme}"

CONTEXTO EDUCACIONAL:
- Disciplina: ${e.subject||"Geral"}
- Ano de Escolaridade: ${e.schoolYear||"Ensino Médio"}
- Tópicos Principais: ${e.topicos}
- Contexto de Uso: ${e.context||"Estudos e revisão"}
- Nível de Dificuldade: ${e.difficultyLevel||"Médio"}

${s}

DIRETRIZES PARA CRIAÇÃO:
1. Crie exatamente ${o} flash cards únicos e distintos
2. Para cada card:
   - FRENTE: Uma pergunta clara e direta, conceito-chave ou situação-problema
   - VERSO: Resposta completa com explicação detalhada, exemplo prático e dica mnemônica quando aplicável
3. Varie os tipos de conteúdo:
   - Definições conceituais com exemplos
   - Aplicações práticas do cotidiano
   - Comparações e contrastes entre conceitos
   - Fórmulas com explicação do significado (se aplicável)
   - Conexões interdisciplinares
4. Mantenha linguagem adequada para ${e.schoolYear||"estudantes do ensino médio"}
5. Foque especificamente nos tópicos listados: ${e.topicos}
6. Garanta progressão lógica de dificuldade
7. Cada card deve ter campo "difficulty" indicando "Fácil", "Médio" ou "Difícil"

FORMATO DE RESPOSTA OBRIGATÓRIO (JSON válido):
{
  "title": "Flash Cards: ${e.theme}",
  "description": "Flash cards educativos sobre ${e.theme} para ${e.schoolYear||"ensino médio"}",
  "instrucoes_uso": "Orientações de como usar estes flash cards para máximo aproveitamento (técnica de revisão espaçada, dicas de estudo).",
  "cards": [
    {
      "id": 1,
      "front": "Pergunta ou conceito específico aqui",
      "back": "Resposta completa: [definição]. Exemplo: [exemplo prático]. Dica: [mnemônico ou associação].",
      "category": "${e.subject||"Geral"}",
      "difficulty": "Fácil|Médio|Difícil"
    }
  ],
  "isGeneratedByAI": true
}

IMPORTANTE: 
- Responda APENAS com o JSON válido, sem texto adicional
- Garanta que todos os ${o} cards sejam únicos e educativos
- Use aspas duplas para strings JSON
- Evite caracteres especiais que quebrem o JSON
- PROGRESSÃO: Primeiros cards mais simples, últimos mais complexos
    `.trim()}processGeminiResponse(e,o,c){try{let s=e.trim();s=s.replace(/^```(?:json)?\s*/,"").replace(/\s*```$/,"");const r=s.indexOf("{"),d=s.lastIndexOf("}");r!==-1&&d!==-1&&(s=s.substring(r,d+1)),console.log("🧹 Resposta limpa:",s);let i;try{i=JSON.parse(s)}catch(t){throw console.error("❌ Erro ao parsear JSON:",t),new Error(`JSON inválido recebido da API: ${t.message}`)}if(!i.cards||!Array.isArray(i.cards))throw new Error('Resposta inválida: propriedade "cards" não encontrada ou não é array');if(i.cards.length===0)throw new Error("Nenhum card encontrado na resposta da API");const n=[];for(let t=0;t<i.cards.length;t++){const a=i.cards[t];if(!a||typeof a!="object"){console.warn(`⚠️ Card ${t+1} não é um objeto válido:`,a);continue}if(!a.front||typeof a.front!="string"||a.front.trim()===""){console.warn(`⚠️ Card ${t+1} sem frente válida:`,a);continue}if(!a.back||typeof a.back!="string"||a.back.trim()===""){console.warn(`⚠️ Card ${t+1} sem verso válido:`,a);continue}n.push({id:n.length+1,front:a.front.trim(),back:a.back.trim(),category:a.category||o.subject||"Geral",difficulty:a.difficulty||o.difficultyLevel||"Médio"})}if(n.length===0)throw new Error("Nenhum card válido encontrado após processamento");const l={title:i.title||o.title||`Flash Cards: ${o.theme}`,description:i.description||`Flash cards sobre ${o.theme} para ${o.schoolYear||"ensino médio"}`,cards:n,totalCards:n.length,theme:o.theme,subject:o.subject||"Geral",schoolYear:o.schoolYear||"Ensino Médio",topicos:o.topicos,numberOfFlashcards:n.length,contextoUso:o.context||"Estudos e revisão",difficultyLevel:o.difficultyLevel||"Médio",objectives:o.objectives||`Facilitar o aprendizado sobre ${o.theme}`,instructions:o.instructions||"Use os flash cards para estudar e revisar o conteúdo",evaluation:o.evaluation||"Avalie o conhecimento através da prática com os cards",generatedByAI:!0,generatedAt:new Date().toISOString(),isGeneratedByAI:!0,isFallback:!1,formDataUsed:o};return console.log("✅ Conteúdo final gerado:",l),l}catch(s){throw console.error("❌ Erro ao processar resposta do Gemini:",s),new Error(`Falha ao processar resposta da IA: ${s.message}`)}}generateFallbackContent(e){console.log("🛡️ Gerando conteúdo de fallback para Flash Cards");const o=Math.min(parseInt(e.numberOfFlashcards?.toString()||"5"),20),c=e.topicos.split(`
`).filter(r=>r.trim());console.log(`📝 Processando fallback: ${o} cards de ${c.length} tópicos`);const s=[];if(c.length>0)for(let r=0;r<o;r++){const d=r%c.length,i=c[d].trim(),n=r%4;let l,t;switch(n){case 0:l=`O que é ${i}?`,t=`${i} é um conceito fundamental em ${e.subject||"Geral"} que deve ser compreendido por estudantes do ${e.schoolYear||"ensino médio"}. É importante para o desenvolvimento acadêmico nesta disciplina.`;break;case 1:l=`Qual a importância de ${i}?`,t=`${i} é importante porque permite compreender melhor os fundamentos de ${e.subject||"Geral"} e aplicar esse conhecimento na prática, contribuindo para o aprendizado integral do estudante.`;break;case 2:l=`Como aplicar ${i} na prática?`,t=`${i} pode ser aplicado através do estudo sistemático, prática de exercícios e compreensão dos conceitos relacionados em ${e.subject||"Geral"}, sempre considerando o contexto do ${e.schoolYear||"ensino médio"}.`;break;default:l=`Defina ${i}`,t=`${i}: Conceito estudado em ${e.subject||"Geral"}, relevante para estudantes do ${e.schoolYear||"ensino médio"}, que requer compreensão teórica e aplicação prática para domínio completo.`}s.push({id:r+1,front:l,back:t,category:e.subject||"Geral",difficulty:e.difficultyLevel||"Médio"})}else{console.warn("⚠️ Nenhum tópico fornecido, gerando cards genéricos");for(let r=0;r<Math.max(o,3);r++)s.push({id:r+1,front:`Conceito ${r+1} sobre ${e.theme}`,back:`Este é um conceito importante relacionado a ${e.theme} em ${e.subject||"Geral"}, adequado para estudantes do ${e.schoolYear||"ensino médio"}.`,category:e.subject||"Geral",difficulty:e.difficultyLevel||"Médio"})}return console.log(`✅ Fallback gerou ${s.length} cards válidos`),{title:e.title||`Flash Cards: ${e.theme} (Modo Demonstração)`,description:`Flash cards sobre ${e.theme} gerados em modo demonstração para ${e.schoolYear||"ensino médio"}`,cards:s,totalCards:s.length,theme:e.theme,subject:e.subject||"Geral",schoolYear:e.schoolYear||"Ensino Médio",topicos:e.topicos,numberOfFlashcards:s.length,contextoUso:e.context||"Estudos e revisão",difficultyLevel:e.difficultyLevel||"Médio",objectives:e.objectives||`Facilitar o aprendizado sobre ${e.theme}`,instructions:e.instructions||"Use os flash cards para estudar e revisar o conteúdo",evaluation:e.evaluation||"Avalie o conhecimento através da prática com os cards",generatedByAI:!1,generatedAt:new Date().toISOString(),isGeneratedByAI:!1,isFallback:!0,formDataUsed:e}}}export{E as FlashCardsGenerator};
