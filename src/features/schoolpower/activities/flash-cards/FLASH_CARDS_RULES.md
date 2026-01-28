# Flash Cards - Regras de Proteção e Orquestração

> **ATENÇÃO AGENTE DO REPLIT**: Este arquivo contém regras OBRIGATÓRIAS para qualquer modificação na atividade de Flash Cards. Leia completamente antes de fazer alterações.

## Status: FUNCIONANDO CORRETAMENTE ✅
Data da última validação: Janeiro 2026

---

## 🛡️ ARQUIVOS PROTEGIDOS - NÃO MODIFICAR SEM VALIDAÇÃO

Os seguintes arquivos são considerados **CRÍTICOS** e NÃO devem ser alterados sem extrema necessidade:

### Arquivos Core (Máxima Proteção)
```
src/features/schoolpower/activities/flash-cards/
├── FlashCardsGenerator.ts       # Gerador de conteúdo IA - NÃO ALTERAR
├── FlashCardsPreview.tsx        # Componente de visualização - CUIDADO
├── contracts.ts                 # Contratos imutáveis - NÃO ALTERAR
├── index.ts                     # Exportações - MANTER ESTÁVEL
└── FLASH_CARDS_RULES.md         # Este arquivo - APENAS ADICIONAR
```

### Arquivos de Suporte (Proteção Moderada)
```
src/features/schoolpower/construction/
├── components/EditFields/FlashCardsEditActivity.tsx
└── services/buildActivityHelper.ts (seção flash-cards)
```

---

## 📋 CONTRATOS DE INTERFACE OBRIGATÓRIOS

### 1. Contrato de Card Individual (FlashCardContract)
```typescript
interface FlashCardContract {
  readonly id: number;
  readonly front: string;        // Mínimo 3 caracteres - pergunta/termo
  readonly back: string;         // Mínimo 3 caracteres - resposta/definição
  readonly category?: string;    // Categoria/disciplina
  readonly difficulty?: string;  // Fácil, Médio, Difícil
}
```

### 2. Contrato de Dados de Entrada (FlashCardsInputContract)
```typescript
interface FlashCardsInputContract {
  readonly id?: string;
  readonly theme: string;                    // Obrigatório
  readonly subject?: string;
  readonly schoolYear?: string;
  readonly topicos: string;                  // Obrigatório
  readonly numberOfFlashcards: number;       // Entre 1 e 50
  readonly context?: string;
  readonly difficultyLevel?: string;
}
```

### 3. Contrato de Saída Gerada (FlashCardsOutputContract)
```typescript
interface FlashCardsOutputContract {
  readonly title: string;
  readonly description?: string;
  readonly cards: readonly FlashCardContract[];
  readonly totalCards: number;
  readonly theme: string;
  readonly subject?: string;
  readonly generatedByAI: boolean;
  readonly generatedAt: string;
}
```

---

## 🔄 FLUXO DE DADOS ESPERADO

```
[Dados Externos - Chat, EditModal, API] 
       ↓
[FlashCardsSanitizer.sanitize()] ← OBRIGATÓRIO
       ↓
[FlashCardsInputContract] (dados validados e imutáveis)
       ↓
[FlashCardsGenerator] (geração IA via geminiClient)
       ↓
[FlashCardsOutputContract] (conteúdo gerado)
       ↓
[localStorage: sp_fc_v2_{id}] (persistência isolada)
       ↓
[FlashCardsPreview] (renderização)
```

---

## ⚠️ REGRAS DE MODIFICAÇÃO

### PERMITIDO ✅
- Adicionar novos campos OPCIONAIS às interfaces
- Melhorar mensagens de log
- Adicionar novas validações que NÃO quebrem compatibilidade
- Corrigir bugs específicos de Flash Cards
- Melhorar estilos visuais do Preview

