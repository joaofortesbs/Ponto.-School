/**
 * Função accessGroup corrigida com salvamento de imagens funcionando
 */

import { validateUserAuth } from '@/lib/auth';

// Função principal accessGroup corrigida
export const accessGroup = async (groupId) => {
  try {
    console.log(`Acessando grupo ${groupId}...`);
    
    // Validar autenticação
    const userId = await validateUserAuth();
    if (!userId) {
      console.error('Usuário não autenticado.');
      alert('Usuário não autenticado.');
      return;
    }

    // Validar e armazenar o groupId
    if (!groupId || typeof groupId !== 'string') {
      console.error('ID do grupo inválido:', groupId);
      alert('ID do grupo inválido. Verifique o console.');
      return;
    }
    
    // Definir globalmente para uso em outras funções
    window.currentGroupId = groupId;

    // Ocultar o cabeçalho de Minhas Turmas
    const header = document.querySelector('.groups-header');
    if (header) header.style.display = 'none';

    // Cache para nomes e imagens de perfil
    const userCache = new Map();
    
    // Buscar usuários do grupo com nome correto da tabela
    const { data: members, error: membersError } = await window.supabase
      .from('membros_grupos')
      .select('user_id')
      .eq('grupo_id', groupId);
      
    if (membersError) {
      console.error('Erro ao buscar membros:', membersError);
      throw membersError;
    }

    if (!members || members.length === 0) {
      throw new Error('Nenhum membro encontrado no grupo.');
    }

    // Popular cache de usuários usando profiles em vez de auth.users
    const { data: profiles, error: profilesError } = await window.supabase
      .from('profiles')
      .select('id, full_name, display_name, avatar_url')
      .in('id', members.map(m => m.user_id));
      
    if (profilesError) {
      console.warn('Erro ao buscar perfis, usando dados padrão:', profilesError);
    }

    if (profiles) {
      profiles.forEach(profile => {
        userCache.set(profile.id, {
          name: profile.display_name || profile.full_name || `Usuário ${profile.id.slice(0, 5)}`,
          avatar_url: profile.avatar_url || null
        });
      });
    }
    
    console.log(`Cache de usuários populado com ${userCache.size} entradas.`);

    // Buscar dados do grupo com nome correto da tabela
    const fetchGroupData = async (groupId, retries = 3, delay = 2000) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const { data: groupData, error: groupError } = await window.supabase
            .from('grupos_estudo')
            .select('nome, descricao, disciplina_area, topico_especifico, codigo_unico, tags, is_public, is_private')
            .eq('id', groupId)
            .single();
            
          if (groupError) throw groupError;
          if (!groupData) throw new Error(`Dados do grupo ${groupId} não encontrados.`);
          return groupData;
        } catch (error) {
          console.warn(`Tentativa ${attempt} de buscar dados do grupo ${groupId} falhou:`, error.message);
          if (attempt === retries) throw error;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    };
    
    const groupData = await fetchGroupData(groupId);
    console.log('Dados do grupo carregados:', groupData);

    // Importar e usar funções de upload de imagem
    const { loadGroupImages, saveGroupImages } = await import('./GroupImageUpload.js');

    // Contagem de membros online
    let onlineCount = 0;
    const updateOnlineCount = async () => {
      try {
        const now = new Date();
        const thirtySecondsAgo = new Date(now - 30 * 1000).toISOString();
        
        const { count, error } = await window.supabase
          .from('user_sessions')
          .select('user_id', { count: 'exact' })
          .eq('grupo_id', groupId)
          .gte('last_active', thirtySecondsAgo);
          
        if (error) throw error;
        
        onlineCount = count || 0;
        return onlineCount;
      } catch (err) {
        console.error('Erro ao atualizar contagem de online:', err.message);
        return 0;
      }
    };

    // Configurar interface do grupo
    const groupInterface = document.querySelector('#group-interface') || document.createElement('div');
    if (!groupInterface.id) {
      groupInterface.id = 'group-interface';
      groupInterface.style.cssText = 'margin-left: 250px; padding: 20px;';
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.innerHTML = '';
        mainContent.appendChild(groupInterface);
      }
    }

    // Carregar imagens existentes do grupo
    await loadGroupImages(groupId);

    // Função para preencher e habilitar edição dos campos
    const fillAndEnableEditing = (groupData) => {
      try {
        const nameInput = document.querySelector('#group-name');
        const descriptionInput = document.querySelector('#group-description');
        const disciplineInput = document.querySelector('#group-discipline');
        const topicInput = document.querySelector('#group-topic');
        const tagsInput = document.querySelector('#group-tags');
        const privacySelect = document.querySelector('#group-privacy');

        if (!nameInput || !descriptionInput || !disciplineInput || !topicInput || !tagsInput || !privacySelect) {
          console.error(`Campos da mini-seção "Ajustes" não encontrados para o grupo ${groupId}. Verifique os seletores.`);
          return;
        }

        // Habilitar edição
        nameInput.removeAttribute('readonly');
        descriptionInput.removeAttribute('readonly');
        disciplineInput.removeAttribute('readonly');
        topicInput.removeAttribute('readonly');
        tagsInput.removeAttribute('readonly');
        privacySelect.removeAttribute('disabled');

        // Preencher valores
        nameInput.value = groupData.nome || '';
        descriptionInput.value = groupData.descricao || '';
        disciplineInput.value = groupData.disciplina_area || '';
        topicInput.value = groupData.topico_especifico || '';
        tagsInput.value = Array.isArray(groupData.tags) ? groupData.tags.join(', ') : (groupData.tags || '');
        privacySelect.value = groupData.is_private ? 'private' : (groupData.is_public ? 'public' : 'private');

        console.log(`Campos da mini-seção "Ajustes" habilitados para edição para o grupo ${groupId}.`);
      } catch (error) {
        console.error(`Erro ao habilitar edição dos campos para o grupo ${groupId}:`, error.message);
        alert('Erro ao carregar os dados dos ajustes. Verifique o console.');
      }
    };

    // Função para salvar alterações no Supabase
    const saveChanges = async (groupId) => {
      try {
        const nameInput = document.querySelector('#group-name');
        const descriptionInput = document.querySelector('#group-description');
        const disciplineInput = document.querySelector('#group-discipline');
        const topicInput = document.querySelector('#group-topic');
        const tagsInput = document.querySelector('#group-tags');
        const privacySelect = document.querySelector('#group-privacy');

        if (!nameInput || !descriptionInput || !disciplineInput || !topicInput || !tagsInput || !privacySelect) {
          console.error(`Campos da mini-seção "Ajustes" não encontrados para salvar alterações no grupo ${groupId}.`);
          alert('Erro ao localizar campos para salvar. Verifique o console.');
          return;
        }

        if (!nameInput.value.trim()) {
          alert('O Nome do Grupo é obrigatório.');
          return;
        }

        const updates = {
          nome: nameInput.value.trim(),
          descricao: descriptionInput.value.trim(),
          disciplina_area: disciplineInput.value.trim(),
          topico_especifico: topicInput.value.trim(),
          tags: tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag),
          is_private: privacySelect.value === 'private',
          is_public: privacySelect.value === 'public'
        };

        const { error } = await window.supabase
          .from('grupos_estudo')
          .update(updates)
          .eq('id', groupId);

        if (error) throw error;

        console.log(`Alterações salvas com sucesso para o grupo ${groupId}.`);
        alert('Alterações salvas com sucesso!');
        
        // Recarregar dados atualizados
        const updatedData = await fetchGroupData(groupId);
        fillAndEnableEditing(updatedData);
      } catch (error) {
        console.error(`Erro ao salvar alterações para o grupo ${groupId}:`, error.message);
        alert('Erro ao salvar as alterações. Verifique o console.');
      }
    };

    // Adicionar ou atualizar seção "Aparência & Tema" dentro da mini-seção "Ajustes"
    const settingsContent = document.getElementById('settings-content');
    if (settingsContent) {
      let appearanceSection = settingsContent.querySelector('#appearance-section');
      if (!appearanceSection) {
        appearanceSection = document.createElement('div');
        appearanceSection.id = 'appearance-section';
        appearanceSection.innerHTML = `
          <h3>Aparência & Tema</h3>
          <div style="margin: 10px 0;">
            <label style="display: block; margin-bottom: 5px;">Banner do Grupo:</label>
            <input type="file" id="group-banner-upload" accept="image/png,image/jpeg,image/jpg" style="margin-bottom: 10px;">
          </div>
          <div style="margin: 10px 0;">
            <label style="display: block; margin-bottom: 5px;">Foto do Grupo:</label>
            <input type="file" id="group-photo-upload" accept="image/png,image/jpeg,image/jpg" style="margin-bottom: 10px;">
          </div>
          <button id="save-images-button" style="background: #2ecc71; color: white; border: none; padding: 8px 16px; border-radius: 5px; margin-top: 10px; cursor: pointer;">Salvar Imagens</button>
        `;
        settingsContent.appendChild(appearanceSection);

        // Configurar evento do botão de salvar imagens
        const saveImagesButton = document.getElementById('save-images-button');
        if (saveImagesButton) {
          saveImagesButton.onclick = () => {
            console.log('Botão "Salvar Imagens" clicado');
            saveGroupImages(groupId).catch(error => {
              console.error('Erro no salvamento de imagens:', error);
            });
          };
        }
      }
    }

    // Função switchSection atualizada
    window.switchSection = (section, groupId) => {
      const sections = ['discussions', 'members', 'settings'];
      sections.forEach(s => {
        const content = document.getElementById(`${s}-content`);
        if (content) content.style.display = s === section ? 'block' : 'none';
        const button = document.querySelector(`button[onclick*="switchSection('${s}'"]`);
        if (button) {
          button.style.background = s === section ? '#3498db' : '#ddd';
          button.style.color = s === section ? 'white' : '#666';
        }
      });
      
      if (section === 'settings' && groupId) {
        // Reaplicar edição ao ativar a seção de ajustes
        setTimeout(() => fillAndEnableEditing(groupData), 100);
      }
      
      console.log(`Seção ${section} ativada para o grupo ${groupId}.`);
    };

    // Preencher e habilitar edição inicialmente
    fillAndEnableEditing(groupData);

    // Iniciar com Discussões ativa
    window.switchSection('discussions', groupId);

    // Atualizar contagem online periodicamente
    setInterval(async () => {
      const count = await updateOnlineCount();
      const onlineNumber = document.getElementById('online-number');
      if (onlineNumber) onlineNumber.textContent = count;
    }, 15000);

    // Atualização inicial da contagem
    const initialCount = await updateOnlineCount();
    const onlineNumber = document.getElementById('online-number');
    if (onlineNumber) onlineNumber.textContent = initialCount;

    // Carregar membros do grupo
    const loadMembers = async (groupId, userCache, userId, isAdminOrOwner) => {
      try {
        console.log(`Carregando membros do grupo ${groupId}...`);
    
        // Buscar membros do grupo
        const { data: members, error: membersError } = await window.supabase
          .from('membros_grupos')
          .select('user_id, is_admin, is_owner')
          .eq('grupo_id', groupId);
    
        if (membersError) {
          console.error('Erro ao buscar membros:', membersError);
          throw membersError;
        }
    
        if (!members || members.length === 0) {
          console.warn('Nenhum membro encontrado no grupo.');
          return;
        }
    
        // Preparar HTML para a lista de membros
        let membersHTML = '<ul style="list-style: none; padding: 0;">';
    
        // Iterar sobre os membros e construir o HTML
        for (const member of members) {
          const user = userCache.get(member.user_id);
          if (!user) {
            console.warn(`Usuário ${member.user_id} não encontrado no cache.`);
            continue;
          }
    
          const isAdmin = member.is_admin || false;
          const isOwner = member.is_owner || false;
          const isCurrentUser = member.user_id === userId;
    
          membersHTML += `
            <li style="padding: 10px; border-bottom: 1px solid #eee; display: flex; align-items: center;">
              <img src="${user.avatar_url || '/default-avatar.png'}" alt="Avatar" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 10px;">
              <span>${user.name}</span>
              ${isAdmin ? '<span style="margin-left: 5px; color: #888;">(Admin)</span>' : ''}
              ${isOwner ? '<span style="margin-left: 5px; color: #888;">(Owner)</span>' : ''}
              ${isCurrentUser ? '<span style="margin-left: 5px; color: #888;">(Você)</span>' : ''}
            </li>
          `;
        }
    
        membersHTML += '</ul>';
    
        // Inserir HTML na seção de membros
        const membersContent = document.getElementById('members-content');
        if (membersContent) {
          membersContent.innerHTML = membersHTML;
        } else {
          console.error('Elemento #members-content não encontrado no DOM.');
        }
    
        console.log(`Lista de membros carregada com sucesso para o grupo ${groupId}.`);
      } catch (error) {
        console.error('Erro ao carregar membros:', error.message);
        alert('Erro ao carregar membros. Verifique o console.');
      }
    };

    // Configurar Realtime para chat e online
    const channel = window.supabase
      .channel(`chat-${groupId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens', filter: `grupo_id=eq.${groupId}` }, (payload) => {
        addMessageToChat(payload.new, userCache);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_sessions', filter: `grupo_id=eq.${groupId}` }, () => {
        updateOnlineCount().then(count => {
          const onlineNumber = document.getElementById('online-number');
          if (onlineNumber) onlineNumber.textContent = count;
        }).catch(err => console.error('Erro na atualização de online via Realtime:', err.message));
        loadMembers(groupId, userCache, userId, isAdminOrOwner);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'user_sessions', filter: `grupo_id=eq.${groupId}` }, () => {
        updateOnlineCount().then(count => {
          const onlineNumber = document.getElementById('online-number');
          if (onlineNumber) onlineNumber.textContent = count;
        }).catch(err => console.error('Erro na remoção de online via Realtime:', err.message));
        loadMembers(groupId, userCache, userId, isAdminOrOwner);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to chat and online channel for group ${groupId}`);
          const { data: messages, error: messagesError } = await window.supabase
            .from('mensagens')
            .select('*')
            .eq('grupo_id', groupId)
            .order('enviado_em', { ascending: false });
          if (messagesError) throw messagesError;
          messages.forEach(message => addMessageToChat(message, userCache));
          updateOnlineCount().then(count => {
            const onlineNumber = document.getElementById('online-number');
            if (onlineNumber) onlineNumber.textContent = count;
          }).catch(err => console.error('Erro inicial na contagem de online:', err.message));
          loadMembers(groupId, userCache, userId, isAdminOrOwner);
        }
      })
      .catch(err => console.error('Erro ao subscrever ao canal Realtime:', err.message));

    // Evento para ícone de pesquisa
    const searchIcon = document.getElementById('search-icon');
    if (searchIcon) {
      searchIcon.addEventListener('click', () => {
        const searchBar = document.getElementById('search-bar');
        if (searchBar) {
          searchBar.style.display = 'block';
          const searchInput = document.getElementById('search-input');
          if (searchInput) searchInput.focus();
          filterMessages(groupId);
        }
      });
    }

    // Evento para ícone de três pontos
    const menuIcon = document.getElementById('menu-icon');
    if (menuIcon && typeof showOptionsModal === 'function') {
      menuIcon.addEventListener('click', () => {
        try {
          console.log(`Abrindo modal de opções para o grupo ${groupId}...`);
          showOptionsModal(groupId);
        } catch (error) {
          console.error(`Erro ao abrir modal de opções para o grupo ${groupId}:`, error.message);
          alert('Erro ao abrir as opções. Verifique o console.');
        }
      });
    } else if (menuIcon) {
      console.warn(`Função showOptionsModal não encontrada para o grupo ${groupId}. Ícone desativado.`);
      menuIcon.disabled = true;
    }

    console.log(`Interface do grupo ${groupId} carregada com salvamento de imagens corrigido em "Aparência & Tema".`);

  } catch (error) {
    console.error('Erro ao acessar grupo:', error.message, error.stack);
    alert('Erro ao acessar o grupo. Verifique o console.');
    const header = document.querySelector('.groups-header');
    if (header) header.style.display = 'flex';
  }
};

