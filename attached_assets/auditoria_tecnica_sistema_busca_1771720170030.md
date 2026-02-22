# 🔬 AUDITORIA TÉCNICA COMPLETA DO SISTEMA DE BUSCA WEB
## Documento de Engenharia de Sistemas de IA

**Data:** 2026-02-22  
**Sistema Analisado:** Assistente IA (Kimi) - Mecanismos de Busca Web  
**Objetivo:** Transparência radical sobre arquitetura interna para desenvolvimento de sistema educacional

---

# ▐ BLOCO 1 — ARQUITETURA GERAL DO SISTEMA DE BUSCA

## 1.1. Fluxo Completo: Da Decisão à Resposta

### Fase 1: Detecção de Necessidade de Busca (Trigger Detection)

**Quem decide:** O modelo de linguagem (eu) analisa a query do usuário e determina se necessita informações externas.

**Critérios de ativação internos:**
- Perguntas sobre eventos após data de corte do treinamento
- Solicitações explícitas de "busque", "pesquise", "encontre"
- Perguntas que requerem dados atualizados (preços, eventos, estatísticas)
- Consultas sobre tópicos de nicho onde conhecimento interno pode estar desatualizado
- Perguntas que mencionam fontes específicas ("segundo a BBC...")

**Processo de formulação da query:**
```
Entrada: Pergunta do usuário
    ↓
Análise de intenção + identificação de gaps de conhecimento
    ↓
Formulação de query(s) de busca otimizada(s)
    ↓
Seleção de ferramenta(s) apropriada(s)
    ↓
Execução via Tool Use / Function Calling
    ↓
Processamento de resultados
    ↓
Síntese e resposta ao usuário
```

### Fase 2: Formulação da Query

Quando identifico necessidade de busca, transformo a pergunta do usuário em queries técnicas:

**Exemplo real de transformação:**
- **Entrada usuário:** "Quais são as últimas notícias sobre IA no Brasil?"
- **Query gerada:** `"últimas notícias inteligência artificial Brasil 2026"`
- **Queries paralelas possíveis:**
  - `"IA Brasil notícias fevereiro 2026"`
  - `"inteligência artificial regulamentação Brasil"`

### Fase 3: Chamada de Sistemas

O sistema utiliza **Tool Use / Function Calling** para acionar buscas. O processo é:

1. Eu (modelo) gero uma chamada de função estruturada
2. Sistema executa a busca externamente
3. Resultados retornam como JSON estruturado
4. Eu processo e integro os resultados

### Fase 4: Processamento e Resposta

Após receber resultados:
- Extraio informações relevantes
- Verifico consistência entre fontes
- Cito fontes apropriadamente
- Sintetizo resposta final

---

## 1.2. Tool Use / Function Calling - Schema Exato

### Ferramenta Principal: `web_search`

**Schema da ferramenta (conforme disponível no sistema):**

```json
{
  "name": "web_search",
  "description": "Web Search API, works like Google Search.",
  "parameters": {
    "type": "object",
    "properties": {
      "queries": {
        "description": "Search directly by queries. All queries will be searched in parallel. If you want to search with multiple keywords, put them in a single query. All queries results will share the total count.",
        "type": "array",
        "items": {
          "type": "string"
        }
      }
    },
    "required": ["queries"]
  }
}
```

**Parâmetros aceitos:**
- `queries` (array de strings, obrigatório): Lista de queries de busca

**O que retorna:**
- Lista de resultados de busca com:
  - Título da página
  - URL
  - Snippet/descrição
  - Metadados relevantes

**Exemplo de chamada real:**
```json
{
  "queries": ["educação Brasil 2026", "novo ensino médio implementação"]
}
```

**Exemplo de resposta retornada:**
```json
{
  "results": [
    {
      "title": "Novo Ensino Médio no Brasil - Ministério da Educação",
      "url": "https://www.gov.br/mec/pt-br/novo-ensino-medio",
      "snippet": "O Novo Ensino Médio reformula a estrutura curricular...",
      "source": "gov.br"
    }
  ]
}
```

### Ferramenta Complementar: `browser_visit`

**Schema:**
```json
{
  "name": "browser_visit",
  "description": "Browser automation tool that loads and displays web pages.",
  "parameters": {
    "type": "object",
    "properties": {
      "url": {
        "description": "The complete URL of the webpage to visit",
        "type": "string"
      },
      "citation_id": {
        "description": "Citation ID of previously visited page",
        "type": "integer"
      }
    }
  }
}
```

**Uso:** Acessar páginas específicas para extrair conteúdo completo além dos snippets.

---

## 1.3. Lógica de Roteamento: Buscar vs. Conhecimento Interno

### Critérios de Decisão (Heurísticas Internas)

