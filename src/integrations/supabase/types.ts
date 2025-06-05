export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      convites_grupos: {
        Row: {
          convidado_id: string | null
          created_at: string | null
          criador_id: string | null
          grupo_id: string | null
          id: string
          status: string | null
        }
        Insert: {
          convidado_id?: string | null
          created_at?: string | null
          criador_id?: string | null
          grupo_id?: string | null
          id?: string
          status?: string | null
        }
        Update: {
          convidado_id?: string | null
          created_at?: string | null
          criador_id?: string | null
          grupo_id?: string | null
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "convites_grupos_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos_estudo"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_sessions: {
        Row: {
          created_at: string
          duration_formatted: string
          duration_seconds: number
          end_time: string | null
          id: string
          notes: string | null
          progress: number
          session_goal: string | null
          session_title: string | null
          start_time: string
          status: string
          subjects: string[]
          updated_at: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          created_at?: string
          duration_formatted?: string
          duration_seconds?: number
          end_time?: string | null
          id?: string
          notes?: string | null
          progress?: number
          session_goal?: string | null
          session_title?: string | null
          start_time: string
          status?: string
          subjects?: string[]
          updated_at?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          created_at?: string
          duration_formatted?: string
          duration_seconds?: number
          end_time?: string | null
          id?: string
          notes?: string | null
          progress?: number
          session_goal?: string | null
          session_title?: string | null
          start_time?: string
          status?: string
          subjects?: string[]
          updated_at?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      friend_requests: {
        Row: {
          categoria: string
          created_at: string | null
          id: string
          receiver_id: string
          sender_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          categoria?: string
          created_at?: string | null
          id?: string
          receiver_id: string
          sender_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          categoria?: string
          created_at?: string | null
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      group_creation_locks: {
        Row: {
          created_at: string | null
          group_name: string
          lock_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          group_name: string
          lock_id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          group_name?: string
          lock_id?: string
          user_id?: string
        }
        Relationships: []
      }
      grupos_estudo: {
        Row: {
          codigo_unico: string
          cor: string
          created_at: string | null
          data_criacao: string | null
          descricao: string | null
          disciplina_area: string | null
          id: string
          is_publico: boolean | null
          is_visible_to_all: boolean | null
          is_visible_to_partners: boolean | null
          membros: number
          nome: string
          permitir_visibilidade: boolean | null
          privado: boolean | null
          tags: string[] | null
          tipo_grupo: string | null
          topico: string | null
          topico_especifico: string | null
          topico_icon: string | null
          topico_nome: string | null
          updated_at: string | null
          user_id: string
          visibilidade: string | null
        }
        Insert: {
          codigo_unico?: string
          cor?: string
          created_at?: string | null
          data_criacao?: string | null
          descricao?: string | null
          disciplina_area?: string | null
          id?: string
          is_publico?: boolean | null
          is_visible_to_all?: boolean | null
          is_visible_to_partners?: boolean | null
          membros?: number
          nome: string
          permitir_visibilidade?: boolean | null
          privado?: boolean | null
          tags?: string[] | null
          tipo_grupo?: string | null
          topico?: string | null
          topico_especifico?: string | null
          topico_icon?: string | null
          topico_nome?: string | null
          updated_at?: string | null
          user_id: string
          visibilidade?: string | null
        }
        Update: {
          codigo_unico?: string
          cor?: string
          created_at?: string | null
          data_criacao?: string | null
          descricao?: string | null
          disciplina_area?: string | null
          id?: string
          is_publico?: boolean | null
          is_visible_to_all?: boolean | null
          is_visible_to_partners?: boolean | null
          membros?: number
          nome?: string
          permitir_visibilidade?: boolean | null
          privado?: boolean | null
          tags?: string[] | null
          tipo_grupo?: string | null
          topico?: string | null
          topico_especifico?: string | null
          topico_icon?: string | null
          topico_nome?: string | null
          updated_at?: string | null
          user_id?: string
          visibilidade?: string | null
        }
        Relationships: []
      }
      membros_grupos: {
        Row: {
          grupo_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          grupo_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          grupo_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "membros_grupos_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos_estudo"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens_grupos: {
        Row: {
          created_at: string | null
          grupo_id: string
          id: string
          mensagem: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          grupo_id: string
          id?: string
          mensagem: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          grupo_id?: string
          id?: string
          mensagem?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_grupos_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos_estudo"
            referencedColumns: ["id"]
          },
        ]
      }
      parceiros: {
        Row: {
          created_at: string | null
          parceiro_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          parceiro_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          parceiro_id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_url: string | null
          created_at: string
          display_name: string | null
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          full_name?: string | null
          id: string
          role: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tarefas: {
        Row: {
          data_atualizacao: string | null
          data_criacao: string | null
          descricao: string | null
          id: string
          status: boolean
          titulo: string
          user_id: string
        }
        Insert: {
          data_atualizacao?: string | null
          data_criacao?: string | null
          descricao?: string | null
          id?: string
          status?: boolean
          titulo: string
          user_id: string
        }
        Update: {
          data_atualizacao?: string | null
          data_criacao?: string | null
          descricao?: string | null
          id?: string
          status?: boolean
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      transaction_log: {
        Row: {
          action: string | null
          created_at: string | null
          group_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_account_info: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nome_completo: string
          nome_exibicao: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          nome_completo: string
          nome_exibicao: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nome_completo?: string
          nome_exibicao?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_education: {
        Row: {
          created_at: string | null
          current: boolean | null
          degree: string
          description: string | null
          end_date: string | null
          field: string | null
          grade: string | null
          id: string
          institution: string
          start_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current?: boolean | null
          degree: string
          description?: string | null
          end_date?: string | null
          field?: string | null
          grade?: string | null
          id?: string
          institution: string
          start_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current?: boolean | null
          degree?: string
          description?: string | null
          end_date?: string | null
          field?: string | null
          grade?: string | null
          id?: string
          institution?: string
          start_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_id_control: {
        Row: {
          created_at: string | null
          id: string
          last_id: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_id?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          last_id?: number
        }
        Relationships: []
      }
      user_interests: {
        Row: {
          category: string
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notification_settings: {
        Row: {
          created_at: string | null
          email: boolean | null
          id: string
          lembretes_estudo: boolean | null
          push: boolean | null
          relatorios_semanais: boolean | null
          som_notificacoes: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: boolean | null
          id?: string
          lembretes_estudo?: boolean | null
          push?: boolean | null
          relatorios_semanais?: boolean | null
          som_notificacoes?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: boolean | null
          id?: string
          lembretes_estudo?: boolean | null
          push?: boolean | null
          relatorios_semanais?: boolean | null
          som_notificacoes?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_payment_methods: {
        Row: {
          ano_validade: number
          brand: string | null
          cpf_portador: string
          created_at: string | null
          endereco_cobranca: string | null
          id: string
          mes_validade: number
          metodo_padrao: boolean | null
          nome_portador: string
          numero_cartao_last4: string
          telefone: string | null
          tipo_cartao: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ano_validade: number
          brand?: string | null
          cpf_portador: string
          created_at?: string | null
          endereco_cobranca?: string | null
          id?: string
          mes_validade: number
          metodo_padrao?: boolean | null
          nome_portador: string
          numero_cartao_last4: string
          telefone?: string | null
          tipo_cartao: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ano_validade?: number
          brand?: string | null
          cpf_portador?: string
          created_at?: string | null
          endereco_cobranca?: string | null
          id?: string
          mes_validade?: number
          metodo_padrao?: boolean | null
          nome_portador?: string
          numero_cartao_last4?: string
          telefone?: string | null
          tipo_cartao?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_payment_subscription: {
        Row: {
          created_at: string | null
          email_faturas: string
          id: string
          renovacao_automatica: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_faturas: string
          id?: string
          renovacao_automatica?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_faturas?: string
          id?: string
          renovacao_automatica?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_privacy_settings: {
        Row: {
          coleta_dados_melhorias: boolean | null
          created_at: string | null
          id: string
          mostrar_email: boolean | null
          mostrar_telefone: boolean | null
          permitir_mensagens: boolean | null
          updated_at: string | null
          user_id: string
          visibilidade_perfil: string
        }
        Insert: {
          coleta_dados_melhorias?: boolean | null
          created_at?: string | null
          id?: string
          mostrar_email?: boolean | null
          mostrar_telefone?: boolean | null
          permitir_mensagens?: boolean | null
          updated_at?: string | null
          user_id: string
          visibilidade_perfil?: string
        }
        Update: {
          coleta_dados_melhorias?: boolean | null
          created_at?: string | null
          id?: string
          mostrar_email?: boolean | null
          mostrar_telefone?: boolean | null
          permitir_mensagens?: boolean | null
          updated_at?: string | null
          user_id?: string
          visibilidade_perfil?: string
        }
        Relationships: []
      }
      user_profiles_bio: {
        Row: {
          bio: string | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_security_settings: {
        Row: {
          autenticacao_2fa: boolean | null
          created_at: string | null
          id: string
          notificacoes_login: boolean | null
          timeout_sessao: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          autenticacao_2fa?: boolean | null
          created_at?: string | null
          id?: string
          notificacoes_login?: boolean | null
          timeout_sessao?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          autenticacao_2fa?: boolean | null
          created_at?: string | null
          id?: string
          notificacoes_login?: boolean | null
          timeout_sessao?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          category: string
          created_at: string | null
          id: string
          level: number | null
          name: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          level?: number | null
          name: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          level?: number | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_tasks: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_wallet_settings: {
        Row: {
          created_at: string | null
          id: string
          limite_gastos: number | null
          recarga_automatica: boolean | null
          saldo_atual: number | null
          school_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          limite_gastos?: number | null
          recarga_automatica?: boolean | null
          saldo_atual?: number | null
          school_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          limite_gastos?: number | null
          recarga_automatica?: boolean | null
          saldo_atual?: number | null
          school_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_group_member: {
        Args: { p_grupo_id: string; p_user_id: string }
        Returns: {
          member_added: boolean
          message: string
        }[]
      }
      create_group_with_member: {
        Args: {
          p_name: string
          p_description: string
          p_type: string
          p_is_visible_to_all: boolean
          p_is_visible_to_partners: boolean
          p_user_id: string
        }
        Returns: {
          group_id: string
          member_added: boolean
          message: string
        }[]
      }
      is_group_member: {
        Args: { group_id: string; user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
