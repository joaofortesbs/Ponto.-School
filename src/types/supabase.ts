
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      platform_settings: {
        Row: {
          id: number
          key: string
          value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          key: string
          value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          key?: string
          value?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      turmas: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          codigo: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          nome: string
          descricao?: string | null
          codigo: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string | null
          codigo?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      turma_participantes: {
        Row: {
          id: string
          turma_id: string
          user_id: string
          tipo: string
          created_at: string
        }
        Insert: {
          id?: string
          turma_id: string
          user_id: string
          tipo: string
          created_at?: string
        }
        Update: {
          id?: string
          turma_id?: string
          user_id?: string
          tipo?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "turma_participantes_turma_id_fkey"
            columns: ["turma_id"]
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turma_participantes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {}
    Functions: {
      execute_sql: {
        Args: {
          sql_query: string
        }
        Returns: undefined
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
}
