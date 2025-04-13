// Serviço para gerenciamento de perfis de usuário
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/user-profile';
import { generateUserId, generateSimpleUserId, generateUserIdByPlan, isValidUserId } from '@/lib/generate-user-id';

/**
 * Cria um perfil de usuário com ID automático baseado na UF e tipo de plano
 */
export async function createUserProfile(userData: Partial<UserProfile>, uf: string = 'BR', planType: string = 'standard'): Promise<UserProfile | null> {
  try {
    // Gera um ID de usuário único
    const userId = await generateUserIdByPlan(planType, uf);

    // Adiciona o ID ao objeto de dados do usuário
    const userDataWithId = {
      ...userData,
      user_id: userId
    };

    // Insere o perfil no banco de dados
    const { data, error } = await supabase
      .from('profiles')
      .insert([userDataWithId])
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao criar perfil de usuário:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao criar perfil de usuário:', error);
    return null;
  }
}

/**
 * Obtém um perfil de usuário pelo ID gerado automaticamente
 */
export async function getUserProfileById(userId: string): Promise<UserProfile | null> {
  if (!isValidUserId(userId)) {
    console.error('ID de usuário inválido:', userId);
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Erro ao buscar perfil de usuário:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar perfil de usuário:', error);
    return null;
  }
}

class ProfileService {
  /**
   * Obter o perfil do usuário atual
   */
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      // Verificar cache primeiro para retorno instantâneo
      const cachedProfile = localStorage.getItem('userProfile');
      let profile = null;

      if (cachedProfile) {
        try {
          profile = JSON.parse(cachedProfile);
          // Se o cache é válido e recente (menos de 5 minutos), usá-lo imediatamente
          const cacheTime = localStorage.getItem('userProfileCacheTime');
          if (cacheTime && (Date.now() - parseInt(cacheTime)) < 5 * 60 * 1000) {
            // Atualizar em background e retornar cache imediatamente
            this.refreshProfileInBackground();
            return profile;
          }
        } catch (e) {
          console.error('Erro ao parsear perfil em cache:', e);
        }
      }

      // Se não tiver cache válido, buscar do Supabase
      const { data: session } = await supabase.auth.getSession();

      if (!session?.session?.user) {
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.session.user.id)
        .single();

      if (error) {
        if (error.message.includes('network') && profile) {
          // Se for erro de rede e tivermos um cache, usá-lo
          return profile;
        }
        console.error('Erro ao buscar perfil:', error);
        return profile || null; // Retornar cache mesmo que seja antigo, se disponível
      }

      // Atualizar cache
      if (data) {
        localStorage.setItem('userProfile', JSON.stringify(data));
        localStorage.setItem('userProfileCacheTime', Date.now().toString());
      }

