# 🏗️ Arquitetura de Resposta: Ponto. Flow

Esta especificação define como o Jota deve organizar o output para eliminar a confusão visual e entregar um fluxo de trabalho pronto para o professor.

---

## 1. O Componente "Dossiê" (UI/UX)

Em vez de cards soltos no chat, o Jota deve encapsular a resposta em um componente chamado **Dossiê Ponto. Flow**.

### Estrutura Visual:
*   **Seção 01: Resumo Executivo**
    *   Título da Missão (ex: "Semana de Funções do 2º Grau")
    *   Objetivo BNCC principal.
    *   Tempo estimado de aplicação.
*   **Seção 02: A Trilha Pedagógica (Hierarquia)**
    *   **Bloco "Para Começar" (Engajamento):** Atividades de introdução (Quizzes, Vídeos).
    *   **Bloco "Para Ensinar" (Conteúdo):** Planos de aula, Slides, Explicações.
    *   **Bloco "Para Praticar" (Fixação):** Listas de exercícios, Flashcards.
    *   **Bloco "Para Avaliar" (Fechamento):** Rubricas, Provas, Feedbacks.
*   **Seção 03: Ações Rápidas**
    *   Botão [Baixar Tudo em ZIP]
    *   Botão [Sincronizar Calendário]
    *   Botão [Enviar para Alunos]

---

## 2. Lógica de Orquestração (Backend)

Para que o Jota organize as atividades, ele deve seguir este fluxo de pensamento (Chain of Thought):

1.  **Identificação do Objetivo:** O que o professor quer? (Ex: "Transformar arquivo em atividade").
2.  **Seleção de Ativos:** Quais ferramentas do ecossistema P.S resolvem isso? (Ex: Quiz + Flashcards + Resumo).
3.  **Mapeamento de Fluxo:** Qual a ordem lógica de uso desses ativos?
4.  **Geração e Agrupamento:** O Jota gera os conteúdos e os atribui às categorias do Dossiê.

---

## 3. Template de Resposta: Card "Transforme arquivos em atividades"

**Objetivo:** Pegar um material bruto e transformá-lo em uma sequência de aprendizado.

### Exemplo de Resposta Estruturada:

> **Jota:** "Professor, processei seu arquivo 'Aula_Genetica.pdf'. Aqui está o seu **Kit de Transformação**:"
>
> ### 📂 Dossiê: Transformação de Conteúdo
> ---
> #### 🎯 Fase 1: Diagnóstico (O que eles já sabem?)
> *   **[🎮 Quiz de Nivelamento]:** Baseado nas páginas 1-3 do seu PDF.
>
> #### 🧠 Fase 2: Fixação (Como eles vão aprender?)
> *   **[🃏 Flashcards de Conceitos]:** 15 termos-chave extraídos do texto.
> *   **[📝 Lista de Exercícios Adaptada]:** Questões do PDF reformuladas para o nível 'Intermediário'.
>
> #### 📢 Fase 3: Conexão (Como comunicar?)
> *   **[📱 Script para WhatsApp]:** Mensagem pronta para enviar aos alunos explicando a atividade.
> ---
> **Próximo Passo:** "Deseja que eu crie uma versão simplificada deste material para alunos com dificuldades de aprendizagem?"

---

## 4. Benefícios desta Abordagem
1.  **Redução da Carga Cognitiva:** O professor não precisa decidir a ordem; a IA sugere a melhor prática pedagógica.
2.  **Percepção de Valor:** O "Dossiê" parece um produto premium, enquanto a "Lista de Cards" parece um rascunho.
3.  **Escalabilidade:** Novos tipos de atividades podem ser adicionados facilmente em novas categorias do Dossiê.

---

**Veredito do Mentor:** Esta arquitetura transforma o Jota de um "Gerador de Texto" em um **"Designer Instrucional Automatizado"**.
