# Plano Estratégico: Chat Jota v2.0 - Sistema Híbrido Avançado

## Data: Fevereiro 2026
## Status: Em Implementação

---

## 1. DIAGNÓSTICO DO SISTEMA ATUAL (v1.0)

### 1.1 Arquitetura de 3 Chamadas + Pipeline Linear

```
Usuário → Planner (1 chamada IA) → Resposta Inicial (2 chamadas IA paralelas)
→ Executor (sequencial: capability por capability)
  → Reflexão por Etapa (1 chamada IA por etapa)
→ Resposta Final (1 chamada IA)
```

**Total: 8-12 chamadas IA por fluxo completo**

### 1.2 Componentes Atuais
| Componente | Arquivo | Função |
|---|---|---|
| Orchestrator | `orchestrator.ts` | Coordena fluxo geral |
| Planner | `planner.ts` | Cria plano fixo com capabilities |
| Executor | `executor.ts` | Executa capabilities sequencialmente |
| ContextManager | `context/context-manager.ts` | Contexto macro da sessão (in-memory Map) |
| MemoryManager | `memory-manager.ts` | Memória de trabalho + curto prazo (localStorage) |
| ReflectionService | `reflection-service.ts` | Reflexões narrativas por etapa (1 chamada IA cada) |
| InitialResponseService | `context/initial-response-service.ts` | Chamada 1: Resposta + Interpretação (2 chamadas paralelas) |
| FinalResponseService | `context/final-response-service.ts` | Chamada 3: Resposta final consolidada |

### 1.3 Capabilities Registradas (7)
1. `pesquisar_atividades_disponiveis` - Pesquisa catálogo
2. `pesquisar_atividades_conta` - Pesquisa atividades do professor
3. `decidir_atividades_criar` - Decide quais atividades criar
4. `gerar_conteudo_atividades` - Gera conteúdo via IA
5. `criar_atividade` - Cria atividades no sistema
6. `criar_arquivo` - Cria artefatos/documentos
7. `salvar_atividades_bd` - Salva no banco de dados

### 1.4 Problemas Críticos

| # | Problema | Impacto | Severidade |
|---|---------|---------|------------|
| 1 | **Plano Rígido** | Planner decide TUDO antes da execução. Sem adaptação dinâmica | Alta |
| 2 | **8-12 chamadas IA** | Custo alto, latência alta, reflexões pouco úteis | Alta |
| 3 | **Memória localStorage** | Expira em 1h, não persiste cross-sessão | Alta |
| 4 | **Execução Sequencial** | Capabilities independentes esperam desnecessariamente | Média |
| 5 | **Sem Verificação** | Resultado entregue sem validação pedagógica | Alta |
| 6 | **Contexto Desperdiçado** | Sem cache de tokens, custo cresce exponencialmente | Média |

---

## 2. ANÁLISE COMPETITIVA TÉCNICA

### 2.1 Manus AI 1.6 Max - Context Engineering
- **KV-Cache:** Ratio 100:1 input/output. Cache = $0.30 vs $3.00/MTok (10x economia)
- **Prefixos estáveis:** Nunca timestamps no início do prompt
- **Serialização determinística:** `JSON.stringify(data, Object.keys(data).sort())` para cache hit
- **Contexto append-only:** Nunca modifica, sempre adiciona
- **Tool masking:** Definições fixas + logit masking para disponibilidade
- **Erros no contexto:** Modelo aprende com falhas anteriores
- **Compressão recuperável:** URLs preservadas para re-fetch, summarize oldest

### 2.2 Replit Agent 3 - Multi-Agent com Self-Testing
- **3 agentes:** Manager → Editor → Verifier
- **Verifier:** Testa em browser real (clica, navega, verifica)
- **Escopo mínimo:** Por agente para reduzir erros
- **Human-in-the-loop:** Intencional, não busca autonomia total

### 2.3 Kimi K2.5 Agent Swarm - Paralelismo
- **Até 100 sub-agentes paralelos** com 1500 tool calls
- **Orquestrador treinável** decompõe sub-tarefas
- **4.5x mais rápido** que agente único
- **Context overflow:** Mantém apenas última rodada de tool messages

### 2.4 OpenAI Operator - Perception-Reasoning-Action
- **Loop contínuo:** Screenshot → Raciocínio → Ação → Repetir
- **Monitor Model:** Detecta comportamento suspeito
- **Pausa automática:** Para ações sensíveis

### 2.5 Lindy.ai - Memória Persistente
- **Banco vetorial** cross-sessão
- **Societies:** Multi-agent com shared memory
- **Cada agente:** Responsabilidade clara + memória própria

