
/**
 * Utilitário para upload de imagens de grupos no Supabase Storage
 * Corrige problemas de salvamento de banner e foto do grupo
 */

// Função para validar arquivos de imagem
export const validateImageFile = (file, type = 'banner') => {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!file) {
    return { valid: false, error: `Nenhum arquivo selecionado para ${type}.` };
  }
  
  if (!validTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Formato inválido para ${type}. Use PNG, JPG ou JPEG.` 
    };
  }
  
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `${type} muito grande. Máximo permitido: 5MB.` 
    };
  }
  
  return { valid: true, error: null };
};

// Função para fazer upload de imagem com retries
export const uploadImageWithRetry = async (bucketName, fileName, file, retries = 3, delay = 2000) => {
  console.log(`Iniciando upload de ${fileName} para bucket ${bucketName}...`);
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Tentativa ${attempt} de upload para ${bucketName}/${fileName}`);
      
      // Fazer upload do arquivo
      const { data, error } = await window.supabase.storage
        .from(bucketName)
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        });
      
      if (error) {
        console.error(`Erro no upload (tentativa ${attempt}):`, error);
        throw error;
      }
      
      console.log(`Upload bem-sucedido na tentativa ${attempt}:`, data);
      
      // Obter URL pública
      const { data: urlData } = window.supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
      
      if (!urlData?.publicUrl) {
        throw new Error('Falha ao obter URL pública da imagem');
      }
      
      console.log(`URL pública obtida: ${urlData.publicUrl}`);
      return {
        success: true,
        url: urlData.publicUrl,
        path: fileName
      };
      
    } catch (error) {
      console.warn(`Tentativa ${attempt} falhou para ${fileName}:`, error.message);
      
      if (attempt === retries) {
        console.error(`Falha definitiva no upload de ${fileName} após ${retries} tentativas`);
        throw error;
      }
      
      // Aguardar antes da próxima tentativa
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Função para buscar URL de imagem existente
export const getImageUrl = async (bucketName, fileName, retries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Buscando URL para ${bucketName}/${fileName} (tentativa ${attempt})`);
      
      // Verificar se o arquivo existe
      const { data: fileList, error: listError } = await window.supabase.storage
        .from(bucketName)
        .list('', {
          search: fileName
        });
      
      if (listError) {
        console.warn(`Erro ao listar arquivos (tentativa ${attempt}):`, listError);
        throw listError;
      }
      
      const fileExists = fileList && fileList.some(file => file.name === fileName);
      
      if (!fileExists) {
        console.log(`Arquivo ${fileName} não encontrado no bucket ${bucketName}`);
        return null;
      }
      
      // Obter URL pública
      const { data: urlData } = window.supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
      
      if (!urlData?.publicUrl) {
        throw new Error('Falha ao obter URL pública');
      }
      
      console.log(`URL encontrada: ${urlData.publicUrl}`);
      return urlData.publicUrl;
      
    } catch (error) {
      console.warn(`Tentativa ${attempt} de buscar URL falhou:`, error.message);
      
      if (attempt === retries) {
        console.error(`Falha definitiva ao buscar URL após ${retries} tentativas`);
        return null;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Função principal para salvar imagens do grupo
export const saveGroupImages = async (groupId, retries = 3, delay = 2000) => {
  try {
    console.log(`Iniciando salvamento de imagens para grupo ${groupId}...`);
    
    if (!groupId || typeof groupId !== 'string') {
      throw new Error('ID do grupo inválido');
    }
    
    const bannerInput = document.querySelector('#group-banner-upload');
    const photoInput = document.querySelector('#group-photo-upload');
    
    if (!bannerInput || !photoInput) {
      throw new Error('Campos de upload não encontrados no DOM');
    }
    
    const bannerFile = bannerInput.files?.[0];
    const photoFile = photoInput.files?.[0];
    
    if (!bannerFile && !photoFile) {
      alert('Selecione pelo menos uma imagem para salvar.');
      return;
    }
    
    const results = {
      banner: null,
      photo: null,
      errors: []
    };
    
    // Validar e fazer upload do banner
    if (bannerFile) {
      console.log('Processando banner...');
      const bannerValidation = validateImageFile(bannerFile, 'banner');
      
      if (!bannerValidation.valid) {
        results.errors.push(bannerValidation.error);
        console.error('Validação do banner falhou:', bannerValidation.error);
      } else {
        try {
          const bannerResult = await uploadImageWithRetry(
            'group-banners',
            `${groupId}-banner`,
            bannerFile,
            retries,
            delay
          );
          
          results.banner = bannerResult;
          console.log('Banner salvo com sucesso:', bannerResult);
          
          // Atualizar imagem na interface
          const bannerImg = document.getElementById('group-banner');
          if (bannerImg) {
            bannerImg.src = bannerResult.url;
            console.log('Banner atualizado na interface');
          }
          
        } catch (error) {
          const errorMsg = `Erro ao salvar banner: ${error.message}`;
          results.errors.push(errorMsg);
          console.error(errorMsg, error);
        }
      }
    }
    
    // Validar e fazer upload da foto
    if (photoFile) {
      console.log('Processando foto...');
      const photoValidation = validateImageFile(photoFile, 'foto');
      
      if (!photoValidation.valid) {
        results.errors.push(photoValidation.error);
        console.error('Validação da foto falhou:', photoValidation.error);
      } else {
        try {
          const photoResult = await uploadImageWithRetry(
            'group-photos',
            `${groupId}-photo`,
            photoFile,
            retries,
            delay
          );
          
          results.photo = photoResult;
          console.log('Foto salva com sucesso:', photoResult);
          
          // Atualizar imagem na interface
          const photoImg = document.getElementById('group-photo');
          if (photoImg) {
            photoImg.src = photoResult.url;
            console.log('Foto atualizada na interface');
          }
          
        } catch (error) {
          const errorMsg = `Erro ao salvar foto: ${error.message}`;
          results.errors.push(errorMsg);
          console.error(errorMsg, error);
        }
      }
    }
    
    // Mostrar resultado final
    if (results.errors.length > 0) {
      const errorMessage = results.errors.join('\n');
      console.error('Erros durante o salvamento:', errorMessage);
      alert(`Alguns erros ocorreram:\n${errorMessage}`);
    }
    
    const successCount = (results.banner ? 1 : 0) + (results.photo ? 1 : 0);
    if (successCount > 0) {
      console.log(`${successCount} imagem(ns) salva(s) com sucesso para o grupo ${groupId}`);
      alert(`${successCount} imagem(ns) salva(s) com sucesso!`);
      
      // Limpar campos de input
      bannerInput.value = '';
      photoInput.value = '';
    }
    
    return results;
    
  } catch (error) {
    const errorMsg = `Erro geral ao salvar imagens do grupo ${groupId}: ${error.message}`;
    console.error(errorMsg, error);
    alert(errorMsg);
    throw error;
  }
};

// Função para carregar imagens existentes do grupo
export const loadGroupImages = async (groupId, retries = 3, delay = 1000) => {
  try {
    console.log(`Carregando imagens existentes do grupo ${groupId}...`);
    
    if (!groupId || typeof groupId !== 'string') {
      throw new Error('ID do grupo inválido');
    }
    
    const [bannerUrl, photoUrl] = await Promise.all([
      getImageUrl('group-banners', `${groupId}-banner`, retries, delay),
      getImageUrl('group-photos', `${groupId}-photo`, retries, delay)
    ]);
    
    // Atualizar imagens na interface
    const bannerImg = document.getElementById('group-banner');
    if (bannerImg) {
      bannerImg.src = bannerUrl || '/default-banner.png';
      console.log(`Banner carregado: ${bannerUrl || 'padrão'}`);
    }
    
    const photoImg = document.getElementById('group-photo');
    if (photoImg) {
      photoImg.src = photoUrl || '/default-photo.png';
      console.log(`Foto carregada: ${photoUrl || 'padrão'}`);
    }
    
    return {
      bannerUrl,
      photoUrl
    };
    
  } catch (error) {
    console.error(`Erro ao carregar imagens do grupo ${groupId}:`, error.message);
    return {
      bannerUrl: null,
      photoUrl: null
    };
  }
};
