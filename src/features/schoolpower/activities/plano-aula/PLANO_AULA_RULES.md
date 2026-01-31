# Plano de Aula - Regras de Proteção e Orquestração

> **ATENÇÃO AGENTE DO REPLIT**: Este arquivo contém regras OBRIGATÓRIAS para qualquer modificação na atividade de Plano de Aula. Leia completamente antes de fazer alterações.

## Status: PROTEGIDO ✅
Data da última validação: Janeiro 2026
Versão do Sistema de Blindagem: 1.0

---

## 🛡️ ARQUIVOS PROTEGIDOS - NÃO MODIFICAR SEM VALIDAÇÃO

Os seguintes arquivos são considerados **CRÍTICOS** e NÃO devem ser alterados sem extrema necessidade:

### Arquivos Core (Máxima Proteção)
```
src/features/schoolpower/activities/plano-aula/
├── PlanoAulaGenerator.ts        # Gerador de conteúdo IA - NÃO ALTERAR
├── PlanoAulaPreview.tsx         # Componente de visualização - CUIDADO
├── PlanoAulaBuilder.ts          # Construtor de estrutura - PROTEGIDO
├── PlanoAulaValidator.ts        # Validador de dados - PROTEGIDO
├── contracts.ts                 # Contratos imutáveis - NÃO ALTERAR
├── index.ts                     # Exportações - MANTER ESTÁVEL
└── PLANO_AULA_RULES.md          # Este arquivo - APENAS ADICIONAR
```

### Arquivos de Suporte (Proteção Moderada)
```
src/features/schoolpower/construction/
├── api/generateActivityContent.ts (seção plano-aula)
└── services/buildActivityHelper.ts (seção plano-aula)

src/features/schoolpower/activities/text-version/
└── TextVersionGenerator.ts (geração text-version)
```

---

## 📋 CONTRATOS DE INTERFACE OBRIGATÓRIOS

### 1. Contrato de Visão Geral (PlanoAulaVisaoGeralContract)
```typescript
interface PlanoAulaVisaoGeralContract {
  readonly disciplina: string;     // Obrigatório
  readonly tema: string;           // Obrigatório
  readonly serie: string;          // Obrigatório
  readonly tempo: string;          // Duração da aula
  readonly metodologia: string;    // Abordagem metodológica
  readonly recursos: ReadonlyArray<string>; // Lista de recursos
}
```

### 2. Contrato de Objetivo (PlanoAulaObjetivoContract)
```typescript
interface PlanoAulaObjetivoContract {
  readonly id: number;
  readonly tipo: 'geral' | 'especifico';
  readonly descricao: string;       // Obrigatório
  readonly habilidadeBNCC?: string; // Código BNCC opcional
}
```

### 3. Contrato de Entrada (PlanoAulaInputContract)
```typescript
interface PlanoAulaInputContract {
  readonly id?: string;
  readonly titulo?: string;
  readonly disciplina: string;       // Obrigatório
  readonly tema: string;             // Obrigatório
  readonly serie: string;            // Obrigatório
  readonly objetivoGeral: string;
  readonly objetivosEspecificos?: string;
  readonly duracao?: string;
  readonly metodologia?: string;
}
```

### 4. Contrato de Saída (PlanoAulaOutputContract)
```typescript
interface PlanoAulaOutputContract {
  readonly titulo: string;
  readonly visao_geral: PlanoAulaVisaoGeralContract;
  readonly objetivos: ReadonlyArray<PlanoAulaObjetivoContract>;
  readonly metodologia: Readonly<{ abordagem: string; descricao: string }>;
  readonly desenvolvimento: ReadonlyArray<PlanoAulaDesenvolvimentoContract>;
  readonly atividades: ReadonlyArray<PlanoAulaAtividadeContract>;
  readonly isGeneratedByAI: boolean;
  readonly generatedAt: string;
}
```

---

## 🔄 FLUXO DE DADOS ESPERADO

```
[Dados Externos - Chat Jota, EditModal, API] 
       ↓
[PlanoAulaSanitizer.sanitizeInput()] ← OBRIGATÓRIO
       ↓
[PlanoAulaInputContract] (dados validados e imutáveis)
       ↓
[PlanoAulaGenerator / TextVersionGenerator] (geração IA)
       ↓
[PlanoAulaOutputContract] (conteúdo gerado)
       ↓
[storeTextVersionContent()] (salva com namespace)
       ↓
[localStorage: text_content_plano-aula_{id}] (persistência)
       ↓
[text-version:generated event] (sincronização UI)
       ↓
[PlanoAulaPreview / TextVersionInterface] (renderização)
```

---

## ⚠️ REGRAS DE MODIFICAÇÃO

### PERMITIDO ✅
- Adicionar novos campos OPCIONAIS às interfaces
- Melhorar mensagens de log
- Adicionar novas validações que NÃO quebrem compatibilidade
- Corrigir bugs específicos de Plano de Aula
- Melhorar estilos visuais do Preview
- Adicionar novas seções ao plano (com contratos)

### PROIBIDO ❌
- Alterar tipos de campos existentes (visao_geral, objetivos, desenvolvimento)
- Remover campos obrigatórios
- Modificar a estrutura básica de seções
- Alterar prefixos de storage (`sp_pa_v1_`, `text_content_plano-aula_`)
- Modificar a lógica de sanitização sem testes
- Remover chamadas a `storeTextVersionContent()`
- Remover emissão de eventos `text-version:generated`

