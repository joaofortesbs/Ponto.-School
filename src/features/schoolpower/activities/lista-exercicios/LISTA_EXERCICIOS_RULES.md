# Lista de Exercícios - Sistema de Blindagem v2.1.2 Enterprise

> **⚠️ ATENÇÃO AGENTE DO REPLIT**: Este arquivo contém regras OBRIGATÓRIAS para qualquer modificação na atividade de Lista de Exercícios. **LEIA COMPLETAMENTE** antes de fazer QUALQUER alteração em arquivos relacionados.

## 🟢 Status: FUNCIONANDO CORRETAMENTE ✅
- **Data da última validação**: 29 Janeiro 2026
- **Versão**: 2.1.2
- **Estado**: ESTÁVEL - NÃO MODIFICAR SEM NECESSIDADE CRÍTICA

---

## 🚨 REGRA DE OURO - LEIA PRIMEIRO

**ANTES de alterar QUALQUER arquivo listado neste documento:**
1. Pergunte-se: "Esta alteração é REALMENTE necessária para a Lista de Exercícios?"
2. Se a alteração é em outro sistema (Agente Jota, Quiz, Flash Cards, etc.), **NÃO TOQUE** nos arquivos da Lista de Exercícios
3. Se precisar alterar, faça backup mental do comportamento atual e teste ANTES e DEPOIS

---

## 🛡️ ARQUIVOS PROTEGIDOS - ZONA DE MÁXIMA PROTEÇÃO

### Nível 1: CRÍTICO (🔴 NÃO MODIFICAR)
Estes arquivos controlam a geração e validação de questões. **Qualquer erro aqui causa falha total**.

```
src/features/schoolpower/activities/lista-exercicios/
├── ListaExerciciosGenerator.ts      # 🔴 GERADOR IA - NUNCA ALTERAR
├── contracts.ts                      # 🔴 CONTRATOS IMUTÁVEIS - NUNCA ALTERAR
├── unified-exercise-pipeline.ts      # 🔴 PIPELINE 6 CAMADAS - NUNCA ALTERAR
├── useExerciseListSync.ts            # 🔴 HOOK SINCRONIZAÇÃO - NUNCA ALTERAR
├── ExerciseListPreview.tsx           # 🔴 RENDERIZAÇÃO - NUNCA ALTERAR
└── index.ts                          # 🔴 EXPORTAÇÕES - MANTER ESTÁVEL
```

### Nível 2: ALTO RISCO (🟠 ALTERAR COM EXTREMO CUIDADO)
```
src/services/llm-orchestrator/
├── fallback.ts                       # 🟠 FALLBACK LOCAL - SCHEMA CRÍTICO
├── orchestrator.ts                   # 🟠 ORQUESTRADOR LLM - AFETA GERAÇÃO
└── router.ts                         # 🟠 ROTEADOR - DETECTA TIPO ATIVIDADE

src/features/schoolpower/prompts/
└── listaExerciciosPrompt.ts          # 🟠 PROMPT IA - DEFINE FORMATO RESPOSTA

src/utils/api/
└── geminiClient.ts                   # 🟠 WRAPPER LLM - INTERFACE DE GERAÇÃO
```

### Nível 3: MODERADO (🟡 VERIFICAR IMPACTO)
```
src/features/schoolpower/construction/
├── EditActivityModal.tsx             # 🟡 Modal de edição
├── components/EditFields/ListaExerciciosEditActivity.tsx  # 🟡 Campos de edição
└── modalBinder/fieldMaps/atividade_lista_exercicios.ts    # 🟡 Mapeamento campos

src/features/schoolpower/services/
├── exerciseListProcessor.ts          # 🟡 Processador de conteúdo
└── controle-APIs-gerais-school-power.ts  # 🟡 Controle legado APIs
```

---

## 📋 CONTRATOS DE INTERFACE OBRIGATÓRIOS (v2.1.2)

