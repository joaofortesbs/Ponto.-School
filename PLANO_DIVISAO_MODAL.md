# Plano de Divisão do EditActivityModal.tsx

## Objetivo
Dividir o arquivo gigante (3225 linhas) em módulos menores e organizados, mantendo todas as funcionalidades intactas.

## Problemas Atuais Identificados
1. ✅ Hook `useActivityAutoLoad` implementado e funcionando
2. ✅ useEffect aplicando dados (linhas 620-632)
3. ⚠️  **PROBLEMA**: useState inicial pode estar competindo com o auto-load
4. 📦 Arquivo muito grande (3225 linhas) dificulta manutenção

## Arquitetura Proposta

### 1. Componentes de Edição (EditFields/)
```
src/features/schoolpower/construction/components/EditFields/
├── index.ts                        # Exporta todos os componentes
├── DefaultEditActivity.tsx         # ✅ JÁ CRIADO
├── QuizInterativoEditActivity.tsx  # ⏳ CRIAR
├── QuadroInterativoEditActivity.tsx# ⏳ CRIAR
├── SequenciaDidaticaEditActivity.tsx# ⏳ CRIAR
├── FlashCardsEditActivity.tsx      # ⏳ CRIAR
└── TeseRedacaoEditActivity.tsx     # ✅ JÁ EXISTE (em outro local)
```

### 2. Componentes do Modal (Modal/)
```
src/features/schoolpower/construction/components/Modal/
├── ModalHeader.tsx      # Cabeçalho com título e botão fechar
├── ModalTabs.tsx        # Tabs Editar/Preview
└── ModalActions.tsx     # Botões de ação (Salvar, Cancelar, etc)
```

### 3. Utilitários
```
src/features/schoolpower/construction/utils/
├── activityFieldMapping.ts  # ✅ JÁ EXISTE
├── activityIcons.ts        # Mapeamento de ícones
├── activityPreviewMapping.ts # Mapeamento de componentes Preview
└── processActivityData.ts   # Processar dados específicos
```

### 4. Hooks
```
src/features/schoolpower/construction/hooks/
├── useActivityAutoLoad.ts   # ✅ JÁ EXISTE
├── useGenerateActivity.ts   # ✅ JÁ EXISTE
└── useActivityForm.ts      # ⏳ CRIAR - Gerenciar estado do form
```

## Etapas de Implementação

### Fase 1: Extrair Componentes de Edição (PRIORITÁRIO)
- [x] DefaultEditActivity.tsx
- [ ] QuizInterativoEditActivity.tsx
- [ ] QuadroInterativoEditActivity.tsx  
- [ ] SequenciaDidaticaEditActivity.tsx
- [ ] FlashCardsEditActivity.tsx
- [ ] Criar index.ts para exportar todos

### Fase 2: Criar Utilit\u00e1rios
- [ ] activityIcons.ts
- [ ] activityPreviewMapping.ts
- [ ] processActivityData.ts

### Fase 3: Dividir Modal em Componentes
- [ ] ModalHeader.tsx
- [ ] ModalTabs.tsx
- [ ] ModalActions.tsx

### Fase 4: Hook de Formulário
- [ ] useActivityForm.ts (gerenciar formData e onChange)

### Fase 5: Refatorar Modal Principal
- [ ] Importar componentes extraídos
- [ ] Remover código duplicado
- [ ] Simplificar lógica
- [ ] **META: Reduzir de 3225 linhas para ~500 linhas**

## Correção do Auto-Fill (CRÍTICO)

### Problema Identificado
O useState inicial define valores vazios que podem estar competindo com o auto-load.

### Solução
Modificar o useState para não inicializar os campos da Tese de Redação, deixando o hook preencher:

```typescript
// ANTES (linha 571-575)
temaRedacao: '',
objetivo: '',
nivelDificuldade: '',
competenciasENEM: '',
contextoAdicional: ''

// DEPOIS
temaRedacao: undefined,
objetivo: undefined,
nivelDificuldade: undefined,
competenciasENEM: undefined,
contextoAdicional: undefined
```

Ou usar uma abordagem lazy:

```typescript
const [formData, setFormData] = useState<ActivityFormData>(() => {
  // Não inicializar campos de Tese de Redação
  // Deixar o hook preencher
  return {
    title: activity?.title || activity?.personalizedTitle || '',
    description: activity?.description || activity?.personalizedDescription || '',
    // ... outros campos comuns
    // NÃO incluir temaRedacao, objetivo, etc aqui
  };
});
```

## Benefícios Esperados
1. ✅ Código modular e fácil de manter
2. ✅ Componentes reutilizáveis
3. ✅ Testes mais fáceis
4. ✅ Auto-fill funcionando perfeitamente
5. ✅ Menos risco de bugs
6. ✅ Melhor performance (chunks menores)
