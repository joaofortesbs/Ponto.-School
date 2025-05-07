
import React from 'react';
import { EpictusIAChatMessage } from './EpictusIAChatMessage';

export const MarkdownExampleMessage: React.FC = () => {
  const exampleContent = `### 📚 Exemplo de Formatação Markdown

Esta é uma demonstração de como o **negrito**, *itálico* e \`código inline\` são renderizados.

#### Listas e Numerações

1. Primeiro item
2. Segundo item
3. Terceiro item

- Lista com marcadores
- Outro item
- Mais um item

#### Blocos de Código

\`\`\`javascript
function exemploCodigo() {
  const mensagem = "Olá, mundo!";
  console.log(mensagem);
  return mensagem;
}
\`\`\`

#### Tabelas

| Recurso | Descrição | Status |
|---------|-----------|--------|
| Negrito | Texto destacado | ✅ |
| Itálico | Texto em ênfase | ✅ |
| Código | Formatação monospace | ✅ |
| Tabelas | Organização tabular | ✅ |

#### Citações e Destaques

> Este é um bloco de citação. Ideal para destacar informações importantes ou referências.

> 💡 **DICA:** Use citações para destacar conteúdos importantes!

> ⚠️ **ATENÇÃO:** Esta é uma mensagem de aviso importante.

#### Emojis e Elementos Visuais

🎓 Educação
📊 Dados
⚡ Rápido
🔍 Pesquisa
🧩 Solução
`;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Visualização de Markdown</h2>
      <EpictusIAChatMessage 
        content={exampleContent} 
        sender="ai" 
        showTools={false}
      />
    </div>
  );
};

export default MarkdownExampleMessage;