### 1. Contrato de Questão (IMUTÁVEL)
```typescript
interface QuestionContract {
  readonly id: string;                    // Formato: "questao-N" ou UUID
  readonly type: 'multipla-escolha' | 'discursiva' | 'verdadeiro-falso';
  readonly enunciado: string;             // Mínimo 5 caracteres
  readonly alternativas?: string[];       // ARRAY DE STRINGS (não objetos!)
  readonly respostaCorreta?: number | string | boolean;  // INDEX numérico para múltipla
  readonly explicacao?: string;
  readonly dificuldade?: string;          // 'facil' | 'medio' | 'dificil'
  readonly tema?: string;
  readonly _validated?: boolean;
}
```

### 2. Formato de Resposta da IA (CRÍTICO)
A IA DEVE retornar JSON neste formato EXATO:
```json
{
  "titulo": "Lista de Exercícios - [Tema]",
  "disciplina": "Matemática",
  "tema": "Frações",
  "questoes": [
    {
      "id": "questao-1",
      "type": "multipla-escolha",
      "enunciado": "Texto da pergunta com pelo menos 5 caracteres",
      "alternativas": ["Opção A texto", "Opção B texto", "Opção C texto", "Opção D texto"],
      "respostaCorreta": 0,
      "explicacao": "Explicação da resposta",
      "dificuldade": "medio",
      "tema": "Frações"
    }
  ]
}
```

### 3. ⚠️ ERROS COMUNS QUE QUEBRAM O SISTEMA

| ❌ ERRADO | ✅ CORRETO |
|-----------|-----------|
| `"alternativas": [{"letra": "A", "texto": "..."}]` | `"alternativas": ["Texto opção A", "Texto opção B"]` |
| `"respostaCorreta": "A"` | `"respostaCorreta": 0` |
| `"numero": 1` | `"id": "questao-1"` |
| `"tipo": "multipla-escolha"` | `"type": "multipla-escolha"` |

---

## 🔄 FLUXO DE DADOS (NÃO ALTERAR ORDEM)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FLUXO DE GERAÇÃO DE LISTA                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [1] Dados do Usuário                                               │
│       ↓                                                              │
│  [2] ExerciseListInputSanitizer.sanitize() ← OBRIGATÓRIO            │
│       ↓                                                              │
│  [3] ExerciseListContract (dados validados e imutáveis)             │
│       ↓                                                              │
│  [4] ListaExerciciosGenerator.generateContent()                     │
│       ↓                                                              │
│  [5] geminiClient.generateContent() → LLM Orchestrator              │
│       ↓                                                              │
│  [6] parseGeminiResponse() (extração JSON schema-aware)             │
│       ↓                                                              │
│  [7] validateListaExerciciosResponse() (validação 50% threshold)    │
│       ↓                                                              │
│  [8] UnifiedPipeline.processFullResponse()                          │
│       ↓                                                              │
│  [9] ExerciseListPreview (renderização)                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔗 MAPA DE DEPENDÊNCIAS EXTERNAS

A Lista de Exercícios depende destes serviços. **SE ALTERÁ-LOS, VALIDE A LISTA**:

| Serviço | Arquivo | Impacto | Ação Requerida |
|---------|---------|---------|----------------|
| LLM Orchestrator | `src/services/llm-orchestrator/orchestrator.ts` | 🔴 CRÍTICO | Testar geração após alteração |
| Local Fallback | `src/services/llm-orchestrator/fallback.ts` | 🔴 CRÍTICO | Manter schema JSON compatível |
| geminiClient | `src/utils/api/geminiClient.ts` | 🔴 CRÍTICO | Não alterar interface |
| StorageOrchestrator | `src/features/schoolpower/services/StorageOrchestrator.ts` | 🟠 ALTO | Manter prefixo `sp_le_v2_` |
| Global StorageOrchestrator | `src/utils/storageOrchestrator.ts` | 🟠 ALTO | Backup - IndexedDB layer |
| EditActivityModal | `src/features/schoolpower/construction/EditActivityModal.tsx` | 🟡 MÉDIO | Testar fluxo de edição |
| Agente Jota Executor | `src/features/schoolpower/agente-jota/executor.ts` | 🟡 MÉDIO | Verificar capability GERAR |