---

## 🔑 CHAVES DE STORAGE

Plano de Aula usa prefixos DEDICADOS para evitar colisões:

| Tipo | Prefixo | Exemplo |
|------|---------|---------|
| Dados Principais | `sp_pa_v1_` | `sp_pa_v1_abc123` |
| Text Version | `text_content_plano-aula_` | `text_content_plano-aula_abc123` |
| Cache de Geração | `sp_pa_v1_cache_` | `sp_pa_v1_cache_Matemática_Frações` |

**IMPORTANTE**: 
- Plano de Aula é uma atividade do tipo TEXT-VERSION
- Sempre salvar em AMBOS os prefixos (novo e text_content_)
- O evento `text-version:generated` DEVE ser emitido após salvamento

---

## 🔌 DEPENDÊNCIAS EXTERNAS

Plano de Aula depende dos seguintes serviços globais. Se alterá-los, VALIDE Plano de Aula:

| Serviço | Arquivo | Impacto |
|---------|---------|---------|
| geminiClient | `src/utils/api/geminiClient.ts` | Alto - Geração de conteúdo |
| TextVersionGenerator | `src/features/schoolpower/activities/text-version/TextVersionGenerator.ts` | Alto - Pipeline text-version |
| storeTextVersionContent | `src/features/schoolpower/activities/text-version/TextVersionGenerator.ts` | Crítico - Persistência |
| EditActivityModal | `src/features/schoolpower/construction/EditActivityModal.tsx` | Alto - Fluxo de edição |
| generateActivityContent | `src/features/schoolpower/construction/api/generateActivityContent.ts` | Alto - Geração automática |
| buildActivityHelper | `src/features/schoolpower/construction/services/buildActivityHelper.ts` | Alto - Construção |

---

## 🧪 VALIDAÇÃO ANTES DE COMMIT

Antes de fazer commit em qualquer arquivo relacionado a Plano de Aula:

1. **Verificar se a geração funciona**:
   - Criar um Plano de Aula via Chat Jota (capacidade criar_atividade)
   - Verificar se aparece na Interface de Construção
   - Verificar se o Preview exibe as seções corretamente

2. **Verificar contratos**:
   - Todos os dados têm `visao_geral` com campos obrigatórios?
   - Os objetivos têm `tipo` e `descricao`?
   - O sanitizador está sendo chamado?

3. **Verificar eventos**:
   - `text-version:generated` é emitido após geração?
   - A UI atualiza automaticamente?

4. **Verificar persistência**:
   - Recarregar a página
   - O Plano de Aula ainda aparece?
   - Os dados estão completos?

5. **Verificar logs**:
   - `📚 [PlanoAulaContracts]` deve aparecer nos logs
   - `🛡️ [PlanoAulaSanitizer]` deve aparecer ao processar dados

---

## 🆘 SOLUÇÃO DE PROBLEMAS

### Plano não aparece após geração via Chat
1. Verificar se `storeTextVersionContent()` está sendo chamado em `generatePlanoAula`
2. Verificar se evento `text-version:generated` está sendo emitido
3. Verificar logs do `generateActivityContent.ts`

### Dados não persistem após refresh
1. Verificar se o prefixo `text_content_plano-aula_` está sendo usado
2. Verificar se `storeTextVersionContent()` retorna sem erros
3. Verificar compatibilidade com chave nova `sp_pa_v1_`

### Preview não renderiza seções
1. Verificar se `PlanoAulaSanitizer.sanitizeOutput()` está normalizando corretamente
2. Verificar se o objeto tem todas as seções obrigatórias
3. Verificar logs do `PlanoAulaPreview`

### Geração IA falha
1. Verificar conexão com geminiClient
2. Verificar se o prompt está sendo construído corretamente
3. Verificar fallback em `generatePlanoAula`

---

## 📝 HISTÓRICO DE ALTERAÇÕES

| Data | Alteração | Autor |
|------|-----------|-------|
| Jan 2026 | Implementação do sistema de blindagem v1.0 | Agent |
| Jan 2026 | Criação de PlanoAulaSanitizer | Agent |
| Jan 2026 | Namespace dedicado sp_pa_v1_ | Agent |
| Jan 2026 | Contratos TypeScript imutáveis | Agent |
| Jan 2026 | Correção generatePlanoAula para storeTextVersionContent | Agent |

---

## 🔗 INTEGRAÇÃO COM AGENTE JOTA

Plano de Aula é gerado automaticamente pela capacidade `criar_atividade` do Agente Jota.

**Fluxo Crítico**:
```
decidir_atividades_criar → criar_atividade → generatePlanoAula → storeTextVersionContent → UI
```

**Arquivo Crítico**: `src/features/schoolpower/construction/api/generateActivityContent.ts`
- Função: `generatePlanoAula`
- DEVE chamar: `storeTextVersionContent(activityId, 'plano-aula', generatedResult)`
- DEVE emitir: `text-version:generated` event
- DEVE retornar: `isTextVersion: true`

---

**LEMBRE-SE**: Plano de Aula é uma atividade TEXT-VERSION. O fluxo de salvamento e eventos é DIFERENTE das atividades interativas. Qualquer alteração deve considerar a compatibilidade com o pipeline text-version.