// Disponibilizar globalmente
window.accessGroup = accessGroup;

// Função para adicionar mensagem ao chat
function addMessageToChat(message, userCache) {
  try {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) {
      console.error('Elemento #chat-messages não encontrado no DOM.');
      return;
    }

    const user = userCache.get(message.user_id);
    if (!user) {
      console.warn(`Usuário ${message.user_id} não encontrado no cache.`);
      return;
    }

    const messageElement = document.createElement('div');
    messageElement.style.cssText = 'padding: 8px; border-bottom: 1px solid #eee;';
    messageElement.innerHTML = `
      <img src="${user.avatar_url || '/default-avatar.png'}" alt="Avatar" style="width: 24px; height: 24px; border-radius: 50%; margin-right: 8px;">
      <strong>${user.name}:</strong>
      <span>${message.conteudo}</span>
      <span style="font-size: 0.8em; color: #888; margin-left: 8px;">${new Date(message.enviado_em).toLocaleTimeString()}</span>
    `;

    chatMessages.insertBefore(messageElement, chatMessages.firstChild);
  } catch (error) {
    console.error('Erro ao adicionar mensagem ao chat:', error.message);
  }
}

// Função para enviar mensagem
async function sendMessage(groupId) {
  try {
    const messageInput = document.getElementById('message-input');
    if (!messageInput) {
      console.error('Elemento #message-input não encontrado no DOM.');
      return;
    }

    const messageContent = messageInput.value.trim();
    if (!messageContent) return;

    const userId = await validateUserAuth();
    if (!userId) {
      console.error('Usuário não autenticado.');
      alert('Usuário não autenticado.');
      return;
    }

    const { data, error } = await window.supabase
      .from('mensagens')
      .insert([{
        grupo_id: groupId,
        user_id: userId,
        conteudo: messageContent
      }]);

    if (error) throw error;

    messageInput.value = '';
    console.log('Mensagem enviada com sucesso:', data);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error.message);
    alert('Erro ao enviar a mensagem. Verifique o console.');
  }
}

// Função para mostrar o modal de configurações
function showSettingsModal(groupId) {
  alert(`Abrir configurações do grupo ${groupId}`);
}

// Função para mostrar o modal de opções
function showOptionsModal(groupId) {
  alert(`Abrir opções do grupo ${groupId}`);
}

// Função para filtrar mensagens
function filterMessages(groupId) {
  alert(`Filtrar mensagens do grupo ${groupId}`);
}

// Função para esconder a barra de pesquisa
function hideSearchBar() {
  const searchBar = document.getElementById('search-bar');
  if (searchBar) searchBar.style.display = 'none';
}
