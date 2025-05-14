import { supabase } from './supabase';

export interface GrupoEstudo {
  id: string;
  nome: string;
  descricao: string;
  codigo?: string;
  dataCriacao: string;
  criadorId: string;
  membros: Array<{
    id: string;
    nome: string;
    cargo?: string;
  }>;
  topicos: Array<{
    id: string;
    titulo: string;
    descricao?: string;
  }>;
  materiais: Array<{
    id: string;
    titulo: string;
    tipo: string;
    url?: string;
  }>;
}

class GruposEstudoStorage {
  private readonly STORAGE_KEY = 'grupos_estudo';

  constructor() {
    // Inicialização - verificar armazenamento local
    this.inicializarArmazenamento();
  }

  private inicializarArmazenamento() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    }
  }

  async obterTodosGrupos(): Promise<GrupoEstudo[]> {
    try {
      // Primeiro busca do armazenamento local
      const grupos = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      console.log("Grupos recuperados do armazenamento local:", grupos.length);

      // Tenta sincronizar com a base de dados
      this.sincronizarGrupos(grupos);

      return grupos;
    } catch (error) {
      console.error("Erro ao obter grupos:", error);
      return [];
    }
  }

  async obterGrupoPorId(id: string): Promise<GrupoEstudo | null> {
    try {
      const grupos = await this.obterTodosGrupos();
      const grupo = grupos.find(g => g.id === id);
      return grupo || null;
    } catch (error) {
      console.error(`Erro ao obter grupo ${id}:`, error);
      return null;
    }
  }

  async adicionarGrupo(grupo: GrupoEstudo): Promise<boolean> {
    try {
      const grupos = await this.obterTodosGrupos();

      // Verificar se o grupo já existe
      const grupoExistente = grupos.findIndex(g => g.id === grupo.id);
      if (grupoExistente >= 0) {
        return false; // Grupo já existe
      }

      grupos.push(grupo);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(grupos));

      // Tentar sincronizar com a base de dados
      await this.sincronizarGrupoIndividual(grupo);

      return true;
    } catch (error) {
      console.error("Erro ao adicionar grupo:", error);
      return false;
    }
  }

  async atualizarGrupo(grupoAtualizado: GrupoEstudo): Promise<boolean> {
    try {
      const grupos = await this.obterTodosGrupos();
      const index = grupos.findIndex(g => g.id === grupoAtualizado.id);

      if (index === -1) {
        return false; // Grupo não encontrado
      }

      grupos[index] = grupoAtualizado;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(grupos));

      // Tentar sincronizar com a base de dados
      await this.sincronizarGrupoIndividual(grupoAtualizado);

      return true;
    } catch (error) {
      console.error("Erro ao atualizar grupo:", error);
      return false;
    }
  }

  async removerGrupo(id: string): Promise<boolean> {
    try {
      const grupos = await this.obterTodosGrupos();
      const gruposFiltrados = grupos.filter(g => g.id !== id);

      if (gruposFiltrados.length === grupos.length) {
        return false; // Nenhum grupo foi removido
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(gruposFiltrados));

      // Tentar sincronizar com a base de dados (remover associação)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('membros_grupos')
            .delete()
            .eq('grupo_id', id)
            .eq('usuario_id', user.id);
        }
      } catch (e) {
        console.warn("Erro ao sincronizar remoção do grupo:", e);
      }

      return true;
    } catch (error) {
      console.error("Erro ao remover grupo:", error);
      return false;
    }
  }

  // Método para sincronizar todos os grupos
  private async sincronizarGrupos(grupos: GrupoEstudo[]) {
    try {
      // Verificar se está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log(`Tentando sincronizar ${grupos.length} grupos locais`);

      // Por enquanto, só verifica inscrições em grupos
      const { data: membrosGrupos, error } = await supabase
        .from('membros_grupos')
        .select('grupo_id')
        .eq('usuario_id', user.id);

      if (error) {
        console.warn("Erro ao verificar membros_grupos:", error);
        return;
      }

      // Verificar grupos a adicionar
      if (membrosGrupos && membrosGrupos.length > 0) {
        const idsGruposRemoto = membrosGrupos.map(m => m.grupo_id);
        const idsGruposLocal = grupos.map(g => g.id);

        // Buscar grupos remotos que não existem localmente
        for (const idGrupo of idsGruposRemoto) {
          if (!idsGruposLocal.includes(idGrupo)) {
            // Buscar detalhes do grupo
            const { data: grupoData } = await supabase
              .from('grupos_estudo')
              .select('*')
              .eq('id', idGrupo)
              .single();

            if (grupoData) {
              // Buscar código do grupo
              const { data: codigoData } = await supabase
                .from('codigos_grupos')
                .select('codigo')
                .eq('grupo_id', idGrupo)
                .single();

              // Criar o objeto de grupo e adicionar localmente
              const novoGrupo: GrupoEstudo = {
                id: grupoData.id,
                nome: grupoData.nome,
                descricao: grupoData.descricao || "",
                codigo: codigoData?.codigo || undefined,
                dataCriacao: grupoData.data_criacao,
                criadorId: grupoData.criador_id,
                membros: [],
                topicos: [],
                materiais: []
              };

              // Adicionar na lista local
              grupos.push(novoGrupo);
            }
          }
        }

        // Atualizar armazenamento local
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(grupos));
      }
    } catch (e) {
      console.warn("Erro na sincronização de grupos:", e);
    }
  }

  // Método para sincronizar um grupo individual
  private async sincronizarGrupoIndividual(grupo: GrupoEstudo) {
    try {
      // Verificar se está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Verificar se o grupo já existe remotamente
      const { data: grupoExistente } = await supabase
        .from('grupos_estudo')
        .select('id')
        .eq('id', grupo.id)
        .single();

      if (!grupoExistente) {
        // Criar o grupo remotamente
        await supabase
          .from('grupos_estudo')
          .insert({
            id: grupo.id,
            nome: grupo.nome,
            descricao: grupo.descricao,
            data_criacao: grupo.dataCriacao,
            criador_id: grupo.criadorId
          });

        // Se tem código, adicionar na tabela de códigos
        if (grupo.codigo) {
          await supabase
            .from('codigos_grupos')
            .insert({
              codigo: grupo.codigo,
              grupo_id: grupo.id,
              nome_grupo: grupo.nome,
              descricao: grupo.descricao,
              criado_por: grupo.criadorId,
              ativo: true
            });
        }
      }

      // Verificar associação do usuário ao grupo
      const { data: membroExistente } = await supabase
        .from('membros_grupos')
        .select('id')
        .eq('grupo_id', grupo.id)
        .eq('usuario_id', user.id)
        .single();

      if (!membroExistente) {
        // Criar associação
        await supabase
          .from('membros_grupos')
          .insert({
            grupo_id: grupo.id,
            usuario_id: user.id,
            cargo: 'membro',
            data_entrada: new Date().toISOString()
          });
      }
    } catch (e) {
      console.warn("Erro na sincronização individual do grupo:", e);
    }
  }
}

export const gruposEstudoStorage = new GruposEstudoStorage();