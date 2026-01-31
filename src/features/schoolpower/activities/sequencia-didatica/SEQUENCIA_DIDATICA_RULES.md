# Sequência Didática - Regras de Proteção e Orquestração

> **ATENÇÃO AGENTE DO REPLIT**: Este arquivo contém regras OBRIGATÓRIAS para qualquer modificação na atividade de Sequência Didática. Leia completamente antes de fazer alterações.

## Status: PROTEGIDO ✅
Data da última validação: Janeiro 2026
Versão do Sistema de Blindagem: 1.0

---

## 🛡️ ARQUIVOS PROTEGIDOS - NÃO MODIFICAR SEM VALIDAÇÃO

Os seguintes arquivos são considerados **CRÍTICOS** e NÃO devem ser alterados sem extrema necessidade:

### Arquivos Core (Máxima Proteção)
```
src/features/schoolpower/activities/sequencia-didatica/
├── SequenciaDidaticaGenerator.ts    # Gerador de conteúdo IA - NÃO ALTERAR
├── SequenciaDidaticaPreview.tsx     # Componente de visualização - CUIDADO
├── sequenciaDidaticaProcessor.ts    # Processador de dados - PROTEGIDO
├── contracts.ts                      # Contratos imutáveis - NÃO ALTERAR
├── index.ts                          # Exportações - MANTER ESTÁVEL
└── SEQUENCIA_DIDATICA_RULES.md       # Este arquivo - APENAS ADICIONAR
```

### Arquivos de Suporte (Proteção Moderada)
```
src/features/schoolpower/construction/
├── api/generateActivityContent.ts (seção sequencia-didatica)
└── services/buildActivityHelper.ts (seção sequencia-didatica)

src/features/schoolpower/activities/text-version/
└── TextVersionGenerator.ts (geração text-version)
```

---

## 📋 CONTRATOS DE INTERFACE OBRIGATÓRIOS

### 1. Contrato de Informações Gerais (SequenciaInfoGeralContract)
```typescript
interface SequenciaInfoGeralContract {
  readonly disciplina: string;     // Obrigatório
  readonly tema: string;           // Obrigatório
  readonly serie: string;          // Obrigatório
  readonly duracao: string;        // Ex: "2 semanas", "1 mês"
  readonly numeroAulas: number;    // Quantidade de aulas
  readonly objetivoGeral: string;  // Objetivo principal
  readonly justificativa?: string; // Por que esta sequência
}
```

### 2. Contrato de Etapa (SequenciaEtapaContract)
```typescript
interface SequenciaEtapaContract {
  readonly id: number;
  readonly numero: number;           // Número da etapa/aula
  readonly titulo: string;           // Obrigatório
  readonly tipo: EtapaTipo;          // introducao | desenvolvimento | etc
  readonly duracao: string;          // Ex: "1 aula", "2 horas"
  readonly objetivos: ReadonlyArray<string>;
  readonly conteudos: ReadonlyArray<string>;
  readonly metodologia: string;
  readonly recursos: ReadonlyArray<string>;
  readonly atividades: ReadonlyArray<{
    readonly nome: string;
    readonly descricao: string;
    readonly duracao?: string;
  }>;
}
```

### 3. Contrato de Entrada (SequenciaDidaticaInputContract)
```typescript
interface SequenciaDidaticaInputContract {
  readonly id?: string;
  readonly titulo?: string;
  readonly disciplina: string;       // Obrigatório
  readonly tema: string;             // Obrigatório
  readonly serie: string;            // Obrigatório
  readonly objetivoGeral: string;
  readonly duracao?: string;
  readonly numeroAulas?: number;     // Entre 1 e 30
}
```

### 4. Contrato de Saída (SequenciaDidaticaOutputContract)
```typescript
interface SequenciaDidaticaOutputContract {
  readonly titulo: string;
  readonly info_geral: SequenciaInfoGeralContract;
  readonly objetivos: ReadonlyArray<SequenciaObjetivoContract>;
  readonly etapas: ReadonlyArray<SequenciaEtapaContract>;
  readonly avaliacao: SequenciaAvaliacaoContract;
  readonly recursos_gerais: ReadonlyArray<string>;
  readonly isGeneratedByAI: boolean;
  readonly generatedAt: string;
}
```

---

## 🔄 FLUXO DE DADOS ESPERADO

```
[Dados Externos - Chat Jota, EditModal, API] 
       ↓
[SequenciaDidaticaSanitizer.sanitizeInput()] ← OBRIGATÓRIO
       ↓
[SequenciaDidaticaInputContract] (dados validados e imutáveis)
       ↓
[SequenciaDidaticaGenerator / TextVersionGenerator] (geração IA)
       ↓
[SequenciaDidaticaOutputContract] (conteúdo gerado)
       ↓
[storeTextVersionContent()] (salva com namespace)
       ↓
[localStorage: text_content_sequencia-didatica_{id}] (persistência)
       ↓
[text-version:generated event] (sincronização UI)
       ↓
[SequenciaDidaticaPreview / TextVersionInterface] (renderização)
```

---

## ⚠️ REGRAS DE MODIFICAÇÃO

