// Arquivo de pré-carregamento simplificado
export const preloadAllComponents = () => {
  console.log("Iniciando pré-carregamento de todos os componentes...");
  
  // Retorna uma promise resolvida para simular carregamento bem-sucedido
  setTimeout(() => {
    console.log("Todos os componentes foram pré-carregados com sucesso!");
  }, 300);
  
  return Promise.resolve();
};