# ARQUITETURA COMPLETA DA SEÇÃO SCHOOL POWER

> **ATENÇÃO**: Este arquivo é a fonte única de verdade para toda a seção School Power.
> Consulte-o SEMPRE antes de fazer qualquer alteração no código.

---

## VISÃO GERAL

O **School Power** é um sistema completo de criação de atividades educacionais assistido por IA, que permite professores e coordenadores criarem mais de 130 tipos diferentes de atividades personalizadas em minutos.

---

## ESTRUTURA DE DIRETÓRIOS

```
src/features/schoolpower/
├── actionplan/                    # Plano de ação (atividades sugeridas pela IA)
│   └── ActionPlanCard.tsx         # Card que exibe atividades para aprovação
│
├── activities/                    # Processadores específicos por tipo de atividade
│   ├── default/                   # Atividade genérica
│   ├── flash-cards/               # Gerador e preview de flash cards
│   ├── lista-exercicios/          # Preview de listas de exercícios
│   ├── mapa-mental/               # Processador de mapas mentais
│   ├── plano-aula/                # Sistema completo de planos de aula
│   │   └── sections/              # Seções do plano (objetivos, metodologia, etc.)
│   ├── quadro-interativo/         # Atividades para quadro digital
│   ├── quiz-interativo/           # Quizzes gamificados
│   ├── sequencia-didatica/        # Sequências de aulas
│   ├── tese-redacao/              # Elaboração de teses ENEM
│   └── activityRegistry.ts        # Registro central de todas as atividades
│
├── components/                    # Componentes visuais reutilizáveis
│   ├── CardVisualizacaoAtividadeCompartilhada.tsx
│   ├── interface-compartilhar-atividade-schoolpower.tsx
│   ├── ModoApresentacaoAtividade.tsx
│   ├── TrilhasBadge.tsx           # Badge de gamificação
│   └── TrilhasDebugPanel.tsx      # Painel de debug para trilhas
│
├── construction/                  # Sistema de construção de atividades
│   ├── api/                       # Chamadas de API para geração
│   ├── auto/                      # Auto-build automático
│   ├── components/                # Componentes de edição
│   │   └── EditFields/            # Formulários específicos por tipo
│   ├── generationStrategies/      # Estratégias de geração por tipo
│   ├── hooks/                     # Hooks React para construção
│   ├── modalBinder/               # Sistema de binding de modais
│   │   └── fieldMaps/             # Mapeamento de campos por atividade
│   ├── services/                  # Serviços de geração e automação
│   ├── CardDeConstrucao.tsx       # Interface principal de construção
│   ├── EditActivityModal.tsx      # Modal de edição de atividades
│   └── automationController.ts    # Controlador de automação
│
├── contextualization/             # Quiz de contextualização
│   └── ContextualizationCard.tsx  # Formulário inicial de contexto
│
├── data/                          # Dados estáticos e configurações
│   ├── activityCustomFields.ts    # Campos personalizados por atividade
│   ├── activityFieldsSchema.json  # Schema JSON de campos
│   ├── schoolPowerActivities.json # Catálogo de 130+ atividades
│   └── trilhasActivitiesConfig.ts # Config de atividades elegíveis para trilhas
│
├── hooks/                         # Hooks de estado
│   └── useSchoolPowerFlow.ts      # Hook principal de fluxo
│
├── prompts/                       # Prompts para IA
│   ├── listaExerciciosPrompt.ts
│   └── sequenciaDidaticaPrompt.ts
│
├── services/                      # Serviços de backend/IA
│   ├── generatePersonalizedPlan.ts    # Geração do plano de ação com IA
│   ├── controle-APIs-gerais-school-power.ts  # Sistema multi-API
│   ├── actionPlanService.ts
│   ├── exerciseListProcessor.ts
│   └── gerador-link-atividades-schoolpower.ts
│
├── Sistema-baixar-atividades/     # Sistema de downloads
│   ├── services/                  # Download por tipo (PDF, DOCX)
│   └── types/
│
└── activitiesManager.ts           # Gerenciador geral de atividades
```

---

## FLUXO DE ESTADOS (FlowState)

O hook `useSchoolPowerFlow.ts` gerencia todo o ciclo de vida:

```
'idle'                 → Estado inicial (interface limpa)
      ↓ [usuário envia mensagem]
'contextualizing'      → Quiz de contextualização ativo
      ↓ [usuário completa quiz]
'generating'           → IA gerando plano de ação
      ↓ [IA responde]
'actionplan'           → Plano pronto para aprovação
      ↓ [usuário aprova atividades]
'generatingActivities' → Construindo atividades (automação)
      ↓ [construção completa]
'activities'           → Interface de construção ativa
```

---

## ARQUIVOS CRÍTICOS E SUAS FUNÇÕES

### 1. ORQUESTRADOR VISUAL
**`src/sections/SchoolPower/SchoolPowerPage.tsx`**
- Componente raiz da seção
- Decide qual card mostrar baseado no `flowState`
- Mantém background de estrelas sempre visível
- Integra JotaAvatar, ChatInput e QuickAccessCards