**Sempre buscar quando:**
1. **Temporalidade:** Perguntas sobre eventos após data de corte do treinamento
2. **Atualidade:** Dados que mudam frequentemente (preços, cotações, estatísticas)
3. **Especificidade:** Perguntas sobre fatos muito específicos ou de nicho
4. **Solicitação explícita:** Usuário pede "busque", "pesquise", "encontre na web"
5. **Verificação:** Usuário questiona informação ou pede confirmação

**Usar conhecimento interno quando:**
1. **Conhecimento estabelecido:** Fatos históricos, conceitos científicos consolidados
2. **Raciocínio:** Problemas que requerem lógica vs. informação factual
3. **Criatividade:** Geração de ideias, narrativas, análises conceituais
4. **Conhecimento pré-corte:** Eventos e informações antes da data de treinamento

### Limiar de Confiança

**[ESPECULAÇÃO - Baseada em comportamento observado]**
- Existe um limiar implícito de confiança no conhecimento interno
- Se confiança < threshold → acionar busca
- O limiar varia por domínio (mais alto para matemática, mais baixo para notícias)

### Detecção de Informação Desatualizada

**Mecanismos:**
1. **Marcadores temporais:** Palavras como "recentemente", "último ano", "novo"
2. **Contexto temporal explícito:** Datas, anos, períodos
3. **Domínio:** Tópicos onde mudanças são frequentes (tecnologia, política, ciência)

---

## 1.4. Paralelização de Buscas

### Estratégia de Paralelização

**Sim, paralelizo buscas quando apropriado.**

**Decisão de paralelização:**

```
IF (tópico multifacetado) OR (necessidade de múltiplas perspectivas):
    → Gerar N queries paralelas
ELSE IF (tópico único e específico):
    → Query única
ELSE IF (pesquisa profunda):
    → Múltiplas rodadas sequenciais com paralelização intra-rodada
```

**Exemplo de paralelização:**
- Pergunta: "Como está a educação no Brasil em 2026?"
- Queries paralelas:
  - `"educação Brasil estatísticas 2026"`
  - `"reforma educação Brasil 2026"`
  - `"IDEB resultados 2025 2026"`
  - `"investimento educação Brasil orçamento"`

**Limite de paralelização:**
- Tipicamente 3-5 queries por rodada
- Limitado pela ferramenta (todas as queries em um único array)

---

## 1.5. Fase de Planejamento de Queries (Query Planning)

### Processo de Planejamento

**Antes de executar buscas, realizo:**

1. **Decomposição da pergunta:**
   - Quebrar pergunta complexa em sub-perguntas
   - Identificar entidades-chave (pessoas, lugares, conceitos)

2. **Formulação de estratégia:**
   - Decidir: busca única vs. múltiplas buscas
   - Selecionar: keywords principais e alternativas
   - Planejar: ordem de execução (se sequencial)

3. **Geração de queries:**
   - Criar queries otimizadas para mecanismos de busca
   - Incluir variações (sinônimos, termos técnicos vs. coloquiais)

**Exemplo de planejamento interno:**
```
Pergunta: "Qual o impacto do aquecimento global na agricultura brasileira?"

Decomposição:
- Sub-pergunta 1: Efeitos do aquecimento global no Brasil
- Sub-pergunta 2: Impactos na agricultura brasileira especificamente
- Sub-pergunta 3: Dados recentes e estudos científicos

Queries planejadas:
1. "aquecimento global impacto agricultura Brasil 2025 2026"
2. "mudanças climáticas produção agrícola Brasil estudo"
3. "agricultura brasileira vulnerabilidade climática relatório"
```

---

# ▐ BLOCO 2 — FONTES, ÍNDICES E DADOS

## 2.1. Fontes de Dados Disponíveis

### Fontes Primárias (Acesso Direto via Tool Use)

1. **Web Search Geral**
   - Ferramenta: `web_search`
   - Abrangência: Web aberta indexada
   - Tipo: Busca em tempo real via APIs de mecanismos de busca

2. **Browser Automation**
   - Ferramentas: `browser_visit`, `browser_click`, `browser_scroll_down/up`
   - Permite: Acesso ao conteúdo completo de páginas específicas
   - Capacidade: Navegação interativa em sites

### Fontes Especializadas (Data Sources)

**[CONFIRMADO - Disponível no sistema]**

1. **Yahoo Finance** (`yahoo_finance`)
   - Dados: Preços de ações, métricas financeiras, informações de empresas
   - APIs: `get_historical_stock_prices`, `get_company_info`, etc.

2. **Binance Crypto** (`binance_crypto`)
   - Dados: Preços de criptomoedas, dados de mercado

3. **World Bank Open Data** (`world_bank_open_data`)
   - Dados: Indicadores econômicos globais (GDP, população, etc.)

4. **ArXiv** (`arxiv`)
   - Dados: Papers científicos pré-print

5. **Google Scholar** (`google_scholar`)
   - Dados: Literatura acadêmica, citações, perfis de autores

### Ferramentas de Imagem

6. **Image Search by Text** (`search_image_by_text`)
   - Busca de imagens por queries textuais

