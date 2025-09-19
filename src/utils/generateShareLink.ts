
/**
 * Gera um link único para compartilhamento público de atividade
 */
export function gerarLinkCompartilhamento(activityId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/atividade/${activityId}`;
}

/**
 * Copia o link de compartilhamento para a área de transferência
 */
export async function copiarLinkCompartilhamento(activityId: string): Promise<boolean> {
  try {
    const link = gerarLinkCompartilhamento(activityId);
    await navigator.clipboard.writeText(link);
    return true;
  } catch (error) {
    console.error('Erro ao copiar link:', error);
    return false;
  }
}

/**
 * Abre o modal de compartilhamento nativo do navegador (se disponível)
 */
export async function compartilharAtividade(
  activityId: string, 
  title: string, 
  description?: string
): Promise<boolean> {
  try {
    const link = gerarLinkCompartilhamento(activityId);
    
    if (navigator.share) {
      await navigator.share({
        title: title,
        text: description || 'Confira esta atividade educacional',
        url: link
      });
      return true;
    } else {
      // Fallback: copiar para área de transferência
      return await copiarLinkCompartilhamento(activityId);
    }
  } catch (error) {
    console.error('Erro ao compartilhar:', error);
    return false;
  }
}

/**
 * Valida se um ID de atividade é válido
 */
export function validarIdAtividade(id: string): boolean {
  return id && id.length > 0 && /^[a-zA-Z0-9_-]+$/.test(id);
}
