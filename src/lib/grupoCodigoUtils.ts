
/**
 * Utilitários para gerenciar códigos dos grupos de estudo
 * Este arquivo centraliza operações comuns relacionadas aos códigos dos grupos
 */

/**
 * Obtém um código de grupo existente de várias fontes
 * @param grupoId - ID do grupo para buscar o código
 * @returns O código encontrado ou null se não existir
 */
export const obterCodigoGrupoExistente = (grupoId: string): string | null => {
  if (!grupoId) return null;
  
  try {
    // 1. Verificar primeiro no armazenamento dedicado para códigos (principal)
    const CODIGOS_STORAGE_KEY = 'epictus_codigos_grupo';
    const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');
    
    if (codigosGrupos[grupoId]) {
      console.log(`Código recuperado do storage dedicado: ${codigosGrupos[grupoId]}`);
      return codigosGrupos[grupoId];
    }
    
    // 2. Verificar no localStorage de grupos
    const GRUPOS_STORAGE_KEY = 'epictus_grupos_estudo';
    const grupos = JSON.parse(localStorage.getItem(GRUPOS_STORAGE_KEY) || '[]');
    const grupo = grupos.find((g: any) => g.id === grupoId);
    
    if (grupo?.codigo) {
      console.log(`Código recuperado do localStorage: ${grupo.codigo}`);
      
      // Aproveitar para salvar no storage dedicado
      codigosGrupos[grupoId] = grupo.codigo;
      localStorage.setItem(CODIGOS_STORAGE_KEY, JSON.stringify(codigosGrupos));
      
      return grupo.codigo;
    }
    
    // 3. Verificar na sessionStorage (mecanismo de recuperação)
    const sessionCodigo = sessionStorage.getItem(`grupo_codigo_${grupoId}`);
    if (sessionCodigo) {
      console.log(`Código recuperado da sessionStorage: ${sessionCodigo}`);
      return sessionCodigo;
    }
  } catch (error) {
    console.error('Erro ao buscar código de grupo:', error);
  }
  
  return null;
};

/**
 * Salva um código de grupo em múltiplas camadas de armazenamento
 * @param grupoId - ID do grupo
 * @param codigo - Código a ser salvo
 */
export const salvarCodigoGrupo = (grupoId: string, codigo: string): void => {
  if (!grupoId || !codigo) return;
  
  try {
    // Salvar no armazenamento dedicado para códigos
    const CODIGOS_STORAGE_KEY = 'epictus_codigos_grupo';
    const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');
    codigosGrupos[grupoId] = codigo.toUpperCase();
    localStorage.setItem(CODIGOS_STORAGE_KEY, JSON.stringify(codigosGrupos));
    
    // Salvar no localStorage de grupos
    const GRUPOS_STORAGE_KEY = 'epictus_grupos_estudo';
    const grupos = JSON.parse(localStorage.getItem(GRUPOS_STORAGE_KEY) || '[]');
    const grupoIndex = grupos.findIndex((g: any) => g.id === grupoId);
    
    if (grupoIndex >= 0) {
      grupos[grupoIndex].codigo = codigo.toUpperCase();
      localStorage.setItem(GRUPOS_STORAGE_KEY, JSON.stringify(grupos));
    }
    
    // Salvar na sessionStorage para recuperação rápida
    sessionStorage.setItem(`grupo_codigo_${grupoId}`, codigo.toUpperCase());
    
    console.log(`Código ${codigo} salvo com sucesso para o grupo ${grupoId}`);
  } catch (error) {
    console.error('Erro ao salvar código de grupo:', error);
  }
};

/**
 * Verifica se um código existe em qualquer grupo
 * @param codigo - Código a ser verificado
 * @returns true se o código existir em algum grupo
 */
export const verificarCodigoExiste = (codigo: string): boolean => {
  if (!codigo) return false;
  
  try {
    // Normalizar o código para comparação
    const codigoNormalizado = codigo.trim().toUpperCase();
    
    // Verificar no armazenamento dedicado
    const CODIGOS_STORAGE_KEY = 'epictus_codigos_grupo';
    const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');
    
    // Verificar se o código existe como valor em qualquer entrada
    if (Object.values(codigosGrupos).some((c: any) => 
      c.toUpperCase() === codigoNormalizado)) {
      return true;
    }
    
    // Verificar também no localStorage de grupos
    const GRUPOS_STORAGE_KEY = 'epictus_grupos_estudo';
    const grupos = JSON.parse(localStorage.getItem(GRUPOS_STORAGE_KEY) || '[]');
    
    return grupos.some((g: any) => 
      g.codigo && g.codigo.toUpperCase() === codigoNormalizado);
  } catch (error) {
    console.error('Erro ao verificar existência de código:', error);
    return false;
  }
};