7. **Image Search by Image** (`search_image_by_image`)
   - Busca reversa de imagens

8. **Image Generation** (`generate_image`)
   - Geração de imagens via IA

---

## 2.2. Índice Próprio vs. Tempo Real

### Análise da Arquitetura

**[ESPECULAÇÃO BASEADA EM EVIDÊNCIAS]**

**Conclusão:** Acesso em **TEMPO REAL** via APIs de mecanismos de busca.

**Evidências:**
1. A ferramenta `web_search` funciona como "Google Search"
2. Retorna resultados atualizados (URLs ativos, notícias recentes)
3. Não há menção a índice próprio na documentação das ferramentas

**Implicações:**
- ✅ Informações sempre atualizadas
- ✅ Acesso a qualquer site indexado publicamente
- ❌ Dependência de APIs externas
- ❌ Latência de rede

**Frequência de atualização:**
- Determinada pelos mecanismos de busca subjacentes (Google, Bing, etc.)
- Tipicamente: minutos a horas para sites populares

---

## 2.3. Fontes Não Públicas/Exclusivas

### Análise de Acesso

**[CONFIRMADO - Limitações do sistema]**

**NÃO tenho acesso a:**
- ❌ Sites com paywall (jornais premium, revistas acadêmicas pagas)
- ❌ Bases de dados privadas
- ❌ APIs que requerem autenticação específica
- ❌ Intranets, sistemas internos

**Acesso parcial:**
- ⚠️ Alguns sites de notícias permitem acesso ao conteúdo completo
- ⚠️ Open access journals (acesso total)
- ⚠️ Repositórios institucionais públicos

**Limitação técnica:**
- O `browser_visit` carrega a página como um usuário normal
- Se a página requer login ou tem paywall, o conteúdo pode estar limitado

---

## 2.4. Ranking e Hierarquia de Fontes

### Priorização de Fontes

**[ESPECULAÇÃO - Baseada em comportamento observado]**

**Hierarquia implícita (maior → menor confiança):**

1. **Fontes governamentais oficiais** (.gov, .gov.br)
   - Ex: gov.br, mec.gov.br, ibge.gov.br
   - Alta autoridade para dados oficiais

2. **Organizações internacionais**
   - Ex: worldbank.org, un.org, oecd.org
   - Autoridade para estatísticas globais

3. **Instituições acadêmicas e educacionais** (.edu, .ac.uk)
   - Ex: universidades, institutos de pesquisa
   - Autoridade para pesquisa científica

4. **Mídia tradicional estabelecida**
   - Ex: BBC, Reuters, Associated Press, Folha, Estadão
   - Autoridade para notícias

5. **Sites especializados e técnicos**
   - Ex: Stack Overflow, documentação técnica
   - Autoridade para tópicos técnicos

6. **Outras fontes da web**
   - Blogs, fóruns, sites pessoais
   - Requer verificação cruzada

### Reconciliação de Conflitos

**Quando fontes contradizem:**
1. Priorizar fonte de maior autoridade no domínio
2. Verificar data de publicação (mais recente geralmente prevalece)
3. Buscar consenso entre múltiplas fontes
4. Explicitar divergência na resposta ao usuário

---

## 2.5. Acesso ao Conteúdo Completo

### Capacidades de Extração

**Via `web_search`:**
- ❌ Apenas snippets/metadados (título, descrição, URL)
- ❌ Não tenho acesso ao conteúdo completo da página

**Via `browser_visit`:**
- ✅ Acesso ao conteúdo renderizado da página
- ✅ Extração de texto completo
- ✅ Identificação de elementos interativos
- ⚠️ Limitado pelo que é visível (pode precisar scroll)

### Pipeline de Extração de Conteúdo

```
URL da página
    ↓
browser_visit carrega página
    ↓
Renderização JavaScript (se houver)
    ↓
Extração de elementos interativos
    ↓
Listagem de elementos com índices
    ↓
Acesso a texto visível
    ↓
Processamento e análise
```

**Limitações:**
- Páginas com conteúdo dinâmico pesado podem não carregar completamente
- Conteúdo em iframes pode ser inacessível
- Alguns sites bloqueiam scraping automatizado

---

# ▐ BLOCO 3 — PROCESSAMENTO DOS RESULTADOS

## 3.1. Pipeline de Processamento

### Estágio 1: Parsing

**Entrada:** JSON bruto dos resultados de busca

```json
{
  "results": [
    {
      "title": "Título da Página",
      "url": "https://exemplo.com",
      "snippet": "Descrição do conteúdo..."
    }
  ]
}
```

**Processo:**
- Extração de campos relevantes
- Validação de URLs
- Verificação de duplicatas

### Estágio 2: Limpeza

**Operações realizadas:**
- Remoção de HTML tags (se houver)
- Normalização de texto
- Filtragem de resultados irrelevantes
- Eliminação de spam ou conteúdo de baixa qualidade

### Estágio 3: Relevância