---

## ⛔ REGRAS DE MODIFICAÇÃO

### ✅ PERMITIDO
- Adicionar novos campos OPCIONAIS às interfaces (com `?`)
- Melhorar mensagens de log (console.log/warn/error)
- Adicionar novas validações que NÃO quebrem compatibilidade
- Corrigir bugs ESPECÍFICOS da Lista de Exercícios
- Atualizar este arquivo de documentação

### ❌ PROIBIDO
- Alterar tipos de campos existentes (string → number, etc)
- Remover campos obrigatórios das interfaces
- Modificar a estrutura do JSON de questões
- Alterar prefixos de storage (`sp_le_v2_`)
- Modificar ordem de fallback do IntelligentExtractor
- Alterar thresholds de validação (MIN_ENUNCIADO=5, VALIDATION_THRESHOLD=0.5)
- Modificar o parseGeminiResponse sem testes extensivos

---

## 🧪 CHECKLIST DE VALIDAÇÃO OBRIGATÓRIA

Antes de fazer commit em QUALQUER arquivo relacionado:

### Teste Funcional
- [ ] Gerar uma lista de exercícios com 5 questões múltipla-escolha
- [ ] Verificar se as questões aparecem no Preview (não "[ERRO NA GERAÇÃO]")
- [ ] Verificar se alternativas são TEXTOS (não "[object Object]")
- [ ] Verificar se os dados persistem após refresh da página

### Verificar Logs
- [ ] `🛡️ [ExerciseListInputSanitizer]` deve aparecer
- [ ] `✅ [parseGeminiResponse]` deve mostrar questões válidas
- [ ] `✅ [UnifiedPipeline]` deve indicar sucesso
- [ ] NÃO deve aparecer `❌ [ListaExerciciosGenerator] Estrutura inválida`

### Verificar Contratos
- [ ] Campo `id` presente em cada questão
- [ ] Campo `type` (não `tipo`)
- [ ] Campo `alternativas` é array de strings
- [ ] Campo `respostaCorreta` é número (para múltipla-escolha)

---

## 📊 CONSTANTES DE CONFIGURAÇÃO (v2.1.2)

```typescript
LISTA_EXERCICIOS_CONFIG = {
  STORAGE_PREFIX: 'sp_le_v2_',           // Namespace isolado
  MIN_QUESTIONS: 1,                       // Mínimo de questões
  MAX_QUESTIONS: 50,                      // Máximo de questões
  MIN_ENUNCIADO_LENGTH: 5,               // Mínimo caracteres enunciado
  MIN_ALTERNATIVAS: 2,                    // Mínimo alternativas múltipla-escolha
  VALIDATION_THRESHOLD: 0.5,              // 50% questões devem ser válidas
  VERSION: '2.1.2',                       // Versão atual
  PROTECTED: true,                        // Flag de proteção
  EXTRACTION_PRIORITY: ['questoes', 'questions', 'enunciado', 'question']
}
```

---

## 🔑 CHAVES DE STORAGE (NAMESPACE ISOLADO)

| Tipo | Prefixo | Exemplo |
|------|---------|---------|
| Cache Pipeline | `sp_le_v2_` | `sp_le_v2_abc123_Matemática_multipla-escolha` |
| Questões Excluídas | `activity_deleted_questions_` | `activity_deleted_questions_abc123` |
| Dados Legacy | `constructed_lista-exercicios_` | `constructed_lista-exercicios_abc123` |

---

## 🆘 SOLUÇÃO DE PROBLEMAS

