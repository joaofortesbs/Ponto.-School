# 🤖 Guia de Orquestração para Agente IA - School Power

> **PROPÓSITO**: Este guia fornece orientações OBRIGATÓRIAS para o Agente do Replit ao trabalhar com a seção School Power. O objetivo é prevenir modificações acidentais que quebrem componentes funcionais.

---

## 🎯 PRINCÍPIO FUNDAMENTAL

```
╔═══════════════════════════════════════════════════════════════════╗
║  REGRA #1: ALTERAÇÕES EM UM COMPONENTE NÃO DEVEM AFETAR OUTROS   ║
║                                                                   ║
║  Se você está trabalhando no Quiz Interativo, NÃO modifique      ║
║  arquivos da Lista de Exercícios. NUNCA.                         ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## 📂 ARQUITETURA DE COMPONENTES ISOLADOS

Cada atividade do School Power é um **Bounded Context** independente:

```
src/features/schoolpower/activities/
├── lista-exercicios/       # 🔴 BLINDADO - Ver LISTA_EXERCICIOS_RULES.md
├── quiz-interativo/        # 🔴 BLINDADO - Ver FLASH_CARDS_RULES.md (se existir)
├── flash-cards/            # 🔴 BLINDADO - Ver FLASH_CARDS_RULES.md
├── plano-aula/
├── sequencia-didatica/
├── tese-redacao/
└── quadro-interativo/
```

### Regra de Isolamento
- **CADA pasta é um domínio isolado**
- **CADA pasta tem suas próprias interfaces e contratos**
- **MODIFICAR código de uma pasta NÃO deve exigir mudanças em outras**

---

## 🚦 SEMÁFORO DE MODIFICAÇÃO

Antes de modificar QUALQUER arquivo, classifique a ação:

### 🟢 VERDE - Pode Prosseguir
- Adicionar novas features SEM alterar código existente
- Melhorar logs e mensagens de erro
- Atualizar documentação
- Adicionar testes
- Criar novos arquivos

### 🟡 AMARELO - Proceder com Cautela
- Modificar componentes de UI (verificar renderização)
- Alterar services compartilhados (testar todos os consumidores)
- Modificar hooks (verificar todos os componentes que usam)
- Atualizar dependências

### 🔴 VERMELHO - PARAR E VALIDAR
- Modificar Generators (ListaExerciciosGenerator, QuizGenerator, etc.)
- Alterar contratos/interfaces
- Modificar pipelines de processamento
- Alterar lógica de validação
- Modificar fallbacks locais
- Alterar estruturas de storage

---

## 🛡️ COMPONENTES COM BLINDAGEM ATIVA

Os seguintes componentes possuem arquivos de RULES.md que DEVEM ser lidos:

| Componente | Arquivo de Regras | Status |
|------------|-------------------|--------|
| Lista de Exercícios | `LISTA_EXERCICIOS_RULES.md` | ✅ ATIVO |
| Flash Cards | `FLASH_CARDS_RULES.md` | ✅ ATIVO |
| Quiz Interativo | (a ser criado) | ⏳ PENDENTE |

### Protocolo de Blindagem
1. **SEMPRE** leia o arquivo RULES.md antes de modificar
2. **SIGA** as regras de modificação listadas
3. **TESTE** conforme checklist do arquivo
4. **DOCUMENTE** alterações no histórico

---

## 🔄 FLUXO DE TRABALHO SEGURO

### Ao Receber uma Solicitação de Alteração:

```
┌─────────────────────────────────────────────────────────────────┐
│ PASSO 1: IDENTIFICAR ESCOPO                                     │
│                                                                 │
│ Perguntas:                                                      │
│ - Quais arquivos serão modificados?                            │
│ - Algum deles está em pasta de componente blindado?            │
│ - A alteração afeta interfaces compartilhadas?                 │
│                                                                 │
│ Se SIM para blindagem → Ler arquivo RULES.md primeiro          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ PASSO 2: AVALIAR IMPACTO                                        │
│                                                                 │
│ Verificar:                                                      │
│ - Quais outros componentes usam os arquivos que vou alterar?   │
│ - Existe risco de quebrar funcionalidade existente?            │
│ - A alteração é realmente necessária para o objetivo?          │
│                                                                 │
│ Se risco alto → Considerar abordagem alternativa               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ PASSO 3: IMPLEMENTAR COM SEGURANÇA                              │
│                                                                 │
│ Práticas:                                                       │
│ - Fazer alterações mínimas e focadas                           │
│ - Manter compatibilidade retroativa                            │
│ - Adicionar logs para debug                                    │
│ - Testar antes e depois                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ PASSO 4: VALIDAR                                                 │
│                                                                 │
│ Obrigatório:                                                    │
│ - Reiniciar workflows                                          │
│ - Verificar logs do console                                    │
│ - Testar componentes afetados                                  │
│ - Se componente blindado: seguir checklist do RULES.md         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 SERVIÇOS COMPARTILHADOS - ALTA SENSIBILIDADE

Estes serviços são usados por MÚLTIPLOS componentes. Alterar com EXTREMO CUIDADO:

### LLM Orchestrator (`src/services/llm-orchestrator/`)
```
orchestrator.ts    → TODOS os geradores de conteúdo IA
fallback.ts        → Fallback quando APIs falham (CRÍTICO para cada tipo)
router.ts          → Detecta tipo de atividade
config.ts          → Configurações de API
```
**Ao alterar**: Testar geração de TODAS as atividades

### Storage Services
```
src/utils/storageOrchestrator.ts         → Persistência de dados
src/features/schoolpower/services/StorageOrchestrator.ts  → Storage local
```
**Ao alterar**: Verificar se dados persistem corretamente

### Agente Jota
```
src/features/schoolpower/agente-jota/
├── executor.ts         → Executa capabilities
├── orchestrator.ts     → Orquestra conversação
└── capabilities/       → Implementações por capability
```
**Ao alterar**: Testar fluxo completo de chat

---

## ⚠️ ERROS COMUNS A EVITAR

### ❌ Erro 1: Modificar Generator sem verificar schema
```typescript
// ERRADO: Alterar formato de retorno sem atualizar consumidores
return { numero: 1, tipo: "multipla" }  // Schema incompatível!

// CORRETO: Manter formato documentado
return { id: "questao-1", type: "multipla-escolha" }
```

### ❌ Erro 2: Alterar interface compartilhada
```typescript
// ERRADO: Mudar tipo de campo existente
interface Question {
  respostaCorreta: string;  // Era number, vai quebrar!
}

// CORRETO: Adicionar novo campo opcional
interface Question {
  respostaCorreta: number;
  respostaCorreletraLegacy?: string;  // Novo campo opcional
}
```

### ❌ Erro 3: Modificar arquivo errado
```typescript
// ERRADO: Alterar ListaExerciciosGenerator ao trabalhar no Quiz
// O arquivo correto seria QuizGenerator!

// CORRETO: Verificar qual arquivo pertence ao componente correto
```

### ❌ Erro 4: Não testar após alteração
```
// ERRADO: Fazer commit sem testar
git commit -m "fix: something"  // Pode ter quebrado outra coisa!

// CORRETO: Sempre testar o componente afetado
// 1. Reiniciar workflow
// 2. Verificar logs
// 3. Testar funcionalidade
// 4. Só então fazer commit
```

---

## 🧪 PROTOCOLO DE TESTE POR COMPONENTE

### Lista de Exercícios
1. Criar lista com 5 questões múltipla-escolha
2. Verificar se questões aparecem (não "[ERRO NA GERAÇÃO]")
3. Verificar se alternativas são texto (não "[object Object]")
4. Verificar persistência após refresh

### Quiz Interativo
1. Criar quiz com 5 perguntas
2. Verificar se opções aparecem corretamente
3. Testar seleção de resposta
4. Verificar pontuação

### Flash Cards
1. Criar deck com 5 cards
2. Verificar frente e verso
3. Testar flip do card
4. Verificar navegação

### Plano de Aula
1. Gerar plano completo
2. Verificar todas as seções
3. Testar edição de campos
4. Verificar preview

---

## 📊 MÉTRICAS DE SAÚDE DO SISTEMA

### Logs Esperados no Console (Sistema Saudável)
```
🚀 [LLM-Orchestrator] Sistema Unificado v3.0 Enterprise inicializado
   ✅ Groq API: Configurada
   ✅ Gemini API: Configurada
   📊 Total de modelos disponíveis: 10
📝 [ListaExerciciosGenerator] Usando geminiClient centralizado
🛡️ [ExerciseListInputSanitizer] Dados sanitizados
✅ [parseGeminiResponse] Questões válidas: X
✅ [UnifiedPipeline] Processamento completo
```

### Logs de ALERTA (Investigar)
```
⚠️ [parseGeminiResponse] Questão X sem enunciado válido
⚠️ [normalizeAlternativeToString] Formato não reconhecido
❌ [ListaExerciciosGenerator] Estrutura inválida, usando fallback
```

### Logs de ERRO (Ação Imediata)
```
❌ [ListaExerciciosGenerator] Erro na geração
❌ [parseGeminiResponse] Nenhum JSON válido encontrado
🚨 [UNHANDLED PROMISE REJECTION]
```

---

## 🔐 CHECKLIST DE PRÉ-COMMIT

Antes de fazer commit em código do School Power:

- [ ] Li o arquivo RULES.md do componente (se existir)
- [ ] Verifiquei se não modifiquei arquivos de outros componentes
- [ ] Mantive compatibilidade retroativa nas interfaces
- [ ] Reiniciei o workflow e verifiquei os logs
- [ ] Testei a funcionalidade afetada
- [ ] Não há erros no console
- [ ] Atualizei documentação se necessário

---

## 📞 CONTATO PARA EMERGÊNCIAS

Se algo quebrar após uma alteração:

1. **PARE** - Não faça mais alterações
2. **REVERTA** - Use git para reverter a última alteração
3. **ANALISE** - Leia os logs de erro cuidadosamente
4. **DOCUMENTE** - Registre o que aconteceu
5. **CORRIJA** - Faça a correção correta seguindo as regras

---

**LEMBRE-SE**: Código funcionando é mais valioso que código "melhorado" que quebra.
Alterações devem **ADICIONAR VALOR**, não introduzir bugs.
