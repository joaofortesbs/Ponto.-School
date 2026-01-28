# Lista de Exercícios - Regras de Proteção e Orquestração

> **ATENÇÃO AGENTE DO REPLIT**: Este arquivo contém regras OBRIGATÓRIAS para qualquer modificação na atividade de Lista de Exercícios. Leia completamente antes de fazer alterações.

## Status: FUNCIONANDO CORRETAMENTE ✅
Data da última validação: Janeiro 2026
Versão: 2.1.0

---

## 🛡️ ARQUIVOS PROTEGIDOS - NÃO MODIFICAR SEM VALIDAÇÃO

Os seguintes arquivos são considerados **CRÍTICOS** e NÃO devem ser alterados sem extrema necessidade:

### Arquivos Core (Máxima Proteção)
```
src/features/schoolpower/activities/lista-exercicios/
├── ListaExerciciosGenerator.ts      # Gerador de conteúdo IA - NÃO ALTERAR
├── unified-exercise-pipeline.ts     # Pipeline de 6 camadas - NÃO ALTERAR
├── ExerciseListPreview.tsx          # Componente de visualização - CUIDADO
├── useExerciseListSync.ts           # Hook de sincronização - NÃO ALTERAR
└── index.ts                         # Exportações - MANTER ESTÁVEL
```

### Arquivos de Suporte (Proteção Moderada)
```
src/features/schoolpower/construction/
├── components/EditFields/ListaExerciciosEditActivity.tsx
└── modalBinder/fieldMaps/atividade_lista_exercicios.ts
```

---

## 📋 CONTRATOS DE INTERFACE OBRIGATÓRIOS

### 1. Contrato de Entrada (ExerciseListContract)
Qualquer dado que entre no pipeline DEVE passar pelo `ExerciseListSanitizer`:

```typescript
interface ExerciseListContract {
  readonly id: string;
  readonly tema: string;
  readonly disciplina: string;
  readonly anoEscolaridade: string;
  readonly numeroQuestoes: number;           // Entre 1 e 50
  readonly nivelDificuldade: 'facil' | 'medio' | 'dificil';
  readonly modeloQuestoes: 'multipla-escolha' | 'discursiva' | 'verdadeiro-falso';
}
```

### 2. Contrato de Questão (QuestionContract)
```typescript
interface QuestionContract {
  readonly id: string;
  readonly type: 'multipla-escolha' | 'discursiva' | 'verdadeiro-falso';
  readonly enunciado: string;                // Mínimo 5 caracteres (v2.1.0)
  readonly alternativas?: readonly string[]; // Para múltipla escolha (mínimo 2)
  readonly respostaCorreta?: number | string | boolean;  // OBRIGATÓRIO
  readonly explicacao?: string;
  readonly dificuldade?: string;
  readonly tema?: string;
  readonly _validated?: boolean;             // Flag de validação
}
```

### 3. Constantes de Configuração (v2.1.0)
```typescript
LISTA_EXERCICIOS_CONFIG = {
  STORAGE_PREFIX: 'sp_le_v2_',
  MIN_QUESTIONS: 1,
  MAX_QUESTIONS: 50,
  MIN_ENUNCIADO_LENGTH: 5,       // Mínimo 5 caracteres
  MIN_ALTERNATIVAS: 2,            // Mínimo 2 alternativas para múltipla-escolha
  VALIDATION_THRESHOLD: 0.5,      // 50% das questões devem ser válidas
  VERSION: '2.1.0',
  PROTECTED: true,
  EXTRACTION_PRIORITY: ['questoes', 'questions', 'enunciado', 'question']
}
```

---

## 🔄 FLUXO DE DADOS ESPERADO

```
[Dados Externos] 
       ↓
[ExerciseListSanitizer.sanitize()] ← OBRIGATÓRIO (delegado internamente para ExerciseListInputSanitizer)
       ↓
[ExerciseListContract] (dados validados e imutáveis - definidos em contracts.ts)
       ↓
[ListaExerciciosGenerator] (geração IA)
       ↓
[unified-exercise-pipeline] (processamento)
       ↓
[ExerciseListPreview] (renderização)
```

**IMPORTANTE**: A fonte única de verdade para contratos é `contracts.ts`. O `unified-exercise-pipeline.ts` re-exporta e delega para esses contratos.

---

## ⚠️ REGRAS DE MODIFICAÇÃO

### PERMITIDO ✅
- Adicionar novos campos OPCIONAIS às interfaces
- Melhorar mensagens de log
- Adicionar novas validações que NÃO quebrem compatibilidade
- Corrigir bugs específicos da Lista de Exercícios

### PROIBIDO ❌
- Alterar tipos de campos existentes
- Remover campos obrigatórios
- Modificar a ordem de fallback do IntelligentExtractor
- Alterar prefixos de storage (`sp_le_v2_`)
- Modificar a lógica de sanitização sem testes