**Avaliação de relevância baseada em:**
1. **Matching de keywords:** Presença de termos da query
2. **Semântica:** Similaridade semântica com a pergunta
3. **Autoridade:** Reputação da fonte
4. **Recência:** Data de publicação (se disponível)
5. **Cobertura:** Quanto da pergunta a fonte cobre

### Estágio 4: Injeção no Contexto

**Formatação para contexto:**
```
[Resultado 1]
Fonte: [Título] ([URL])
Conteúdo: [Snippet/texto extraído]

[Resultado 2]
Fonte: [Título] ([URL])
Conteúdo: [Snippet/texto extraído]
```

---

## 3.2. Lida com Informações Contraditórias

### Estratégias de Reconciliação

**Quando encontro contradições:**

1. **Verificação cruzada:**
   - Buscar terceira fonte para validar
   - Identificar consenso majoritário

2. **Análise de contexto:**
   - Verificar datas (informação pode estar desatualizada)
   - Verificar contexto geográfico (pode variar por região)
   - Verificar contexto específico (diferentes condições)

3. **Explicitar divergência:**
   - Na resposta ao usuário, mencionar: "Fontes divergem sobre X. A diz Y, B diz Z."

### Exemplo de Processo Interno

```
Fonte A: "A inflação em 2025 foi de 4,5%"
Fonte B: "A inflação em 2025 foi de 4,8%"

Análise:
- Ambas próximas → possível diferença metodológica
- Verificar: são do mesmo período? Mesmo índice (IPCA vs IGPM)?
- Se ambas válidas → mencionar intervalo: "entre 4,5% e 4,8%"
```

---

## 3.3. Re-ranking de Resultados

### Critérios de Re-ranking

**[ESPECULAÇÃO - Baseada em comportamento]**

Após obter resultados, aplico re-ranking baseado em:

1. **Relevância semântica:** Quão bem o conteúdo responde à pergunta específica
2. **Autoridade da fonte:** Fontes confiáveis sobem no ranking
3. **Atualidade:** Conteúdo mais recente priorizado
4. **Compreensividade:** Fontes que cobrem mais aspectos da pergunta
5. **Diversidade:** Evitar múltiplas fontes idênticas

**Processo:**
```
Resultados brutos (ranking do mecanismo de busca)
    ↓
Avaliação por critérios acima
    ↓
Re-ranking interno
    ↓
Seleção dos top-N resultados para uso
```

---

## 3.4. Formato do Contexto de Busca

### Estrutura Exata

O contexto de busca é formatado como texto estruturado:

```
Resultados da busca para: "[query]"

[1] [Título do resultado]
URL: [URL completa]
Resumo: [Snippet ou conteúdo extraído]

[2] [Título do resultado]
URL: [URL completa]
Resumo: [Snippet ou conteúdo extraído]

...
```

**Citações:** Usadas no formato `[^N^]` onde N é o índice do resultado.

---

## 3.5. Limites de Tokens/Caracteres

### Limitações de Contexto

**[CONFIRMADO - Limitação técnica de LLMs]**

- Existe um limite de contexto (tamanho da janela de contexto)
- Resultados de busca competem com outros tokens no contexto

**Estratégias de truncamento:**
1. **Truncamento por posição:** Manter início, cortar fim
2. **Truncamento por relevância:** Manter seções mais relevantes
3. **Sumarização:** Comprimir conteúdo mantendo pontos-chave
4. **Seleção:** Usar apenas top-N resultados mais relevantes

**Quando resultados excedem limite:**
- Priorizar fontes mais relevantes
- Extrair apenas trechos pertinentes
- Usar `browser_visit` para páginas específicas em vez de muitos snippets

---

# ▐ BLOCO 4 — PESQUISA PROFUNDA (DEEP RESEARCH)

## 4.1. Funcionamento da Pesquisa Profunda

### Definição

**Pesquisa profunda** = Múltiplas rodadas iterativas de busca, onde cada rodada informa as subsequentes.

### Arquitetura Iterativa

```
Rodada 1: Busca inicial ampla
    ↓
Análise de gaps de conhecimento
    ↓
Rodada 2: Buscas específicas para preencher gaps
    ↓
Análise de novos gaps
    ↓
Rodada 3: Buscas adicionais
    ↓
...
    ↓
Critério de parada atingido
    ↓
Síntese final
```

### Número de Iterações

**[VARIÁVEL - Dependente da complexidade]**

- **Típico:** 2-4 rodadas
- **Máximo prático:** 5-8 rodadas (antes de retornos decrescentes)
- **Critério de parada:** Quando novas buscas não adicionam informações significativas

---

## 4.2. Loop Iterativo - Exemplo de Raciocínio

### Cenário Real: "Impacto da IA na educação brasileira"

**Rodada 1 - Busca ampla:**
```
Queries: ["IA educação Brasil", "inteligência artificial escolas Brasil"]

Resultados:
- Menção a políticas do MEC
- Referência a estudos sobre desigualdade digital
- Menção a custos de implementação

Gaps identificados:
- Quais políticas específicas?
- Dados quantitativos de adoção?
- Desafios específicos por região?
```

