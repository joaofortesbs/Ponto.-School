# Quiz Interativo - Sistema de Blindagem v1.0.0 Enterprise

> **⚠️ ATENÇÃO AGENTE DO REPLIT**: Este arquivo contém regras OBRIGATÓRIAS para qualquer modificação na atividade de Quiz Interativo. **LEIA COMPLETAMENTE** antes de fazer QUALQUER alteração em arquivos relacionados.

## 🟢 Status: FUNCIONANDO CORRETAMENTE ✅
- **Data da última validação**: 30 Janeiro 2026
- **Versão**: 1.0.0
- **Estado**: ESTÁVEL - NÃO MODIFICAR SEM NECESSIDADE CRÍTICA

---

## 🚨 REGRA DE OURO - LEIA PRIMEIRO

**ANTES de alterar QUALQUER arquivo listado neste documento:**
1. Pergunte-se: "Esta alteração é REALMENTE necessária para o Quiz Interativo?"
2. Se a alteração é em outro sistema (Agente Jota, Lista de Exercícios, Flash Cards, etc.), **NÃO TOQUE** nos arquivos do Quiz Interativo
3. Se precisar alterar, faça backup mental do comportamento atual e teste ANTES e DEPOIS

---

## 🛡️ ARQUIVOS PROTEGIDOS - ZONA DE MÁXIMA PROTEÇÃO

### Nível 1: CRÍTICO (🔴 NÃO MODIFICAR)
Estes arquivos controlam a geração e validação de questões. **Qualquer erro aqui causa falha total**.

```
src/features/schoolpower/activities/quiz-interativo/
├── QuizInterativoGenerator.ts      # 🔴 GERADOR IA - NUNCA ALTERAR
├── QuizInterativoPreview.tsx       # 🔴 RENDERIZAÇÃO - NUNCA ALTERAR
├── types.ts                         # 🔴 TIPOS/CONTRATOS - NUNCA ALTERAR
└── index.ts                         # 🔴 EXPORTAÇÕES - MANTER ESTÁVEL
```

### Nível 2: ALTO RISCO (🟠 ALTERAR COM EXTREMO CUIDADO)
```
src/services/llm-orchestrator/
├── fallback.ts                       # 🟠 FALLBACK LOCAL - SCHEMA CRÍTICO
├── orchestrator.ts                   # 🟠 ORQUESTRADOR LLM - AFETA GERAÇÃO
└── router.ts                         # 🟠 ROTEADOR - DETECTA TIPO ATIVIDADE

src/features/schoolpower/agente-jota/capabilities/GERAR_CONTEUDO/implementations/
└── gerar-conteudo-atividades.ts      # 🟠 HANDLER ESPECIALIZADO - AFETA GERAÇÃO
```

### Nível 3: MODERADO (🟡 VERIFICAR IMPACTO)
```
src/features/schoolpower/construction/
├── EditActivityModal.tsx             # 🟡 Modal de edição
├── components/EditFields/QuizEditActivity.tsx  # 🟡 Campos de edição
└── modalBinder/fieldMaps/quiz_interativo.ts    # 🟡 Mapeamento campos
```

---

## 📋 CONTRATOS DE INTERFACE OBRIGATÓRIOS (v1.0.0)

### 1. Contrato de Questão (QuizQuestion - IMUTÁVEL)
```typescript
interface QuizQuestion {
  readonly id: number;                          // ID numérico sequencial
  readonly question: string;                    // Enunciado (mínimo 5 caracteres)
  readonly type: 'multipla-escolha' | 'verdadeiro-falso';
  readonly options: string[];                   // ARRAY DE STRINGS (4 alternativas)
  readonly correctAnswer: string;               // TEXTO da alternativa correta
  readonly explanation: string;                 // Feedback/explicação educativa
  
  // ALIASES OBRIGATÓRIOS (compatibilidade com IA)
  readonly texto?: string;                      // Alias para question
  readonly alternativas?: string[];             // Alias para options
  readonly resposta_correta?: number | string;  // Alias para correctAnswer
  readonly feedback?: string;                   // Alias para explanation
}
```

### 2. Contrato de Conteúdo (QuizInterativoContent - IMUTÁVEL)
```typescript
interface QuizInterativoContent {
  readonly title: string;                       // Título do quiz
  readonly description: string;                 // Descrição curta
  readonly questions: QuizQuestion[];           // Array de questões
  readonly timePerQuestion: number;             // Tempo em segundos
  readonly totalQuestions: number;              // Total de questões
  readonly generatedAt: string;                 // ISO timestamp OBRIGATÓRIO
  readonly isGeneratedByAI: boolean;            // Indica se foi gerado por IA
  readonly isFallback: boolean;                 // Indica se é fallback local
  
  // Metadados opcionais
  readonly subject?: string;
  readonly schoolYear?: string;
  readonly theme?: string;
  readonly difficultyLevel?: string;
  readonly format?: string;
}
```

### 3. Contrato de Dados de Entrada (QuizInterativoData)
```typescript
interface QuizInterativoData {
  subject: string;                              // Disciplina
  schoolYear: string;                           // Série/ano escolar
  theme: string;                                // Tema específico
  objectives: string;                           // Objetivos de aprendizagem
  difficultyLevel: string;                      // Nível de dificuldade
  format: string;                               // Formato das questões
  numberOfQuestions: string;                    // Quantidade de questões
  timePerQuestion: string;                      // Tempo por questão
  instructions: string;                         // Instruções do quiz
  evaluation: string;                           // Critérios de avaliação
}
```

