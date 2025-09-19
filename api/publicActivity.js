
import express from 'express';
import cors from 'cors';

const router = express.Router();

// Middleware para permitir CORS
router.use(cors());

// Rota para buscar atividade pública por ID e código único
router.get('/:id/:code?', async (req, res) => {
  try {
    const { id, code } = req.params;
    
    console.log('🔍 API: Buscando atividade pública:', { id, code });
    
    // Simular busca de atividade com dados mock mais completos
    const mockActivity = {
      id: id,
      uniqueCode: code || generateMockCode(),
      title: `Atividade: ${id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ')}`,
      description: 'Esta é uma atividade educacional compartilhada publicamente através de um link único.',
      subject: 'Educação Geral',
      activityType: id,
      content: generateMockContent(id),
      createdAt: new Date().toISOString(),
      isPublic: true
    };

    console.log('✅ API: Atividade encontrada:', mockActivity);
    
    res.json({
      success: true,
      data: mockActivity
    });

  } catch (error) {
    console.error('❌ Erro ao buscar atividade pública:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Função para gerar código mock
function generateMockCode() {
  return Math.random().toString(36).substring(2, 10);
}

// Função para gerar conteúdo mock baseado no tipo de atividade
function generateMockContent(activityType) {
  const contentMap = {
    'sequencia-didatica': `
**Sequência Didática Educacional**

**Objetivo:** Desenvolver competências específicas através de atividades estruturadas.

**Atividades:**
1. Introdução ao tema com debate inicial
2. Atividade prática em grupos
3. Apresentação dos resultados
4. Avaliação e feedback

**Recursos necessários:**
- Material didático
- Quadro interativo
- Tempo estimado: 50 minutos
    `,
    'flash-cards': `
**Flash Cards Educacionais**

**Conjunto de cartões para memorização:**

**Cartão 1**
Frente: Qual é a fórmula da área do triângulo?
Verso: A = (base × altura) ÷ 2

**Cartão 2**  
Frente: O que é um substantivo próprio?
Verso: Nome específico de pessoas, lugares ou instituições

**Cartão 3**
Frente: Qual é a capital do Brasil?
Verso: Brasília
    `,
    'quiz-interativo': `
**Quiz Interativo**

**Questão 1:** Qual é a capital da França?
a) Londres  b) Paris  c) Roma  d) Madrid
*Resposta correta: b) Paris*

**Questão 2:** Quanto é 7 x 8?
a) 54  b) 56  c) 58  d) 60
*Resposta correta: b) 56*

**Questão 3:** Qual é o maior planeta do sistema solar?
a) Terra  b) Marte  c) Júpiter  d) Saturno
*Resposta correta: c) Júpiter*
    `
  };

  return contentMap[activityType] || `
**Atividade Educacional**

Esta é uma atividade do tipo: ${activityType}

**Conteúdo:**
- Atividade interativa e educacional
- Desenvolvida para aprendizado eficaz  
- Compartilhamento público através de link único

**Instruções:**
1. Leia atentamente o conteúdo
2. Execute as atividades propostas
3. Aplique os conhecimentos adquiridos
  `;
}

export default router;