**Rodada 2 - Buscas específicas:**
```
Queries: [
  "MEC política IA educação 2025 2026",
  "escolas públicas Brasil tecnologia estatísticas",
  "desigualdade digital educação Brasil norte nordeste"
]

Resultados:
- Programa específico do governo
- Dados de conectividade escolar
- Estudos regionais

Novos gaps:
- Custo médio por aluno?
- Resultados de aprendizagem mensuráveis?
```

**Rodada 3 - Aprofundamento:**
```
Queries: [
  "custo implementação IA escolas públicas Brasil",
  "resultados aprendizagem tecnologia educação Brasil pesquisa"
]

Síntese: Informações suficientes para resposta abrangente
```

---

## 4.3. Critérios de Parada

### Mecanismos Anti-loop

**Critérios para encerrar pesquisa profunda:**

1. **Saturação de informação:**
   - Novas buscas retornam informações já conhecidas
   - Não há mais gaps significativos

2. **Limite de rodadas:**
   - Máximo de N rodadas (tipicamente 5-8)

3. **Cobertura suficiente:**
   - Todos os aspectos principais da pergunta foram cobertos

4. **Retorno decrescente:**
   - Custo de nova busca > valor da informação adicional

5. **Critério de qualidade:**
   - Informações coletadas atendem padrão mínimo de qualidade

---

## 4.4. Rastreamento de Contexto Acumulado

### Gerenciamento de Estado

**Estratégias para manter contexto:**

1. **Acumulação de resultados:**
   - Todos os resultados de rodadas anteriores permanecem no contexto
   - Novos resultados são adicionados

2. **Sumarização progressiva:**
   - Após cada rodada, sintetizar descobertas-chave
   - Manter síntese + resultados mais recentes

3. **Identificação de gaps:**
   - Rastrear explicitamente o que ainda é desconhecido
   - Atualizar lista de gaps após cada rodada

4. **Citação cruzada:**
   - Manter rastreamento de qual informação veio de qual rodada

---

## 4.5. Diferença Técnica: Rápida vs. Profunda

### Comparação Arquitetural

| Aspecto | Pesquisa Rápida | Pesquisa Profunda |
|---------|-----------------|-------------------|
| **Número de queries** | 1-3 | 5-15+ |
| **Rodadas** | 1 | 2-8 |
| **Planejamento** | Simples, direto | Estruturado, iterativo |
| **Análise de gaps** | Mínima ou nenhuma | Explícita e contínua |
| **Verificação cruzada** | Básica | Extensiva |
| **Cobertura** | Superficial | Abrangente |
| **Tempo** | Segundos | Minutos |
| **Tokens usados** | Baixo | Alto |

### Mudanças na Arquitetura

**Pesquisa rápida:**
- Query direta da pergunta do usuário
- Resultados imediatos
- Resposta direta

**Pesquisa profunda:**
- Decomposição da pergunta
- Planejamento de múltiplas queries
- Execução iterativa
- Análise de gaps entre rodadas
- Síntese final abrangente

---

# ▐ BLOCO 5 — ENGINEERING DE QUERIES

## 5.1. Transformação de Pergunta em Queries

### Técnicas de Query Engineering

**1. Query Expansion (Expansão):**
```
Pergunta: "Efeitos do aquecimento global"
Expansão: ["aquecimento global consequências", "mudanças climáticas impactos", "efeitos das mudanças climáticas"]
```

**2. Reformulação:**
```
Pergunta: "Por que o céu é azul?"
Reformulação: "explicação científica cor do céu azul Rayleigh scattering"
```

**3. Decomposição:**
```
Pergunta: "Como funciona uma célula?"
Decomposição:
- "estrutura célula biologia"
- "função mitocôndria núcleo"
- "processos celulares fotossíntese respiração"
```

**4. Adição de contexto temporal:**
```
Query: "educação Brasil"
Melhorada: "educação Brasil 2025 2026"
```

**5. Especificação de formato:**
```
Query: "dados populacionais Brasil"
Melhorada: "população Brasil estatísticas IBGE 2024"
```

---

## 5.2. Estratégias por Tipo de Pergunta

### Tipos de Pergunta e Estratégias

**Perguntas Factual (Quem, O quê, Quando):**
- Estratégia: Query direta + específica
- Exemplo: `"quando foi descoberto o Brasil data"`

**Perguntas Exploratórias (Como, Por que):**
- Estratégia: Múltiplas perspectivas
- Exemplo: `["causas primeira guerra mundial", "contexto histórico WWI", "eventos desencadeantes guerra"]`

**Perguntas Técnicas:**
- Estratégia: Terminologia técnica precisa
- Exemplo: `"backpropagation neural networks explained"` vs `"how neural networks learn"`