---

## 🔧 REGRAS DE MODIFICAÇÃO

### ✅ PERMITIDO
1. **Adicionar logs de debug** com prefixo `[QuizInterativoGenerator]`
2. **Melhorar fallback** adicionando mais questões ao banco contextualizado
3. **Corrigir bugs** que não alteram contratos de interface
4. **Adicionar validações** que reforcem contratos existentes

### ❌ PROIBIDO
1. **Alterar contratos** de interface sem documentar breaking change
2. **Modificar parsing JSON** sem testar múltiplos cenários de resposta IA
3. **Remover aliases** de compatibilidade (texto, alternativas, resposta_correta, feedback)
4. **Alterar campo generatedAt** - OBRIGATÓRIO em todas as respostas
5. **Remover fallback contextualizado** - sistema de segurança essencial

---

## 🔄 ARQUITETURA DE GERAÇÃO

### Pipeline de Geração (5 etapas)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  1. VALIDAÇÃO                                                            │
│     validateInputData() → Limpar/normalizar dados de entrada             │
├─────────────────────────────────────────────────────────────────────────┤
│  2. PROMPT                                                               │
│     buildPrompt() → Construir prompt otimizado para IA                   │
├─────────────────────────────────────────────────────────────────────────┤
│  3. GERAÇÃO IA                                                           │
│     LLM Orchestrator → Chamada ao Gemini/Groq                            │
├─────────────────────────────────────────────────────────────────────────┤
│  4. PARSING ROBUSTO                                                      │
│     parseGeminiResponse() → Extração multi-path + validação              │
│     ├── extractFirstValidJSON() → Bracket matching inteligente           │
│     ├── extractQuestions() → Normalização de estrutura                   │
│     └── Fallback automático se parsing falhar                            │
├─────────────────────────────────────────────────────────────────────────┤
│  5. FALLBACK CONTEXTUALIZADO                                             │
│     createFallbackContent() → Banco de questões REAIS por disciplina     │
│     └── getContextualizedQuestionBank() → 5+ questões por disciplina     │
└─────────────────────────────────────────────────────────────────────────┘
```

### Disciplinas com Banco de Questões Contextualizado
- ✅ Matemática (5 questões: frações, primos, percentuais, áreas, equações)
- ✅ Português (5 questões: advérbios, sujeito, ortografia, plural, voz passiva)
- ✅ História (5 questões: presidentes, descobrimento, independência, períodos)
- ✅ Ciências (5 questões: pulmões, planetas, órgãos, fotossíntese, célula)
- ✅ Geografia (5 questões: países, rios, estados, capital, biomas)
- ⚠️ Outras disciplinas: Fallback genérico baseado no tema

---

## 🎯 PARSING JSON ROBUSTO v2.0

### Etapas de Extração
1. **Limpar markdown** - Remover blocos ```json``` e formatação extra
2. **Bracket matching** - `findAllMatchingBrackets()` para encontrar todos os JSON
3. **Seleção inteligente** - Priorizar JSON com "perguntas"/"questions"
4. **Limpeza de caracteres** - Remover caracteres de controle, vírgulas trailing
5. **Validação de questões** - Mínimo 5 caracteres no enunciado, 2 alternativas

### Normalização de resposta_correta
O método `determineCorrectAnswer()` aceita múltiplos formatos:
- **Número**: `resposta_correta: 0` → Pega alternativas[0]
- **Letra**: `resposta_correta: "A"` → Mapeia para índice
- **Texto**: `resposta_correta: "Opção A"` → Usa diretamente

---

## 📊 CHECKLIST DE TESTE

### Antes de Commit
- [ ] Gerar quiz via Agente Jota: "Crie um quiz de matemática sobre frações"
- [ ] Verificar logs com prefixo `[QuizInterativoGenerator]`
- [ ] Confirmar que QuizInterativoPreview renderiza corretamente
- [ ] Testar fallback: simular erro de API e verificar questões contextualizadas
- [ ] Validar que campo `generatedAt` está presente no JSON final
- [ ] Confirmar que aliases (texto, alternativas) funcionam no parsing

### Sintomas de Problema
| Sintoma | Causa Provável |
|---------|----------------|
| Quiz vazio | Parsing falhou, verificar logs |
| Erro TypeScript | Campo faltando na interface |
| Preview quebrado | Incompatibilidade question vs texto |
| Questões genéricas | Fallback ativado, verificar API |

---

## 📝 HISTÓRICO DE ALTERAÇÕES

### v1.0.0 (30 Janeiro 2026)
- ✅ Criação inicial do sistema de blindagem
- ✅ Implementação de parsing robusto multi-path
- ✅ Fallback contextualizado com banco de questões por disciplina
- ✅ Aliases de compatibilidade (texto, alternativas, resposta_correta, feedback)
- ✅ Campo generatedAt obrigatório
- ✅ Integração com AI_ORCHESTRATION_GUIDE.md

---

## 🤝 INTEGRAÇÃO COM OUTROS SISTEMAS

### Dependências
- **LLM Orchestrator v3.0**: Geração via Gemini/Groq
- **Agente Jota**: Handler especializado em gerar_conteudo_atividades.ts
- **EditActivityModal**: Modal de edição visual

### Isolamento
- Quiz Interativo NÃO deve afetar Lista de Exercícios
- Quiz Interativo NÃO deve afetar Flash Cards
- Alterações no LLM Orchestrator devem ser testadas em TODOS os tipos de atividade