### "[ERRO NA GERAÇÃO]" aparece em vez de questões
1. ✅ Verificar se `fallback.ts` está gerando JSON compatível
2. ✅ Verificar se `alternativas` são strings (não objetos)
3. ✅ Verificar se `respostaCorreta` é número (não letra)
4. ✅ Verificar logs de `validateListaExerciciosResponse`

### "[object Object]" nas alternativas
1. ✅ Verificar `normalizeAlternativeToString()` em contracts.ts
2. ✅ Verificar formato retornado pela IA
3. ✅ Verificar `normalizeAlternativas()` no Generator

### Questões não persistem
1. ✅ Verificar prefixo `sp_le_v2_` no storage
2. ✅ Verificar StorageOrchestrator funcionando
3. ✅ Verificar quota do IndexedDB

### Geração IA falha completamente
1. ✅ Verificar chaves API (VITE_GROQ_API_KEY, VITE_GEMINI_API_KEY)
2. ✅ Verificar fallback local em fallback.ts
3. ✅ Verificar logs do LLM Orchestrator

---

## 📝 HISTÓRICO DE ALTERAÇÕES

| Data | Versão | Alteração | Status |
|------|--------|-----------|--------|
| Jan 2026 | 2.0.0 | Implementação do sistema de blindagem | ✅ |
| Jan 2026 | 2.0.1 | Adição do ExerciseListSanitizer | ✅ |
| Jan 2026 | 2.1.0 | Namespace dedicado sp_le_v2_ | ✅ |
| Jan 2026 | 2.1.1 | Extração JSON schema-aware + validação rigorosa | ✅ |
| Jan 29, 2026 | 2.1.2 | **CORREÇÃO CRÍTICA**: Fallback local com schema compatível | ✅ |

### Correção v2.1.2 (29 Jan 2026)
**Problema**: Quando APIs falhavam, o fallback local em `fallback.ts` gerava JSON com estrutura incompatível, causando "[ERRO NA GERAÇÃO]".

**Solução**: Atualizamos `generateListaExercicios()` para gerar:
- `id` em vez de `numero`
- `type` em vez de `tipo`
- `alternativas` como array de strings
- `respostaCorreta` como índice numérico
- Campos `explicacao`, `tema`, `dificuldade` adicionados

---

## 🎯 ESPECIFICAÇÕES TÉCNICAS ATUAIS

### Extração de JSON (ListaExerciciosGenerator.ts)
- `findAllMatchingBrackets()` - Encontra TODOS os blocos balanceados
- `extractFirstValidJSON()` - Prioriza blocos com "questoes" ou "questions"
- Suporta markdown code blocks (```json)

### Validação de Questões (validateListaExerciciosResponse)
- `enunciado` >= 5 caracteres
- `respostaCorreta` definida (não null/undefined)
- Para múltipla-escolha: `alternativas` array com >= 2 itens
- **Threshold**: 50% das questões devem ser válidas

### Normalização de Alternativas (contracts.ts)
- Suporta 15+ formatos de entrada
- Campos buscados: texto, text, content, value, label, alternativa, etc.
- Fallback: `[Aguardando IA] Opção X - regenere para conteúdo real`

---

## ⚡ REGRAS PARA O AGENTE DO REPLIT

1. **SEMPRE leia este arquivo** antes de modificar qualquer coisa relacionada a listas de exercícios
2. **NUNCA modifique** arquivos Nível 1 (🔴) sem necessidade CRÍTICA documentada
3. **SEMPRE teste** a geração de questões após qualquer alteração em dependências
4. **SE algo quebrar**, reverta a alteração imediatamente e investigue
5. **MANTENHA o schema JSON** exatamente como documentado acima
6. **ATUALIZE este arquivo** se fizer alterações que afetem o comportamento

---

**LEMBRE-SE**: A Lista de Exercícios está **FUNCIONANDO CORRETAMENTE**. 
Qualquer alteração deve ser feita com **EXTREMO CUIDADO** e **VALIDAÇÃO COMPLETA**.