**Perguntas Temporais:**
- Estratégia: Datas explícitas
- Exemplo: `"notícias IA janeiro 2026"`

**Perguntas Comparativas:**
- Estratégia: Queries separadas + query comparativa
- Exemplo: `["Python vs JavaScript performance", "Python características", "JavaScript características"]`

---

## 5.3. Decisão do Número de Queries

### Fatores de Decisão

```
IF (pergunta simples E factual):
    → 1 query
ELSE IF (pergunta multifacetada):
    → 3-5 queries (uma por faceta)
ELSE IF (tópico controverso):
    → 4-6 queries (múltiplas perspectivas)
ELSE IF (pesquisa profunda):
    → 3-5 queries por rodada, múltiplas rodadas
```

**Exemplos:**
- "Capital do Brasil?" → 1 query
- "Impactos da tecnologia na educação?" → 3-5 queries
- "Análise completa da crise econômica de 2008?" → 10+ queries em múltiplas rodadas

---

## 5.4. Busca Semântica vs. Palavras-chave

### Combinação de Abordagens

**[ESPECULAÇÃO - Baseada em capacidades modernas de busca]**

**Mecanismos de busca modernos usam ambos:**

1. **Busca por palavras-chave (BM25/TF-IDF):**
   - Matching exato de termos
   - Funciona bem para termos técnicos específicos
   - Rápido e determinístico

2. **Busca semântica/vetorial:**
   - Matching de significado
   - Captura sinônimos e paráfrases
   - Melhor para perguntas em linguagem natural

**Como combino:**
- Gero queries que funcionam bem para ambos
- Incluo termos técnicos precisos (palavras-chave)
- Incluo contexto descritivo (semântica)

---

## 5.5. Memória de Queries Anteriores

### Contexto de Sessão

**[CONFIRMADO - Persistência de contexto]**

- Tenho acesso ao histórico da conversa atual
- Posso referenciar buscas anteriores
- Evito buscas redundantes quando detecto similaridade

**Exemplo de reutilização:**
```
Usuário (rodada 1): "Quais as notícias sobre educação?"
→ Busca realizada

Usuário (rodada 2): "E sobre tecnologia na educação?"
→ Reutilizo contexto anterior + busca específica adicional
```

---

# ▐ BLOCO 6 — CITAÇÕES E GROUNDING

## 6.1. Lógica de Citação

### Quando Citar

**Sempre cito quando:**
1. Informação veio de busca web
2. Dado específico (estatística, data, citação direta)
3. Afirmação factual não-óbvia
4. Usuário solicita fontes

**Formato de citação:**
```
Texto da resposta [^N^](URL)
```

Onde N é o índice do resultado de busca.

### Processo de Atribuição

```
Informação extraída de resultado de busca
    ↓
Mapear para índice do resultado
    ↓
Inserir citação no formato [^N^](URL)
    ↓
Verificar se citação corresponde à fonte correta
```

---

## 6.2. Garantia de Citação Correta

### Mecanismos de Verificação

**Processo interno:**
1. **Rastreamento de origem:** Mantenho registro mental de qual informação veio de qual fonte
2. **Verificação de consistência:** Garanto que a citação corresponde ao conteúdo citado
3. **Evitar mistura:** Não combino informações de fontes diferentes sem indicar

**Exemplo correto:**
```
Segundo o IBGE, a população do Brasil é de 203 milhões [^1^](https://ibge.gov.br).
```

**Exemplo incorreto (evitado):**
```
A população do Brasil é de 203 milhões e a taxa de desemprego é 8% [^1^].
```
(Se a taxa de desemprego veio de outra fonte, deveria ter citação separada)

---

## 6.3. Mecanismo de Fact-Checking

### Verificação de Fatos

**[ESPECULAÇÃO - Baseada em comportamento observado]**

**Não tenho fact-checking automatizado integrado**, mas aplico:

1. **Verificação cruzada:**
   - Comparar múltiplas fontes sobre o mesmo fato
   - Buscar consenso

2. **Avaliação de fonte:**
   - Priorizar fontes confiáveis
   - Desconfiar de fontes desconhecidas ou tendenciosas

3. **Detecção de anomalias:**
   - Valores estatísticos extremos
   - Datas inconsistentes
   - Afirmações contraditórias

4. **Explicitar incerteza:**
   - Quando não há consenso, mencionar divergência
   - Usar termos como "segundo X", "de acordo com Y"

---

## 6.4. Lida com Fontes Problemáticas

### Identificação de Problemas

**Sinais de alerta:**
- ❌ Site desconhecido sem reputação estabelecida
- ❌ Conteúdo sensacionalista ou clickbait
- ❌ Falta de autoria ou data
- ❌ Contradição com fontes confiáveis
- ❌ Erros factuais óbvios

**Ações:**
1. **Descartar:** Não usar informação
2. **Verificar:** Buscar confirmação em fonte confiável
3. **Contextualizar:** Se usar, mencionar limitações da fonte
4. **Buscar alternativa:** Encontrar fonte mais confiável