### 2. GERENCIADOR DE ESTADO
**`src/features/schoolpower/hooks/useSchoolPowerFlow.ts`**
- Hook principal com toda a lógica de estados
- Persistência automática no localStorage
- Expira dados após 1 hora
- Funções: `sendInitialMessage()`, `submitContextualization()`, `approveActionPlan()`

### 3. GERADOR DE PLANO COM IA
**`src/features/schoolpower/services/generatePersonalizedPlan.ts`**
- Monta prompt otimizado para Groq API
- Processa resposta JSON da IA
- Converte para ActionPlanItem[]
- Tem fallback se API falhar

### 4. SISTEMA MULTI-API (NOVO)
**`src/features/schoolpower/services/controle-APIs-gerais-school-power.ts`**
- Sistema de fallback em cascata
- Tenta múltiplos modelos Groq antes de falhar
- Fallback para Gemini como último recurso
- Garante resposta em 100% dos casos

### 5. INTERFACE DE CONSTRUÇÃO
**`src/features/schoolpower/construction/CardDeConstrucao.tsx`**
- Exibe atividades aprovadas em grid
- Gerencia construção individual
- Permite edição de campos personalizados
- Controla automação de construção

---

## SISTEMA DE APIs

### Hierarquia de Fallback
```
Nível 1: llama-3.3-70b-versatile (principal)
    ↓ [429 Rate Limit?]
Nível 2: llama-3.1-8b-instant (rápido)
    ↓ [429 Rate Limit?]
Nível 3: llama-4-scout-17b-16e-instruct (novo)
    ↓ [Todos Groq falharam?]
Nível 4: gemini-2.0-flash (fallback externo)
    ↓ [Gemini falhou?]
Nível 5: Resultado local pré-definido (nunca falha)
```

### Configuração
- API Key Groq: `VITE_GROQ_API_KEY` (env)
- API Key Gemini: `VITE_GEMINI_API_KEY` (env)
- Timeout: 30 segundos
- Max retries por modelo: 2

---

## TIPOS DE ATIVIDADES (130+)

### Principais Categorias
1. **Planejamento**: Plano de Aula, Sequência Didática
2. **Avaliação**: Prova, Quiz Interativo, Lista de Exercícios
3. **Recursos Visuais**: Mapa Mental, Flash Cards, Quadro Interativo
4. **Redação**: Tese de Redação, Proposta de Redação
5. **Jogos**: Caça-Palavras, Palavras Cruzadas, Jogos Educativos

### Campos Personalizados (customFields)
Cada tipo tem campos específicos definidos em `activityFieldsSchema.json`:
- plano-aula: Tema, BNCC, Carga Horária, Objetivos...
- sequencia-didatica: Quantidade de Aulas, Diagnósticos, Avaliações...
- flash-cards: Título, Tema, Número de flashcards...

---

## PERSISTÊNCIA DE DADOS

### LocalStorage (Temporário)
- **Chave**: `schoolpower_flow_data`
- **Estrutura**:
```typescript
{
  initialMessage: string;
  contextualizationData: ContextualizationData;
  actionPlan: ActionPlanItem[];
  manualActivities: ActionPlanItem[];
  timestamp: number;
}
```
- **Expiração**: 1 hora

### Supabase (Permanente)
- Tabela: `atividades_compartilhaveis`
- Usado para links públicos de atividades

---

## REGRAS DE DESENVOLVIMENTO

### ANTES DE ALTERAR QUALQUER CÓDIGO:
1. Leia este arquivo completamente
2. Identifique qual camada será afetada
3. Verifique dependências entre arquivos
4. Teste o fluxo completo após alterações

### CONVENÇÕES:
- Todos os logs devem usar emoji para identificação visual
- Campos de formulário devem ter validação
- Erros de API devem acionar fallback automático
- Nunca deixar usuário sem resposta

### PROIBIÇÕES:
- NÃO alterar `schoolPowerActivities.json` sem documentar
- NÃO remover campos de `activityFieldsSchema.json`
- NÃO modificar estrutura do `FlowState` sem atualizar todos os consumers
- NÃO fazer chamadas de API sem usar o sistema de fallback

---

## FLUXO COMPLETO (RESUMO)

```
1. USUÁRIO digita mensagem inicial
   ↓
2. SISTEMA mostra Quiz de Contextualização
   ↓
3. USUÁRIO preenche contexto (matérias, público, restrições)
   ↓
4. SISTEMA gera Plano de Ação com IA Groq (15-50 atividades)
   ↓
5. USUÁRIO aprova atividades desejadas
   ↓
6. SISTEMA mostra interface de Construção
   ↓
7. USUÁRIO edita campos personalizados
   ↓
8. SISTEMA constrói atividades (manual ou automático)
   ↓
9. USUÁRIO visualiza, edita, compartilha ou baixa
   ↓
10. ATIVIDADES salvas no Histórico
```

---

## CHANGELOG

| Data | Alteração | Autor |
|------|-----------|-------|
| 2024-12-28 | Criação do arquivo de instruções | Sistema |
| 2024-12-28 | Adição do sistema multi-API | Sistema |

---

**Última atualização**: 28/12/2024
