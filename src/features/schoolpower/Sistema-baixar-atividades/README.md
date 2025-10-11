# Sistema de Baixar Atividades - School Power

## 📋 Visão Geral

Sistema completo para download de atividades do School Power em diferentes formatos (Word .docx e PDF).

## 🎯 Atividades Suportadas

### Formato Word (.docx)
1. **Lista de Exercícios** - Exporta questões com enunciados, alternativas, dificuldade e gabaritos
2. **Plano de Aula** - Exporta plano completo com objetivos, metodologia, desenvolvimento, avaliação
3. **Sequência Didática** - Exporta todas as aulas, diagnósticos e avaliações estruturadas

### Formato PDF
4. **Quiz Interativo** - Exporta questões formatadas em PDF com layout profissional
5. **Flash Cards** - Exporta cards frente/verso em formato visual otimizado

## 📁 Estrutura do Sistema

```
Sistema-baixar-atividades/
├── services/              # Serviços de download por tipo
│   ├── listaExerciciosDownload.ts
│   ├── planoAulaDownload.ts
│   ├── sequenciaDidaticaDownload.ts
│   ├── quizInterativoDownload.ts
│   └── flashCardsDownload.ts
├── types/                 # Tipos TypeScript
│   └── index.ts
├── utils/                 # Utilitários
│   └── formatters.ts
├── index.ts              # Exportações principais
└── README.md             # Esta documentação
```

## 🔧 Como Usar

### No Código

```typescript
import { downloadActivity, isDownloadSupported } from '@/features/schoolpower/Sistema-baixar-atividades';

// Verificar se o download é suportado
if (isDownloadSupported(activityType)) {
  // Fazer download
  const result = await downloadActivity(activityData, {
    format: 'docx', // ou 'pdf'
    includeAnswers: true, // opcional
    fileName: 'minha_atividade.docx' // opcional
  });
  
  if (result.success) {
    console.log('Download concluído!');
  }
}
```

### Para o Usuário

1. Abrir uma atividade construída
2. Clicar nos 3 pontinhos (⋮) no canto superior direito
3. Selecionar "Baixar"
4. O arquivo será baixado automaticamente

## 📦 Bibliotecas Utilizadas

- **docx** - Criação de documentos Word
- **jsPDF** - Geração de PDFs
- **file-saver** - Download de arquivos no navegador

## ⚙️ Formatos por Atividade

| Atividade | Formato | Biblioteca |
|-----------|---------|------------|
| Lista de Exercícios | .docx | docx |
| Plano de Aula | .docx | docx |
| Sequência Didática | .docx | docx |
| Quiz Interativo | .pdf | jsPDF |
| Flash Cards | .pdf | jsPDF |

## 🔄 Fluxo de Download

1. **Usuário clica em Baixar** → ActivityViewModal.handleDownload()
2. **Sistema coleta dados** → localStorage + activity data
3. **Roteamento por tipo** → downloadActivity() determina qual serviço usar
4. **Geração do arquivo** → Serviço específico cria o documento
5. **Download automático** → file-saver baixa o arquivo

## 🎨 Customizações

### Adicionar Nova Atividade

1. Criar serviço em `services/novaAtividadeDownload.ts`
2. Adicionar case em `index.ts` no switch de `downloadActivity()`
3. Atualizar `getSupportedFormats()` e `isDownloadSupported()`

### Alterar Formatação

Edite os arquivos em `services/` para ajustar:
- Estilos de texto (negrito, itálico, cores)
- Estrutura de seções
- Layout de páginas
- Cabeçalhos e rodapés

## 🐛 Debug

Todos os serviços incluem logs de console:
- 📥 Início do download
- ✅ Sucesso
- ❌ Erros

## 📝 Notas Importantes

1. **Dados do localStorage**: O sistema busca dados de várias fontes para garantir completude
2. **Filtros aplicados**: Lista de Exercícios respeita questões excluídas
3. **Formatação de HTML**: Textos HTML são convertidos para texto puro
4. **Validação de dados**: Cada serviço valida se há dados suficientes antes de gerar

## 🚀 Próximas Atividades (Em Desenvolvimento)

- Mapa Mental (PNG)
- Prova (PDF)
- Texto de Apoio (Word)
- Jogos Educativos (PDF)

## 📞 Suporte

Para adicionar suporte a novos tipos de atividades ou formatos, siga a estrutura existente em `services/` e atualize o arquivo `index.ts`.