---

# ▐ BLOCO 7 — APLICAÇÃO EDUCACIONAL (PONTO.SCHOOL)

## 7.1. Recomendações Técnicas e Pedagógicas

### Arquitetura Recomendada para Professores EF/EM

**1. Interface de Busca Educacional:**
```
- Busca natural em português
- Filtros por: ano escolar, disciplina, tipo de recurso
- Sugestões de queries educacionais comuns
```

**2. Fontes Prioritárias:**
- BNCC (Base Nacional Comum Curricular)
- MEC/INEP (dados oficiais)
- Revistas educacionais brasileiras (Nova Escola, etc.)
- Repositórios de recursos educacionais abertos

**3. Curadoria de Conteúdo:**
- Classificação por adequação pedagógica
- Tags: ano escolar, habilidade BNCC, tempo de aula
- Avaliações de outros professores

**4. Formato de Resultados:**
- Plano de aula estruturado
- Objetivos de aprendizagem
- Materiais necessários
- Avaliação sugerida
- Adaptações para diferentes contextos

---

## 7.2. Fontes Valiosas para Professores Brasileiros

### Prioridade Alta

1. **gov.br/mec** - Documentos oficiais, políticas educacionais
2. **novaescola.org.br** - Recursos pedagógicos, planos de aula
3. **inep.gov.br** - Dados educacionais, avaliações
4. **bncc.gov.br** - Base Nacional Comum Curricular
5. **portal.fioce.org.br** - Formação de professores

### Prioridade Média

6. **todos pela educação** - Pesquisas e relatórios
7. **Unesco Brasil** - Recursos internacionais adaptados
8. **Repositórios universitários** - Teses e dissertações sobre educação
9. **YouTube Educação** - Vídeos educacionais em português
10. **Scielo** - Artigos científicos em educação

---

## 7.3. Casos de Uso Poderosos (Não-Óbvios)

### Aplicações Avançadas

**1. Diferenciação de Ensino:**
```
Busca: "atividades matemática 6º ano frações nível básico intermediário avançado"
→ Gerar três versões da mesma atividade
```

**2. Interdisciplinaridade:**
```
Busca: "conexão história e ciências renascimento científico"
→ Encontrar pontos de integração entre disciplinas
```

**3. Avaliação Formativa:**
```
Busca: "rubrica avaliação projeto interdisciplinar ensino médio"
→ Instrumentos de avaliação prontos
```

**4. Educação Inclusiva:**
```
Busca: "adaptação surdo matemática libras recursos"
→ Estratégias de acessibilidade
```

**5. Gamificação:**
```
Busca: "jogos educativos história Brasil colônia"
→ Recursos lúdicos para aula
```

---

## 7.4. Busca Boa vs. Excelente

### Comparativo

| Aspecto | Busca "Boa" | Busca "Excelente" |
|---------|-------------|-------------------|
| **Query** | "planos de aula história" | "plano aula história 8º ano escravidão Brasil BNCC habilidade" |
| **Resultados** | Lista genérica de recursos | Recursos curados, alinhados à BNCC, com adaptações |
| **Formato** | Links para sites | Plano estruturado com objetivos, atividades, avaliação |
| **Contexto** | Ignora contexto do professor | Considera ano escolar, região, realidade escolar |
| **Adaptação** | Um tamanho serve todos | Diferenciação por nível de proficiência |
| **Acompanhamento** | Recursos isolados | Sequência didática completa |

### Exemplo de Busca Excelente

**Entrada:**  
"Preciso de recursos sobre fotossíntese para 7º ano em escola rural do Nordeste"

**Query otimizada:**
```
["fotossíntese 7º ano ciências BNCC atividades práticas",
 "fotossíntese experimento material simples escola rural",
 "fotossíntese contexto nordeste semiárido educação"]
```

**Resultado ideal:**
- Atividades que usam materiais disponíveis no contexto rural
- Conexão com culturas locais (agricultura, cactos, caatinga)
- Adaptações para possíveis limitações de infraestrutura
- Alinhamento às habilidades da BNCC

---

## 7.5. Arquitetura Ideal de Busca Educacional

### Especificação Técnica Completa

#### 1. Camada de Ingestão de Dados

**Fontes:**
```yaml
Fontes_Oficiais:
  - gov.br/mec (scraping + API se disponível)
  - inep.gov.br (microdados)
  - bncc.gov.br (API ou dump)

Fontes_Educacionais:
  - novaescola.org.br (parceria ou scraping ético)
  - Repositorios_OA: domínio público, OER Commons
  - YouTube Educação (API)

Fontes_Acadêmicas:
  - Google Scholar (API)
  - Scielo (API ou scraping)
  - Repositórios institucionais
```

**Pipeline de Ingestão:**
```
Fonte → Crawler/Extractor → Normalização → Enriquecimento → Indexação
```

#### 2. Camada de Processamento

