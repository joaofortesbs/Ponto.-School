
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Middleware para permitir CORS
router.use(cors());

// Rota para buscar atividade pública por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar dados da atividade no localStorage (simulando banco de dados)
    // Em produção, isso seria uma consulta real ao banco
    const activityData = getActivityById(id);
    
    if (!activityData) {
      return res.status(404).json({
        success: false,
        message: 'Atividade não encontrada'
      });
    }

    // Filtrar apenas dados públicos (sem informações privadas do usuário)
    const publicData = {
      id: activityData.id,
      title: activityData.title || activityData.personalizedTitle || 'Atividade',
      description: activityData.description,
      subject: activityData.subject || 'Geral',
      activityType: activityData.type || activityData.categoryId,
      content: activityData.content,
      createdAt: activityData.createdAt || new Date().toISOString(),
      // Remover dados privados do usuário
      isPublic: true
    };

    res.json({
      success: true,
      data: publicData
    });

  } catch (error) {
    console.error('Erro ao buscar atividade pública:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Função helper para buscar atividade por ID
function getActivityById(id) {
  try {
    // Buscar dados reais do localStorage (simulando persistência)
    // Em produção, isso seria uma consulta ao Supabase
    
    // Tentar buscar no localStorage primeiro
    const storedActivity = getFromLocalStorage(`activity_${id}`);
    if (storedActivity) {
      return storedActivity;
    }
    
    // Fallback: dados de exemplo
    const mockActivities = {
      [id]: {
        id: id,
        title: 'Lista de Exercícios - Matemática',
        description: 'Exercícios sobre funções do primeiro grau',
        subject: 'Matemática',
        type: 'lista-exercicios',
        content: `
1. Determine o valor da função f(x) = 2x + 3 para x = 5.

2. Encontre a raiz da função f(x) = 3x - 9.

3. Represente graficamente a função f(x) = x + 2.

4. Uma função do primeiro grau passa pelos pontos (0, 4) e (2, 8). Determine sua equação.

5. Calcule o valor de f(2) + f(-1) para a função f(x) = -x + 5.
        `,
        createdAt: new Date().toISOString()
      }
    };
    
    return mockActivities[id] || null;
  } catch (error) {
    console.error('Erro ao buscar atividade:', error);
    return null;
  }
}

// Helper para buscar dados do localStorage
function getFromLocalStorage(key) {
  try {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }
    return null;
  } catch (error) {
    console.error('Erro ao acessar localStorage:', error);
    return null;
  }
}

module.exports = router;