---

## 🔑 CHAVES DE STORAGE

A Lista de Exercícios usa prefixos DEDICADOS para evitar colisões:

| Tipo | Prefixo | Exemplo |
|------|---------|---------|
| Cache de Pipeline | `sp_le_v2_` | `sp_le_v2_abc123_Matemática_multipla-escolha` |
| Questões Excluídas | `activity_deleted_questions_` | `activity_deleted_questions_abc123` |
| Dados da Atividade | `activity_` | `activity_abc123` |

---

## 🧪 VALIDAÇÃO ANTES DE COMMIT

Antes de fazer commit em qualquer arquivo relacionado à Lista de Exercícios:

1. **Verificar se o pipeline funciona**:
   - Gerar uma lista de exercícios com 5 questões
   - Verificar se as questões aparecem no Preview
   - Verificar se os dados persistem após refresh

2. **Verificar contratos**:
   - Todos os campos obrigatórios estão presentes?
   - Os tipos estão corretos?
   - O sanitizador está sendo chamado?

3. **Verificar logs**:
   - `🛡️ [Sanitizer]` deve aparecer nos logs
   - `✅ [UnifiedPipeline]` deve indicar sucesso

---

## 📊 DEPENDÊNCIAS EXTERNAS

A Lista de Exercícios depende dos seguintes serviços globais. Se alterá-los, VALIDE a Lista de Exercícios:

| Serviço | Arquivo | Impacto |
|---------|---------|---------|
| geminiClient | `src/utils/api/geminiClient.ts` | Alto - Geração de conteúdo |
| StorageOrchestrator | `src/utils/storageOrchestrator.ts` | Alto - Persistência |
| EditActivityModal | `src/features/schoolpower/construction/EditActivityModal.tsx` | Médio - Fluxo de edição |
| autoBuildActivities | `src/features/schoolpower/construction/auto/autoBuildActivities.ts` | Médio - Construção automática |

---

## 🆘 SOLUÇÃO DE PROBLEMAS

### Questões não aparecem no Preview
1. Verificar se `processExerciseListWithUnifiedPipeline` está sendo chamado
2. Verificar logs do `IntelligentExtractor`
3. Verificar se os dados estão no formato correto

### Dados não persistem
1. Verificar se o prefixo `sp_le_v2_` está sendo usado
2. Verificar se o `StorageOrchestrator` está funcionando
3. Verificar quota do IndexedDB

### Geração IA falha
1. Verificar conexão com geminiClient
2. Verificar se o prompt está sendo construído corretamente
3. Verificar fallback para questões simuladas

---

## 📝 HISTÓRICO DE ALTERAÇÕES

| Data | Alteração | Autor |
|------|-----------|-------|
| Jan 2026 | Implementação do sistema de blindagem | Agent |
| Jan 2026 | Adição do ExerciseListSanitizer | Agent |
| Jan 2026 | Namespace dedicado sp_le_v2_ | Agent |
| Jan 2026 | **Extração JSON schema-aware** - Bracket matching robusto que prioriza blocos com "questoes" | Agent |
| Jan 2026 | **Validação rigorosa** - Exige enunciado + respostaCorreta + alternativas (50% threshold) | Agent |
| Jan 2026 | **Prompt minimalista** - Apenas 2 linhas para forçar resposta JSON pura | Agent |

---

## 🔧 ESPECIFICAÇÕES TÉCNICAS ATUALIZADAS (Jan 2026)

### Extração de JSON (ListaExerciciosGenerator.ts)
O sistema agora usa **bracket matching inteligente** para extrair JSON:

1. `findAllMatchingBrackets()` - Encontra TODOS os blocos balanceados no texto
2. `extractFirstValidJSON()` - Prioriza blocos que contêm:
   - `"questoes"` ou `"questions"` (primeira escolha)
   - `"enunciado"` ou `"question"` (segunda escolha)
   - Primeiro bloco encontrado (fallback)

### Validação de Questões (validateListaExerciciosResponse)
Cada questão DEVE ter:
- `enunciado` com >= 5 caracteres
- `respostaCorreta` definida (não null/undefined)
- Para múltipla-escolha: `alternativas` array com >= 2 itens

**Threshold de aprovação**: 50% das questões devem ser totalmente válidas.

### Fluxo de Parsing (parseGeminiResponse)
1. Remove markdown/code blocks
2. Extrai JSON usando bracket matching schema-aware
3. Limpa caracteres problemáticos
4. Converte arrays na raiz para `{questoes: [...]}`
5. Normaliza campos com múltiplos aliases
6. Marca questões como `_validated` se tiverem campos obrigatórios
7. Filtra questões inválidas (lança erro se nenhuma válida)
8. Verifica esquema final

---

**LEMBRE-SE**: A Lista de Exercícios está funcionando. Qualquer alteração deve ser feita com extremo cuidado e validação completa.