**Tecnologias:**
- **NLP:** spaCy (português), Hugging Face Transformers
- **Embeddings:** sentence-transformers (modelo multilíngue)
- **Classificação:** Modelos fine-tuned para educação
- **Extração de entidades:** NER para termos educacionais

**Enriquecimento de Metadados:**
```json
{
  "titulo": "...",
  "conteudo": "...",
  "metadados_enriquecidos": {
    "ano_escolar": ["6º ano", "7º ano"],
    "disciplina": ["Ciências", "Biologia"],
    "habilidades_bncc": ["EF06CI03", "EF07CI05"],
    "tipo_recurso": "experimento",
    "tempo_aula": "2 aulas (90min)",
    "dificuldade": "intermediário",
    "recursos_necessarios": ["material simples"],
    "contexto": ["urbano", "rural"],
    "tags": ["fotossíntese", "plantas", "experimento"]
  }
}
```

#### 3. Camada de Busca

**Arquitetura de Busca Híbrida:**
```
Query do usuário
    ↓
Processamento NLP (intenção, entidades)
    ↓
Expansão de query (sinônimos educacionais)
    ↓
Busca vetorial (similaridade semântica)
    ↓
Busca por palavras-chave (BM25)
    ↓
Fusão de resultados (RRF - Reciprocal Rank Fusion)
    ↓
Re-ranking por relevância educacional
    ↓
Resultados formatados
```

**Tecnologias de Busca:**
- **Vetorial:** Pinecone, Weaviate, ou Elasticsearch com dense_vector
- **Texto:** Elasticsearch, OpenSearch
- **Fusão:** RRF (Reciprocal Rank Fusion)

#### 4. Camada de Formatação de Resultados

**Templates de Resposta:**

**Template: Plano de Aula**
```markdown
# [Título do Plano]

## Informações Gerais
- **Ano escolar:** [Xº ano]
- **Disciplina:** [Disciplina]
- **Habilidades BNCC:** [Códigos]
- **Tempo estimado:** [X aulas]

## Objetivos
- [Objetivo 1]
- [Objetivo 2]

## Recursos Necessários
- [Recurso 1]
- [Recurso 2]

## Desenvolvimento
### Introdução (15min)
[Descrição]

### Atividade Principal (45min)
[Descrição detalhada]

### Fechamento (15min)
[Descrição]

## Avaliação
[Critérios e instrumento]

## Adaptações
- **Para alunos com dificuldade:** [Adaptação]
- **Para alunos avançados:** [Adaptação]

## Fonte
[^1^](URL)
```

#### 5. Camada de Personalização

**Perfil do Professor:**
- Ano escolar que leciona
- Disciplinas
- Contexto escolar (urbano/rural, público/privado)
- Preferências de tipo de recurso

**Histórico de Busca:**
- Evitar repetição
- Sugerir continuidade (próximos tópicos)
- Aprender preferências

#### 6. APIs e Integrações

```yaml
APIs_Externas:
  Google_Scholar:
    uso: literatura acadêmica
    formato: API oficial ou scraping

  YouTube_Data_API:
    uso: vídeos educacionais
    formato: JSON via REST

  INEP:
    uso: dados estatísticos
    formato: Microdados para download

  MEC:
    uso: documentos oficiais
    formato: Scraping ou API se disponível
```

#### 7. Pipeline de Atualização

```
Agendador (diário/semanal)
    ↓
Crawlers de fontes
    ↓
Detecção de novos conteúdos
    ↓
Processamento e enriquecimento
    ↓
Atualização do índice
    ↓
Notificação de novos recursos (opcional)
```

#### 8. Métricas de Qualidade

**KPIs do Sistema:**
- Taxa de clique nos resultados
- Tempo médio de permanência no recurso
- Avaliações de professores
- Taxa de re-busca (insatisfação)
- Cobertura de habilidades BNCC

---

## Considerações Finais

### Limitações Conhecidas do Meu Sistema Atual

1. **Não tenho índice próprio** - dependo de mecanismos de busca externos
2. **Latência** - buscas em tempo real adicionam delay
3. **Custo** - múltiplas buscas consomem tokens/tempo
4. **Consistência** - resultados podem variar entre execuções
5. **Limite de contexto** - não posso processar quantidade ilimitada de resultados

### Recomendações para Implementação

Para construir um sistema de busca educacional robusto para a Ponto.School:

1. **Invista em curadoria humana** - algoritmos + especialistas educacionais
2. **Construa índice próprio** - controle total sobre fontes e atualização
3. **Desenvolva ontologia educacional** - mapeamento de conceitos, pré-requisitos, sequências
4. **Coleta feedback de professores** - sistema de avaliação e melhoria contínua
5. **Priorize fontes brasileiras** - contexto local é crucial para relevância

---

**Documento gerado em:** 2026-02-22  
**Autor:** Assistente IA (Auto-análise)  
**Propósito:** Documentação técnica para desenvolvimento de sistema educacional
