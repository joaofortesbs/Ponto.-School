import{aw as u}from"./index-CPYz9D2u.js";class m{constructor(){console.log("✅ [TeseRedacaoGenerator] Usando backend proxy para Gemini")}async generateTeseRedacaoContent(e){if(console.log("====================================="),console.log("🎯 [TeseRedacaoGenerator] INICIANDO GERAÇÃO"),console.log("====================================="),console.log("📊 [TeseRedacaoGenerator] Dados completos recebidos:",JSON.stringify(e,null,2)),!e.temaRedacao||e.temaRedacao.trim()==="")throw console.error("❌ [TeseRedacaoGenerator] Tema da redação não fornecido!"),new Error("Tema da redação é obrigatório");console.log("📋 [TeseRedacaoGenerator] Validação de campos:"),console.log("  ✓ Tema da Redação:",e.temaRedacao),console.log("  ✓ Nível de Dificuldade:",e.nivelDificuldade),console.log("  ✓ Objetivo:",e.objetivo),console.log("  ✓ Competências ENEM:",e.competenciasENEM),console.log("  ✓ Contexto Adicional:",e.contextoAdicional||"(não fornecido)"),console.log("=====================================");const n=`
Você é um especialista em redação do ENEM com profundo conhecimento das competências II e III.

DADOS COMPLETOS DA ATIVIDADE:
- Tema da Redação: "${e.temaRedacao}"
- Nível de Dificuldade: ${e.nivelDificuldade}
- Objetivo: ${e.objetivo}
- Competências ENEM: ${e.competenciasENEM}
${e.contextoAdicional?`- Contexto Adicional: ${e.contextoAdicional}`:""}

INSTRUÇÕES CRÍTICAS - SIGA EXATAMENTE:

1. GERE 3 TESES ÚNICAS E PERSONALIZADAS sobre "${e.temaRedacao}"
2. Cada tese DEVE ter entre 200-400 caracteres
3. Adapte ao nível ${e.nivelDificuldade}
4. Considere ${e.competenciasENEM}
5. Use o objetivo: ${e.objetivo}
${e.contextoAdicional?`6. Considere o contexto: ${e.contextoAdicional}`:""}

RETORNE APENAS JSON VÁLIDO (SEM \`\`\`json, SEM MARKDOWN):
{
  "title": "${e.title}",
  "temaRedacao": "${e.temaRedacao}",
  "nivelDificuldade": "${e.nivelDificuldade}",
  "objetivo": "${e.objetivo}",
  "competenciasENEM": "${e.competenciasENEM}",
  "contextoAdicional": "${e.contextoAdicional||""}",
  
  "tempoEstimado": "15-20 minutos",
  "etapas": [
    {
      "id": 1,
      "nome": "Crie sua tese",
      "tempo": "5 min",
      "descricao": "Desenvolva uma tese clara em até 2 linhas"
    },
    {
      "id": 2,
      "nome": "Battle de teses",
      "tempo": "5 min",
      "descricao": "Vote na melhor tese e justifique"
    },
    {
      "id": 3,
      "nome": "Argumentação",
      "tempo": "8 min",
      "descricao": "Desenvolva argumento completo"
    }
  ],
  
  "etapa1_crieTese": {
    "instrucoes": "Desenvolva uma tese clara em até 2 linhas sobre o tema proposto",
    "limiteCaracteres": 200,
    "dicas": ["Seja claro e objetivo", "Posicione-se sobre o tema", "Use linguagem formal"]
  },
  
  "etapa2_battleTeses": {
    "instrucoes": "Vote na melhor tese e justifique sua escolha",
    "tesesParaComparar": [
      {
        "id": "A",
        "tese": "Primeira tese bem fundamentada sobre o tema",
        "pontosFortres": ["Clara", "Objetiva", "Bem posicionada"]
      },
      {
        "id": "B",
        "tese": "Segunda tese com abordagem diferente sobre o tema",
        "pontosFortres": ["Propositiva", "Crítica", "Contextualizada"]
      },
      {
        "id": "C",
        "tese": "Terceira tese com outra perspectiva sobre o tema",
        "pontosFortres": ["Abrangente", "Reflexiva", "Fundamentada"]
      }
    ]
  },
  
  "etapa3_argumentacao": {
    "instrucoes": "Desenvolva um argumento completo em 3 sentenças",
    "estrutura": {
      "afirmacao": "Apresente sua afirmação principal",
      "dadoExemplo": "Forneça um dado ou exemplo concreto",
      "conclusao": "Conclua seu argumento"
    },
    "dicas": ["Use dados reais", "Cite exemplos concretos", "Mantenha coerência"]
  },
  
  "criteriosAvaliacao": {
    "competenciaII": "Compreensão do tema e não fuga à proposta",
    "competenciaIII": "Seleção, relação, organização e interpretação de argumentos",
    "pontosAvaliados": ["Clareza da tese", "Qualidade dos argumentos", "Coerência textual", "Repertório sociocultural"]
  },
  
  "dicasGerais": ["Leia atentamente o tema", "Desenvolva tese clara", "Use argumentos consistentes", "Mantenha coerência", "Revise antes de finalizar"]
}

IMPORTANTE:
- Retorne APENAS o JSON válido, sem texto adicional
- Gere 3 teses DIFERENTES e BEM FUNDAMENTADAS para o Battle (etapa 2)
- Cada tese deve ter abordagem única sobre o tema: ${e.temaRedacao}
- Adapte ao nível de dificuldade: ${e.nivelDificuldade}
- As teses devem ser realistas e aplicáveis ao ENEM
`;try{console.log("🚀 [TeseRedacaoGenerator] Enviando prompt para API Gemini..."),console.log("📤 [TeseRedacaoGenerator] Tamanho do prompt:",n.length,"caracteres");const r=(await(await fetch("/api/ai/gemini",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model_id:"gemini-2.0-flash",contents:[{parts:[{text:n}]}],generationConfig:{temperature:.7,maxOutputTokens:8192}})})).json()).candidates?.[0]?.content?.parts?.[0]?.text||"";console.log("📥 [TeseRedacaoGenerator] Resposta bruta da API:",r.substring(0,500)+"..."),console.log("📏 [TeseRedacaoGenerator] Tamanho da resposta:",r.length,"caracteres");const c=r.match(/\{[\s\S]*\}/);if(!c)throw console.error("❌ [TeseRedacaoGenerator] Resposta não contém JSON válido!"),new Error("Resposta da API não contém JSON válido");const a=JSON.parse(c[0]);if(console.log("====================================="),console.log("✅ [TeseRedacaoGenerator] JSON parseado com sucesso!"),console.log("====================================="),console.log("🔍 [TeseRedacaoGenerator] Verificando conteúdo gerado:"),console.log("  📌 Título:",a.title),console.log("  📌 Tema:",a.temaRedacao),console.log("  📌 Etapas:",a.etapas?.length||0),console.log(""),console.log("🔍 [TeseRedacaoGenerator] Verificando TESES DO BATTLE:"),console.log("  📊 Objeto etapa2_battleTeses existe?",!!a.etapa2_battleTeses),console.log("  📊 Array tesesParaComparar existe?",!!a.etapa2_battleTeses?.tesesParaComparar),console.log("  📊 Número de teses geradas:",a.etapa2_battleTeses?.tesesParaComparar?.length||0),console.log("====================================="),a.etapa2_battleTeses?.tesesParaComparar?.length===3&&a.etapa2_battleTeses.tesesParaComparar.every(o=>o.id&&o.tese&&o.tese.length>=150&&o.pontosFortres?.length>0))console.log("====================================="),console.log("✅✅✅ [TeseRedacaoGenerator] TESES GERADAS PELA IA GEMINI COM SUCESSO! ✅✅✅"),console.log("====================================="),console.log("📝 [TeseRedacaoGenerator] Detalhes das teses geradas:"),a.etapa2_battleTeses.tesesParaComparar.forEach((o,s)=>{console.log(`
  🔹 Tese ${s+1} (ID: ${o.id}):`),console.log(`     Conteúdo (${o.tese.length} caracteres): "${o.tese}"`),console.log(`     Pontos fortes: ${o.pontosFortres?.join(", ")}`)}),console.log("=====================================");else{console.warn("====================================="),console.warn("⚠️  [TeseRedacaoGenerator] TESES INVÁLIDAS OU INCOMPLETAS DA IA!"),console.warn("====================================="),console.warn("🔧 [TeseRedacaoGenerator] Gerando teses PERSONALIZADAS baseadas no tema..."),console.warn("📝 Tema:",e.temaRedacao),console.warn("📝 Nível:",e.nivelDificuldade),console.warn("📝 Objetivo:",e.objetivo),console.warn("📝 Competências:",e.competenciasENEM),console.warn("📝 Contexto:",e.contextoAdicional||"Não fornecido");const o=e.temaRedacao,s=e.nivelDificuldade.toLowerCase(),l=e.objetivo,A=o.split(" ").filter(t=>t.length>3),d=e.contextoAdicional||"realidade brasileira";a.etapa2_battleTeses={instrucoes:`Analise as três teses sobre "${o}" considerando ${e.competenciasENEM} e escolha a mais adequada`,tesesParaComparar:[{id:"A",tese:`Diante dos desafios contemporâneos relacionados a ${o}, observa-se a necessidade urgente de uma abordagem integrada que envolva políticas públicas efetivas, participação social ativa e investimentos estratégicos, considerando ${d} para promover transformações significativas e sustentáveis na sociedade brasileira.`,pontosFortres:["Abordagem contextualizada ao tema",`Adequada ao nível ${s}`,"Propositiva e fundamentada"]},{id:"B",tese:`A questão de ${o} no Brasil reflete desigualdades estruturais e históricas que demandam não apenas soluções pontuais, mas uma reformulação profunda das bases sociais, culturais e econômicas, alinhada com ${l}, visando construir uma sociedade mais justa, equitativa e preparada para os desafios futuros.`,pontosFortres:["Análise crítica contextualizada","Alinhada ao objetivo proposto","Perspectiva histórico-social"]},{id:"C",tese:`Para alcançar avanços efetivos em ${o}, é fundamental implementar estratégias multidimensionais que articulem educação de qualidade, desenvolvimento tecnológico, conscientização coletiva e políticas públicas inclusivas, considerando ${d} e ${l} como eixos norteadores para transformações concretas e duradouras.`,pontosFortres:["Propositiva e pragmática","Multidimensional",`Adaptada ao nível ${s}`]}]},console.warn("✅ [TeseRedacaoGenerator] Teses PERSONALIZADAS geradas para o tema:",e.temaRedacao),console.warn("📊 [TeseRedacaoGenerator] Teses geradas:"),a.etapa2_battleTeses.tesesParaComparar.forEach((t,p)=>{console.warn(`  ${p+1}. [${t.id}] (${t.tese.length} caracteres): "${t.tese.substring(0,80)}..."`)}),console.warn("=====================================")}if(a.etapa2_battleTeses&&a.etapa2_battleTeses.tesesParaComparar){const o=`gemini_teses_cache_${Date.now()}`;try{localStorage.setItem(o,JSON.stringify({teses:a.etapa2_battleTeses.tesesParaComparar,generatedAt:new Date().toISOString(),tema:e.temaRedacao})),console.log("💾 [TeseRedacaoGenerator] Teses salvas em cache adicional")}catch(s){console.error("❌ [TeseRedacaoGenerator] Erro ao salvar cache:",s)}}return console.log("✅ [TeseRedacaoGenerator] Conteúdo final gerado com sucesso!"),a}catch(i){return console.error("❌ [TeseRedacaoGenerator] Erro ao gerar conteúdo:",i),this.generateFallbackContent(e)}}generateFallbackTeses(e){return[{id:1,tese:`Tese 1: ${e.temaRedacao} é um tema crucial para a sociedade brasileira`,argumentos:["Impacto social significativo","Necessidade de debate público","Relevância para políticas públicas"],explicacao:"Esta tese aborda a importância do tema proposto.",pontosFortres:["Clara e objetiva","Argumentos sólidos"],pontosMelhorar:["Adicionar dados estatísticos"]},{id:2,tese:`Tese 2: A solução para ${e.temaRedacao} requer ação conjunta`,argumentos:["Cooperação entre diferentes setores","Participação da sociedade civil","Políticas públicas efetivas"],explicacao:"Esta tese propõe uma abordagem colaborativa.",pontosFortres:["Propositiva","Abrangente"],pontosMelhorar:["Especificar mais as ações"]},{id:3,tese:`Tese 3: ${e.temaRedacao} demanda reflexão crítica urgente`,argumentos:["Impactos atuais na sociedade","Projeções futuras preocupantes","Exemplos históricos relevantes"],explicacao:"Esta tese enfatiza a urgência do tema.",pontosFortres:["Crítica e reflexiva","Contextualizada"],pontosMelhorar:["Ampliar repertório sociocultural"]}]}generateFallbackContent(e){return{title:e.title,temaRedacao:e.temaRedacao,nivelDificuldade:e.nivelDificuldade,objetivo:e.objetivo,competenciasENEM:e.competenciasENEM,contextoAdicional:e.contextoAdicional||"",tempoEstimado:"15-20 minutos",etapas:[{id:1,nome:"Crie sua tese",tempo:"5 min",descricao:"Desenvolva uma tese clara em até 2 linhas"},{id:2,nome:"Battle de teses",tempo:"5 min",descricao:"Vote na melhor tese e justifique"},{id:3,nome:"Argumentação",tempo:"8 min",descricao:"Desenvolva argumento completo"}],etapa1_crieTese:{instrucoes:"Desenvolva uma tese clara em até 2 linhas sobre o tema proposto",limiteCaracteres:200,dicas:["Seja claro e objetivo","Posicione-se sobre o tema","Use linguagem formal"]},etapa2_battleTeses:{instrucoes:"Vote na melhor tese e justifique sua escolha",tesesParaComparar:[{id:"A",tese:"A mobilidade urbana brasileira enfrenta desafios estruturais que demandam investimento em transporte público e planejamento integrado.",pontosFortres:["Clara e objetiva","Bem posicionada"]},{id:"B",tese:"Os problemas de mobilidade no Brasil refletem décadas de políticas priorizando automóveis em detrimento do transporte coletivo.",pontosFortres:["Crítica","Contextualizada historicamente"]},{id:"C",tese:"Para superar os desafios da mobilidade urbana, é necessário promover conscientização e modernizar a infraestrutura das cidades.",pontosFortres:["Propositiva","Abrangente"]}]},etapa3_argumentacao:{instrucoes:"Desenvolva um argumento completo em 3 sentenças",estrutura:{afirmacao:"Apresente sua afirmação principal",dadoExemplo:"Forneça um dado ou exemplo concreto",conclusao:"Conclua seu argumento"},dicas:["Use dados reais","Cite exemplos concretos","Mantenha coerência"]},criteriosAvaliacao:{competenciaII:"Compreensão do tema e não fuga à proposta",competenciaIII:"Seleção, relação, organização e interpretação de argumentos",pontosAvaliados:["Clareza da tese","Qualidade dos argumentos","Coerência textual","Repertório sociocultural"]},dicasGerais:["Sempre leia atentamente o tema proposto","Desenvolva uma tese clara e objetiva","Use argumentos consistentes e bem fundamentados","Mantenha a coerência textual","Revise sua redação antes de finalizar"],isFallback:!0,generatedAt:new Date().toISOString()}}}const E=Object.freeze(Object.defineProperty({__proto__:null,TeseRedacaoGenerator:m},Symbol.toStringTag,{value:"Module"})),f=Object.freeze(Object.defineProperty({__proto__:null,TeseRedacaoGenerator:m,TeseRedacaoPreview:u},Symbol.toStringTag,{value:"Module"}));export{E as T,f as i};
