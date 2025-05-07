
import React from 'react';
import { EpictusIAChatMessage } from './EpictusIAChatMessage';

const MarkdownExampleMessage: React.FC = () => {
  const markdownContent = `# Exemplo de Formatação Markdown

## Recursos de Texto
**Texto em negrito** - Destaque principal
*Texto em itálico* - Ênfase secundária
~~Texto riscado~~ - Informação superada

## Listas Organizadas
### Lista não ordenada:
- Item principal
  - Sub-item importante
  - Outro sub-item
- Segundo item principal
- Terceiro item principal

### Lista numerada:
1. Primeiro passo
2. Segundo passo
   1. Sub-passo 2.1
   2. Sub-passo 2.2
3. Terceiro passo

## Blocos de código
\`\`\`python
def calcular_media(notas):
    return sum(notas) / len(notas)
    
# Exemplo de uso
notas = [8.5, 9.0, 7.5, 10.0]
media = calcular_media(notas)
print(f"A média é: {media}")
\`\`\`

## Citações e Destaques
> 💡 **DICA IMPORTANTE:** Este bloco é perfeito para destacar informações essenciais, dicas ou avisos.

> ⚠️ **ATENÇÃO:** Este é um formato ideal para alertas e informações críticas que merecem atenção especial.

## Tabelas Informativas

| Funcionalidade | Descrição | Benefício |
|----------------|-----------|-----------|
| **Negrito** | Destaque visual | Facilita memorização |
| *Itálico* | Ênfase suave | Indica termos importantes |
| \`Código\` | Formatação técnica | Diferencia comandos |
| Tabelas | Organização de dados | Comparações visuais |

### 📚 Conclusão
A formatação adequada torna o conteúdo mais:
1. Organizado
2. Acessível 
3. Memorável
4. Visualmente atraente

**Gostaria que eu demonstrasse alguma outra funcionalidade de formatação?**`;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Demonstração de Markdown</h2>
      <EpictusIAChatMessage 
        content={markdownContent} 
        sender="ai" 
        isPremium={true}
      />
    </div>
  );
};

export default MarkdownExampleMessage;
