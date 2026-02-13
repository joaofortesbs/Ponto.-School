# 🛠️ Guia de Implementação: O Motor de Curadoria Ponto. Flow

Para o time de desenvolvimento transformar a visão em realidade, precisamos implementar uma camada de **Post-Processing** na resposta do Jota.

---

## 1. O Fluxo de Dados (Pipeline)

1.  **Input:** Usuário clica no card "Salve minha semana".
2.  **Prompt de Sistema:** O Jota recebe instruções para gerar um JSON estruturado, não apenas texto.
3.  **Geração:** O Jota gera os conteúdos (IDs das atividades, títulos, descrições e categorias).
4.  **Renderização (Frontend):** O componente `DossieComponent` recebe o JSON e monta a interface em blocos (Engajamento, Conteúdo, Prática, Avaliação).

---

## 2. Exemplo de Schema JSON (O que o Jota deve cuspir)

```json
{
  "dossie_titulo": "Semana de Funções do 2º Grau",
  "objetivo_bncc": "EM13MAT302",
  "categorias": [
    {
      "id": "engajamento",
      "titulo": "Fase 1: Aquecimento",
      "atividades": [
        { "id": "quiz_123", "tipo": "quiz", "titulo": "Desafio Inicial: O que é uma Função?" }
      ]
    },
    {
      "id": "conteudo",
      "titulo": "Fase 2: Mergulho",
      "atividades": [
        { "id": "plano_456", "tipo": "plano_aula", "titulo": "Roteiro: Dominando o Gráfico" },
        { "id": "slides_789", "tipo": "slides", "titulo": "Apresentação Visual: Funções no Mundo Real" }
      ]
    }
  ],
  "insight_preditivo": "Notei que sua turma costuma ter dificuldade com o eixo Y. Adicionei um reforço visual no slide 4."
}
```

---

## 3. Features Críticas para o MVP

*   **Agrupador de Ativos:** Uma função que mapeia o `tipo_atividade` para a `categoria_dossie` correta.
*   **Editor de Dossiê:** Permitir que o professor arraste uma atividade da "Fase 2" para a "Fase 1".
*   **Botão de Ação em Massa:** "Baixar todos os PDFs do Dossiê" (Isso economiza 10 minutos de cliques manuais).

---

## 4. Por que isso resolve a "Confusão da IA"?

A IA se confunde porque ela tenta ser linear em um chat que é vertical. Ao forçar o output para um **Schema Estruturado**, nós tiramos a responsabilidade da "organização visual" da IA e passamos para o Código (Frontend). A IA foca no conteúdo, o Código foca na ordem.

---

**Veredito:** Menos chat, mais **Dashboard de Execução**.