### PROIBIDO ❌
- Alterar tipos de campos existentes (front, back, cards)
- Remover campos obrigatórios
- Modificar a estrutura de cards (id, front, back)
- Alterar prefixos de storage (`sp_fc_v2_`)
- Modificar a lógica de sanitização sem testes
- Alterar a interface FlashCardsPreviewProps

---

## 🔑 CHAVES DE STORAGE

Flash Cards usa prefixos DEDICADOS para evitar colisões:

| Tipo | Prefixo | Exemplo |
|------|---------|---------|
| Dados Construídos | `sp_fc_v2_` | `sp_fc_v2_abc123` |
| Cache de Geração | `sp_fc_v2_cache_` | `sp_fc_v2_cache_Matemática_10` |
| Backup Legacy | `constructed_flash-cards_` | Compatibilidade com dados antigos |

**IMPORTANTE**: Sempre verificar AMBOS os prefixos ao carregar dados (novo e legacy).

---

## 🔌 DEPENDÊNCIAS EXTERNAS

Flash Cards depende dos seguintes serviços globais. Se alterá-los, VALIDE Flash Cards:

| Serviço | Arquivo | Impacto |
|---------|---------|---------|
| geminiClient | `src/utils/api/geminiClient.ts` | Alto - Geração de conteúdo |
| StorageOrchestrator | `src/features/schoolpower/services/StorageOrchestrator.ts` | Alto - Persistência |
| EditActivityModal | `src/features/schoolpower/construction/EditActivityModal.tsx` | Alto - Fluxo de edição |
| buildActivityHelper | `src/features/schoolpower/construction/services/buildActivityHelper.ts` | Alto - Salva dados |
| ActivityViewModal | `src/features/schoolpower/construction/ActivityViewModal.tsx` | Alto - Carrega e exibe |

---

## 🧪 VALIDAÇÃO ANTES DE COMMIT

Antes de fazer commit em qualquer arquivo relacionado a Flash Cards:

1. **Verificar se a geração funciona**:
   - Criar um Flash Card com 5 cards
   - Verificar se os cards aparecem no Preview
   - Verificar se é possível virar os cards (frente/verso)

2. **Verificar contratos**:
   - Todos os cards têm `front` e `back`?
   - Os IDs são únicos?
   - O sanitizador está sendo chamado?

3. **Verificar logs**:
   - `🃏 [FlashCardsPreview]` deve aparecer nos logs
   - Quantidade de cards deve bater com o esperado

4. **Verificar persistência**:
   - Recarregar a página
   - Os cards ainda aparecem?

---

## 🆘 SOLUÇÃO DE PROBLEMAS

### Cards não aparecem no Preview
1. Verificar se `content.cards` existe e é um array
2. Verificar se cada card tem `front` e `back` válidos
3. Verificar logs do `FlashCardsPreview` para erros de normalização

### Dados não persistem após refresh
1. Verificar se o prefixo `sp_fc_v2_` está sendo usado
2. Verificar se o `StorageOrchestrator` está roteando corretamente
3. Verificar compatibilidade com chave legacy `constructed_flash-cards_`

### Geração IA falha
1. Verificar conexão com geminiClient
2. Verificar se o prompt está sendo construído corretamente
3. Verificar fallback (deve gerar cards baseados nos tópicos)

### Card não vira (flip)
1. Verificar se o estado `isFlipped` está funcionando
2. Verificar se há erro de CSS/animação
3. Verificar se o card tem dados válidos

---

## 📝 HISTÓRICO DE ALTERAÇÕES

| Data | Alteração | Autor |
|------|-----------|-------|
| Jan 2026 | Implementação do sistema de blindagem | Agent |
| Jan 2026 | Criação de FlashCardsSanitizer | Agent |
| Jan 2026 | Namespace dedicado sp_fc_v2_ | Agent |
| Jan 2026 | Contratos TypeScript imutáveis | Agent |

---

**LEMBRE-SE**: Flash Cards está funcionando corretamente. Qualquer alteração deve ser feita com extremo cuidado e validação completa. Em caso de dúvida, NÃO ALTERE.