### PERMITIDO ✅
- Adicionar novos campos OPCIONAIS às interfaces
- Melhorar mensagens de log
- Adicionar novas validações que NÃO quebrem compatibilidade
- Corrigir bugs específicos de Sequência Didática
- Melhorar estilos visuais do Preview
- Adicionar novas etapas ao template (com contratos)

### PROIBIDO ❌
- Alterar tipos de campos existentes (info_geral, etapas, objetivos)
- Remover campos obrigatórios
- Modificar a estrutura básica de etapas
- Alterar prefixos de storage (`sp_sd_v1_`, `text_content_sequencia-didatica_`)
- Modificar a lógica de sanitização sem testes
- Remover chamadas a `storeTextVersionContent()`
- Remover emissão de eventos `text-version:generated`

---

## 🔑 CHAVES DE STORAGE

Sequência Didática usa prefixos DEDICADOS para evitar colisões:

| Tipo | Prefixo | Exemplo |
|------|---------|---------|
| Dados Principais | `sp_sd_v1_` | `sp_sd_v1_abc123` |
| Text Version | `text_content_sequencia-didatica_` | `text_content_sequencia-didatica_abc123` |
| Cache de Geração | `sp_sd_v1_cache_` | `sp_sd_v1_cache_Português_Literatura` |

**IMPORTANTE**: 
- Sequência Didática é uma atividade do tipo TEXT-VERSION
- Sempre salvar em AMBOS os prefixos (novo e text_content_)
- O evento `text-version:generated` DEVE ser emitido após salvamento

---

## 🔌 DEPENDÊNCIAS EXTERNAS

Sequência Didática depende dos seguintes serviços globais:

| Serviço | Arquivo | Impacto |
|---------|---------|---------|
| geminiClient | `src/utils/api/geminiClient.ts` | Alto - Geração de conteúdo |
| TextVersionGenerator | `src/features/schoolpower/activities/text-version/TextVersionGenerator.ts` | Alto - Pipeline text-version |
| storeTextVersionContent | `src/features/schoolpower/activities/text-version/TextVersionGenerator.ts` | Crítico - Persistência |
| generateActivityContent | `src/features/schoolpower/construction/api/generateActivityContent.ts` | Alto - Geração automática |

---

## 🧪 VALIDAÇÃO ANTES DE COMMIT

Antes de fazer commit em qualquer arquivo relacionado:

1. **Verificar se a geração funciona**:
   - Criar uma Sequência Didática via Chat Jota
   - Verificar se aparece na Interface de Construção
   - Verificar se as etapas são exibidas corretamente

2. **Verificar contratos**:
   - Todos os dados têm `info_geral` com campos obrigatórios?
   - As etapas têm `titulo`, `tipo` e `duracao`?
   - O sanitizador está sendo chamado?

3. **Verificar eventos**:
   - `text-version:generated` é emitido após geração?
   - A UI atualiza automaticamente?

4. **Verificar persistência**:
   - Recarregar a página
   - A Sequência Didática ainda aparece?
   - Todas as etapas estão completas?

---

## 🆘 SOLUÇÃO DE PROBLEMAS

### Sequência não aparece após geração via Chat
1. Verificar se `storeTextVersionContent()` está sendo chamado em `generateSequenciaDidatica`
2. Verificar se evento `text-version:generated` está sendo emitido
3. Verificar logs do `generateActivityContent.ts`

### Etapas não renderizam
1. Verificar se `etapas` é um array válido
2. Verificar se `SequenciaDidaticaSanitizer.sanitizeEtapas()` está normalizando
3. Verificar logs do Preview

### Geração IA falha
1. Verificar conexão com geminiClient
2. Verificar se o prompt está sendo construído corretamente
3. Verificar fallback em `generateSequenciaDidatica`

---

## 📝 HISTÓRICO DE ALTERAÇÕES

| Data | Alteração | Autor |
|------|-----------|-------|
| Jan 2026 | Implementação do sistema de blindagem v1.0 | Agent |
| Jan 2026 | Criação de SequenciaDidaticaSanitizer | Agent |
| Jan 2026 | Namespace dedicado sp_sd_v1_ | Agent |
| Jan 2026 | Contratos TypeScript imutáveis | Agent |
| Jan 2026 | Correção generateSequenciaDidatica para storeTextVersionContent | Agent |

---

## 🔗 INTEGRAÇÃO COM AGENTE JOTA

**Fluxo Crítico**:
```
decidir_atividades_criar → criar_atividade → generateSequenciaDidatica → storeTextVersionContent → UI
```

**Arquivo Crítico**: `src/features/schoolpower/construction/api/generateActivityContent.ts`
- Função: `generateSequenciaDidatica`
- DEVE chamar: `storeTextVersionContent(activityId, 'sequencia-didatica', generatedResult)`
- DEVE emitir: `text-version:generated` event
- DEVE retornar: `isTextVersion: true`

---

**LEMBRE-SE**: Sequência Didática é uma atividade TEXT-VERSION. O fluxo de salvamento e eventos é DIFERENTE das atividades interativas.
