
# Consolidação dos Componentes de IA

Este projeto tem múltiplas implementações de componentes relacionados a IA:
- EpictusIA (diversas versões)
- MentorIA (diversas versões)
- SchoolIA

## Estratégia de Consolidação

1. Criar uma interface base compartilhada `IAInterface.tsx`
2. Implementar versões específicas através de composição
3. Usar um padrão de Strategy para diferentes modos/comportamentos
4. Centralizar a lógica de IA em hooks e serviços compartilhados

## Estrutura Proposta

```
src/
  features/
    ia/
      components/
        base/ (componentes base compartilhados)
        epictus/ (implementações específicas do Epictus)
        mentor/ (implementações específicas do Mentor)
        school/ (implementações específicas do School)
      hooks/
        useIAProcessor.ts
        useIAChat.ts
        useIASuggestions.ts
      services/
        iaService.ts
        chatService.ts
      types/
        ia-types.ts
```

Isso permitirá:
1. Reutilização de código entre diferentes interfaces de IA
2. Manutenção centralizada de componentes relacionados
3. Expansão mais fácil para novos tipos de interfaces de IA
