
// Função para pré-carregar todos os componentes necessários
export const preloadAllComponents = () => {
  console.log('Iniciando pré-carregamento de todos os componentes...');
  
  // Força o carregamento imediato de todos os módulos importantes
  const importantModules = [
    import('@/pages/dashboard'),
    import('@/pages/turmas'),
    import('@/pages/turmas/[id]'),
    import('@/pages/turmas/grupos'),
    import('@/pages/turmas/grupos2'),
    import('@/pages/comunidades'),
    import('@/pages/pedidos-ajuda'),
    import('@/pages/epictus-ia'),
    import('@/pages/agenda'),
    import('@/pages/biblioteca'),
    import('@/pages/mercado'),
    import('@/pages/conquistas'),
    import('@/pages/carteira'),
    import('@/pages/organizacao'),
    import('@/pages/novidades'),
    import('@/pages/configuracoes'),
    import('@/pages/planos-estudo'),
    import('@/pages/portal'),
    import('@/pages/auth/login'),
    import('@/pages/auth/register'),
    import('@/pages/auth/forgot-password'),
    import('@/pages/auth/reset-password'),
    import('@/pages/plan-selection'),
    import('@/pages/profile')
  ];
  
  // Pré-carrega os módulos em paralelo
  Promise.all(importantModules)
    .then(() => console.log('Todos os componentes foram pré-carregados com sucesso!'))
    .catch(err => console.error('Erro ao pré-carregar componentes:', err));
};