### 2.6 AutoGPT - Loop Autônomo
- **Detecção de stuck:** Últimas N ações idênticas = parar
- **Limite de iterações** obrigatório
- **Memória vetorial** para persistência

---

## 3. ARQUITETURA v2.0 - 5 PILARES

### 3.1 Visão Geral

```
ANTES (v1.0): Pipeline Linear Rígido
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ Planner  │──▶│ Executor │──▶│Reflexões │──▶│  Final   │
│(1 chamada)│   │(sequencial)│   │(N chamadas)│  │(1 chamada)│
└──────────┘   └──────────┘   └──────────┘   └──────────┘

DEPOIS (v2.0): Loop Agêntico Híbrido
┌───────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR v2.0                          │
│                                                               │
│  ┌──────────────┐    ┌─────────────────────────────────┐      │
│  │ FASE 1       │    │ FASE 2: LOOP ReAct              │      │
│  │ Compreensão  │───▶│ ┌───────┐  ┌────┐  ┌─────────┐ │      │
│  │ Unificada    │    │ │PENSAR │─▶│AGIR│─▶│OBSERVAR │ │      │
│  │ (1 chamada)  │    │ └───┬───┘  └────┘  └────┬────┘ │      │
│  └──────────────┘    │     └────────────────────┘      │      │
│                      └─────────────┬───────────────────┘      │
│                                    │                          │
│  ┌──────────────┐    ┌─────────────▼──────────────┐           │
│  │ FASE 3       │    │ FASE 4                     │           │
│  │ Verificação  │◀───│ Entrega                    │           │
│  │ (1 chamada)  │    │ (1 chamada)                │           │
│  └──────────────┘    └────────────────────────────┘           │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐      │
│  │Context      │  │Parallel      │  │Persistent       │      │
│  │Engine       │  │Executor      │  │Memory (DB)      │      │
│  │(cache-opt)  │  │(Promise.all) │  │(cross-session)  │      │
│  └─────────────┘  └──────────────┘  └─────────────────┘      │
└───────────────────────────────────────────────────────────────┘
```

### 3.2 Pilar 1: Loop ReAct Controlado

**Inspiração:** Manus AI + AutoGPT + ReAct Paper (Google 2022)

**Conceito:** Em vez de plano fixo (Planner → Executor), o agente entra em um loop de:
- **PENSAR:** IA analisa estado atual + resultados anteriores
- **AGIR:** Escolhe e executa próxima capability
- **OBSERVAR:** Analisa resultado e decide se continua ou conclui

**Guardrails:**
- Máximo 10 iterações
- Timeout de 120 segundos total
- Detecção de stuck (mesma ação 3x consecutivas)
- Budget de tokens controlado
- Condições de parada claras (DONE signal)

**Implementação:** `src/features/schoolpower/agente-jota/v2/agent-loop.ts`

### 3.3 Pilar 2: Context Engineering com Cache

**Inspiração:** Manus AI Context Engineering

**Técnicas:**
1. **Prompt estável:** System prompt fixo, sem timestamps no início
2. **Serialização determinística:** Keys ordenadas para cache hit
3. **Append-only:** Contexto nunca modificado, sempre adicionado
4. **Compressão recuperável:** Resumos mantêm referências para re-fetch
5. **Unificação:** 3 chamadas iniciais → 1 chamada otimizada

**Implementação:** `src/features/schoolpower/agente-jota/v2/context-engine.ts`

### 3.4 Pilar 3: Execução Paralela

**Inspiração:** Kimi Agent Swarm + BlackBox AI

**Padrão:** Fan-out / Fan-in
- Capabilities independentes rodam com `Promise.allSettled`
- Grafo de dependências determina o que pode ser paralelo
- Resultados agregados pelo sintetizador

**Capabilities paralelizáveis:**
- `pesquisar_atividades_disponiveis` + `pesquisar_atividades_conta` (independentes)
- Múltiplas `criar_atividade` (independentes entre si)

**Implementação:** `src/features/schoolpower/agente-jota/v2/parallel-executor.ts`

### 3.5 Pilar 4: Memória Persistente

**Inspiração:** Lindy.ai Societies + Manus Filesystem

**Camadas:**
1. **Memória de Trabalho (in-memory):** Sessão atual
2. **Memória de Curto Prazo (DB):** Últimas sessões do professor
3. **Memória de Longo Prazo (DB):** Preferências, padrões, histórico

**Schema DB:**
- `agent_memory` - Itens de memória persistentes
- `agent_sessions` - Sessões com metadata