      return data;
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);

      // Tentar usar cache como fallback em caso de erro
      try {
        const cachedProfile = localStorage.getItem('userProfile');
        if (cachedProfile) {
          return JSON.parse(cachedProfile);
        }
      } catch (e) {}

      return null;
    }
  }

  // Método para atualizar o perfil em background sem bloquear a UI
  private async refreshProfileInBackground() {
    requestAnimationFrame(async () => {
      try {
        const { data: session } = await supabase.auth.getSession();

        if (!session?.session?.user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.session.user.id)
          .single();

        if (error) return;

        if (data) {
          localStorage.setItem('userProfile', JSON.stringify(data));
          localStorage.setItem('userProfileCacheTime', Date.now().toString());
        }
      } catch (e) {
        // Silenciar erros em atualizações em background
      }
    });
  }

  /**
   * Criar um novo perfil de usuário
   */
  async createUserProfile(userId: string, email: string): Promise<UserProfile | null> {
    try {
      // Verificar se já existe um perfil para evitar duplicação
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (existingProfile) {
        // Se o perfil já existe mas não tem um user_id, atualizamos com um novo
        if (!existingProfile.user_id) {
          const generatedId = await generateUserIdByPlan('lite', 'BR');
          const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({ user_id: generatedId, updated_at: new Date().toISOString() })
            .eq('id', existingProfile.id)
            .select()
            .single();

          if (updateError) {
            console.error('Erro ao atualizar ID do usuário:', updateError);
            return existingProfile as UserProfile;
          }

          return updatedProfile as UserProfile;
        }
        return existingProfile as UserProfile;
      }

      // Gerar um ID único para o usuário baseado no plano (padrão 'lite')
      const generatedId = await generateUserIdByPlan('lite', 'BR');

      // Criar novo perfil
      const newProfile: Partial<UserProfile> = {
        user_id: generatedId,
        email,
        role: 'student',
        plan_type: 'lite', // Definir o plano padrão
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar perfil:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Erro ao criar perfil de usuário:', error);
      return null;
    }
  }

  /**
   * Atualizar perfil do usuário
   */
  async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();

      if (!currentUser.user) {
        console.log('Usuário não autenticado');
        return null;
      }

      // Obter o perfil atual para verificar se existe
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', currentUser.user.email)
        .single();

      if (!currentProfile) {
        console.error('Perfil não encontrado para atualização');
        return null;
      }

      // Atualizar apenas os campos fornecidos
      const updateData = {
        ...profileData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', currentProfile.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Erro ao atualizar perfil de usuário:', error);
      return null;
    }
  }

  /**
   * Obter o nome de exibição do usuário
   */
  async getUserDisplayName(): Promise<string> {
    try {
      const profile = await this.getCurrentUserProfile();

      if (!profile) {
        return 'Usuário';
      }

      if (profile.display_name) {
        console.log('getUserDisplayName: Nome de exibição obtido:', profile.display_name);
        return profile.display_name;
      }

      if (profile.full_name) {
        return profile.full_name;
      }

      return 'Usuário';
    } catch (error) {
      console.error('Erro ao obter nome de exibição:', error);
      return 'Usuário';
    }
  }

  /**
   * Garantir que o perfil do usuário tenha um ID válido
   * Esta função verifica se o usuário tem um ID e, se não tiver, gera um novo
   * @returns Boolean indicando se um novo ID foi gerado
   */
  async ensureUserHasId(): Promise<boolean> {
    try {
      const profile = await this.getCurrentUserProfile();

      if (!profile) {
        console.log('Nenhum perfil encontrado para adicionar ID');
        return false;
      }

      // Se já tem ID válido, verificar se está no formato correto
      if (profile.user_id && isValidUserId(profile.user_id)) {
        console.log('Usuário já possui um ID válido:', profile.user_id);
        return false; // Retorna falso pois não gerou um novo ID
      }

      console.log('Gerando novo ID para o usuário. ID atual:', profile.user_id);

      // Verificar se temos uma UF válida
      let uf = profile.state;
      let ufWasUpdated = false;

      if (!uf || uf.length !== 2 || uf === 'BR') {
        // Se não tiver UF válida, tentar recuperar do localStorage
        console.warn(`UF inválida ou não fornecida no perfil: "${uf}"`);

        // Tentar obter do localStorage
        try {
          const savedState = localStorage.getItem('selectedState');
          if (savedState && savedState.length === 2 && savedState !== 'BR') {
            console.log(`Usando estado encontrado no localStorage: ${savedState}`);
            uf = savedState.toUpperCase();
            ufWasUpdated = true;

            // Atualizar o perfil com o estado correto
            const { error: updateStateError } = await supabase
              .from('profiles')
              .update({ 
                state: uf,
                updated_at: new Date().toISOString() 
              })
              .eq('id', profile.id);

            if (!updateStateError) {
              console.log(`Estado do usuário atualizado para ${uf}`);
            } else {
              console.error('Erro ao atualizar estado no perfil:', updateStateError);
            }
          } else {
            // Se não encontrou no localStorage, tentar ler da sessão ou outras fontes
            const sessionState = sessionStorage.getItem('userState');
            if (sessionState && sessionState.length === 2 && sessionState !== 'BR') {
              uf = sessionState.toUpperCase();
              console.log(`Usando estado encontrado na sessão: ${uf}`);
            } else {
              // Se não encontrou em nenhum lugar, usar um estado padrão (mas não recomendado)
              console.error('Não foi possível encontrar um estado válido. Usando SP como fallback.');
              uf = 'SP';
            }

            ufWasUpdated = true;

            // Atualizar o perfil com o estado encontrado ou padrão
            const { error: updateStateError } = await supabase
              .from('profiles')
              .update({ 
                state: uf,
                updated_at: new Date().toISOString() 
              })
              .eq('id', profile.id);

            if (!updateStateError) {
              console.log(`Estado do usuário definido para: ${uf}`);
            }
          }
        } catch (e) {
          console.error('Erro ao recuperar ou atualizar estado do usuário:', e);
          // Último recurso: usar SP como estado padrão
          uf = 'SP';
          ufWasUpdated = true;
        }
      }

      // Registrar a UF que será usada para a geração do ID
      console.log(`UF que será usada para gerar o ID: ${uf} (Foi atualizada: ${ufWasUpdated})`);

      // Determinar o tipo de plano do usuário
      let planType = profile.plan_type || '';

      // Se não tiver plano definido, verificar localStorage
      if (!planType || planType === '') {
        const savedPlan = localStorage.getItem('selectedPlan');
        if (savedPlan) {
          planType = savedPlan;

          // Atualizar o plano no perfil
          try {
            const { error: updatePlanError } = await supabase
              .from('profiles')
              .update({ plan_type: planType })
              .eq('id', profile.id);

            if (!updatePlanError) {
              console.log(`Plano do usuário atualizado para ${planType}`);
            }
          } catch (e) {
            console.error('Erro ao atualizar plano do usuário:', e);
          }
        } else {
          // Default para lite se não encontrar
          planType = 'lite';
        }
      }

      // Definir o tipo de conta baseado no plano
      const tipoConta = (planType.toLowerCase() === 'premium' || planType.toLowerCase() === 'full') ? 1 : 2;

      console.log(`Gerando ID com UF=${uf}, tipoConta=${tipoConta}, plano=${planType}`);

      // Usar a função de geração de ID para garantir sequencial único
      let generatedId;

      // Tentar todas as estratégias disponíveis para geração de ID
      try {
        // 1. Tentar usar a função SQL diretamente (mais confiável para sequencial)
        const { data: sqlData, error: sqlError } = await supabase.rpc('get_next_user_id_for_uf', {
          p_uf: uf,
          p_tipo_conta: tipoConta
        });

        if (!sqlError && sqlData) {
          generatedId = sqlData;
          console.log('ID gerado com sucesso via função SQL:', generatedId);
        } else {
          throw new Error(`Erro ao gerar ID via SQL: ${sqlError?.message || 'Sem dados retornados'}`);
        }
      } catch (sqlFuncError) {
        console.error('Erro na função SQL de geração de ID:', sqlFuncError);

        try {
          // 2. Tentar gerar usando a função principal
          generatedId = await generateUserId(uf, tipoConta);
          console.log('ID gerado com sucesso via generateUserId:', generatedId);
        } catch (error) {
          console.error('Erro ao gerar ID com função principal:', error);

          try {
            // 3. Tentar gerar utilizando a função específica de plano
            generatedId = await generateUserIdByPlan(planType, uf);
            console.log('ID gerado com função de plano:', generatedId);
          } catch (planError) {
            console.error('Erro ao gerar ID com função de plano:', planError);

            // 4. Tentar obter o sequencial diretamente da tabela de controle por UF
            try {
              const dataAtual = new Date();
              const anoMes = `${dataAtual.getFullYear().toString().slice(-2)}${(dataAtual.getMonth() + 1).toString().padStart(2, '0')}`;

              const { data: controlData, error: controlError } = await supabase
                .from('user_id_control_by_uf')
                .select('*')
                .eq('uf', uf)
                .eq('ano_mes', anoMes)
                .eq('tipo_conta', tipoConta)
                .single();

              let nextId = 1;

              if (!controlError && controlData) {
                // Incrementar ID existente
                nextId = controlData.last_id + 1;

                // Atualizar o contador
                await supabase
                  .from('user_id_control_by_uf')
                  .update({ 
                    last_id: nextId,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', controlData.id);
              } else {
                // Criar novo controle para esta UF
                await supabase
                  .from('user_id_control_by_uf')
                  .insert([{ 
                    uf, 
                    ano_mes: anoMes, 
                    tipo_conta: tipoConta, 
                    last_id: 1
                  }]);
              }

              // Formatar o ID completo
              generatedId = `${uf}${anoMes}${tipoConta}${nextId.toString().padStart(6, '0')}`;
              console.log('ID gerado com acesso direto à tabela de controle:', generatedId);
            } catch (tableError) {
              console.error('Erro ao acessar tabela de controle:', tableError);

              // 5. Último fallback: Gerar manualmente com timestamp
              const dataAtual = new Date();
              const anoMes = `${dataAtual.getFullYear().toString().slice(-2)}${(dataAtual.getMonth() + 1).toString().padStart(2, '0')}`;
              const timestamp = Date.now();
              const sequencial = (timestamp % 1000000).toString().padStart(6, '0');
              generatedId = `${uf}${anoMes}${tipoConta}${sequencial}`;
              console.log('ID gerado manualmente com timestamp:', generatedId);
            }
          }
        }
      }

      if (!generatedId || !isValidUserId(generatedId)) {
        console.error('ID gerado é inválido:', generatedId);
        return false;
      }

      // Atualizar o perfil com o novo ID
      const { error } = await supabase
        .from('profiles')
        .update({ 
          user_id: generatedId,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) {
        console.error('Erro ao atualizar perfil com novo ID:', error);

        // Tentar um método alternativo de atualização
        try {
          const { error: alternativeError } = await supabase
            .rpc('execute_sql', { 
              sql_query: `UPDATE profiles SET user_id = '${generatedId}', updated_at = NOW() WHERE id = '${profile.id}'` 
            });

          if (alternativeError) {
            console.error('Erro também no método alternativo:', alternativeError);
            return false;
          }
        } catch (rpcError) {
          console.error('Erro ao executar RPC:', rpcError);
          return false;
        }
      }

      console.log('ID gerado e atualizado com sucesso:', generatedId);

      // Atualizar o localstorage com o novo ID para uso rápido
      try {
        const tempProfile = JSON.parse(localStorage.getItem('tempUserProfile') || '{}');
        tempProfile.user_id = generatedId;
        localStorage.setItem('tempUserProfile', JSON.stringify(tempProfile));
      } catch (storageError) {
        console.warn('Erro ao atualizar localStorage com novo ID:', storageError);
      }

      return true; // Retorna verdadeiro pois gerou um novo ID
    } catch (error) {
      console.error('Erro ao garantir ID do usuário:', error);
      return false;
    }
  }
}

// Exportar uma instância única do serviço
export const profileService = new ProfileService();