**Implementação:** `src/features/schoolpower/agente-jota/v2/persistent-memory.ts`

### 3.6 Pilar 5: Verificador Inteligente

**Inspiração:** Replit Agent 3 Verifier

**Checklist de Verificação:**
1. Coerência pedagógica (conteúdo adequado à série)
2. Completude (todas atividades solicitadas foram criadas)
3. Qualidade (conteúdo não está vazio ou genérico)
4. Alinhamento (resultado atende ao pedido original)

**Auto-correção:** Se problemas encontrados, volta ao loop (máx 1 retry)

**Implementação:** `src/features/schoolpower/agente-jota/v2/verifier.ts`

---

## 4. FLUXO DETALHADO v2.0

### Fase 1 - Compreensão Unificada (1 chamada IA)
```
Input: Prompt do professor + Memória persistente + Contexto da sessão
Output: {
  resposta_inicial: "Mensagem acolhedora com dados específicos",
  interpretacao: "Resumo estruturado do pedido",
  plano_macro: ["pesquisar", "decidir", "criar", "salvar"],
  entidades: { disciplina, serie, quantidade, tipo, tema }
}
```

### Fase 2 - Execução Agêntica (1-2 chamadas IA no loop)
```
Loop ReAct (max 10 iterações):
  PENSAR: Analisa estado + resultados anteriores
  DECIDIR: Escolhe próxima capability (ou paralelas)
  AGIR: Executa capability(ies)
  OBSERVAR: Verifica resultado
  → Se DONE: sair do loop
  → Se precisa mais: continuar
```

### Fase 3 - Verificação (1 chamada IA)
```
Input: Resultado completo + Pedido original
Output: {
  aprovado: boolean,
  problemas: string[],
  sugestoes: string[],
  score_qualidade: number
}
```

### Fase 4 - Entrega (1 chamada IA)
```
Input: Resultados verificados + Contexto completo
Output: Resposta final narrativa com dados específicos
```

**Total v2.0: 3-5 chamadas IA (vs 8-12 no v1.0)**

---

## 5. COMPARATIVO v1.0 vs v2.0

| Aspecto | v1.0 | v2.0 |
|---------|------|------|
| Chamadas IA | 8-12 | 3-5 |
| Flexibilidade | Rígida (plano fixo) | Dinâmica (loop ReAct) |
| Paralelismo | Nenhum | Capabilities independentes |
| Memória | localStorage (1h) | PostgreSQL (permanente) |
| Verificação | Nenhuma | Verifier com auto-correção |
| Cache | Nenhum | Context Engineering otimizado |
| Adaptação | Impossível | A cada iteração do loop |
| Custo estimado | $0.03-0.05/fluxo | $0.01-0.02/fluxo |

---

## 6. ROADMAP DE IMPLEMENTAÇÃO

### Fase 1: Documentação e Fundação (Task 1)
- [x] Análise completa do sistema atual
- [x] Pesquisa de 8 plataformas concorrentes
- [x] Documento estratégico completo
- [x] Especificações técnicas de cada componente

### Fase 2: Novos Componentes (Tasks 2-6)
- [ ] AgentLoop (loop ReAct controlado)
- [ ] Context Engine (cache-optimized)
- [ ] Parallel Executor (Promise.allSettled)
- [ ] Persistent Memory (PostgreSQL)
- [ ] Verifier Agent (auto-verificação)

### Fase 3: Integração (Task 7)
- [ ] Orchestrator v2.0 (conecta tudo)
- [ ] Interface do chat atualizada

### Fase 4: Validação (Task 8)
- [ ] Testes end-to-end
- [ ] Documentação atualizada

---

## 7. DECISÕES ARQUITETURAIS

### 7.1 Por que Loop ReAct e não Multi-Agent?
O Chat Jota opera em browser do lado do cliente. Multi-agent verdadeiro (Kimi-style com 100 sub-agentes) requer infraestrutura de backend dedicada. O loop ReAct oferece flexibilidade similar com uma única instância, adequado para o frontend.

### 7.2 Por que não fine-tuning?
Seguindo a filosofia Manus: Context Engineering permite iteração em horas vs semanas de fine-tuning. Mantém compatibilidade com qualquer modelo.

### 7.3 Por que PostgreSQL para memória?
O projeto já usa Neon PostgreSQL. localStorage tem limite de 5MB e expira. DB permite memória cross-sessão, cross-dispositivo, e queries complexas.

### 7.4 Compatibilidade com v1.0
Os novos componentes (v2/) são aditivos. O orchestrator.ts original permanece funcional. A migração é gradual - o novo orchestrator-v2.ts importa os mesmos capabilities.
