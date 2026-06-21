export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      acervo_ordem: {
        Row: {
          chave: number
          posicao: number
          updated_at: string
        }
        Insert: {
          chave: number
          posicao: number
          updated_at?: string
        }
        Update: {
          chave?: number
          posicao?: number
          updated_at?: string
        }
        Relationships: []
      }
      admin_emails: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      geracoes_audio: {
        Row: {
          caracteres: number
          created_at: string
          id: string
          num: number
          voz_id: string | null
        }
        Insert: {
          caracteres: number
          created_at?: string
          id?: string
          num: number
          voz_id?: string | null
        }
        Update: {
          caracteres?: number
          created_at?: string
          id?: string
          num?: number
          voz_id?: string | null
        }
        Relationships: []
      }
      obra_overrides: {
        Row: {
          ano: string | null
          aprovada: boolean
          audio_fem_path: string | null
          audio_masc_path: string | null
          audio_trechos: Json | null
          audio_url: string | null
          audiodescricao: string | null
          autor: string | null
          descricao: string | null
          dimensao: string | null
          imagem_path: string | null
          num: number
          parede: string | null
          tecnica: string | null
          titulo: string | null
          updated_at: string
          voz_id: string
        }
        Insert: {
          ano?: string | null
          aprovada?: boolean
          audio_fem_path?: string | null
          audio_masc_path?: string | null
          audio_trechos?: Json | null
          audio_url?: string | null
          audiodescricao?: string | null
          autor?: string | null
          descricao?: string | null
          dimensao?: string | null
          imagem_path?: string | null
          num: number
          parede?: string | null
          tecnica?: string | null
          titulo?: string | null
          updated_at?: string
          voz_id?: string
        }
        Update: {
          ano?: string | null
          aprovada?: boolean
          audio_fem_path?: string | null
          audio_masc_path?: string | null
          audio_trechos?: Json | null
          audio_url?: string | null
          audiodescricao?: string | null
          autor?: string | null
          descricao?: string | null
          dimensao?: string | null
          imagem_path?: string | null
          num?: number
          parede?: string | null
          tecnica?: string | null
          titulo?: string | null
          updated_at?: string
          voz_id?: string
        }
        Relationships: []
      }
      obra_versoes: {
        Row: {
          audio_path: string | null
          created_at: string
          descricao: string | null
          id: string
          num: number
          origem: string
          tipo: string
        }
        Insert: {
          audio_path?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          num: number
          origem: string
          tipo: string
        }
        Update: {
          audio_path?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          num?: number
          origem?: string
          tipo?: string
        }
        Relationships: []
      }
      obras_extras: {
        Row: {
          ano: string | null
          audio_fem_path: string | null
          audio_masc_path: string | null
          audio_trechos: Json | null
          audio_url: string | null
          audiodescricao: string | null
          autor: string | null
          created_at: string
          descricao: string | null
          dimensao: string | null
          imagem_path: string | null
          num: number
          parede: string | null
          tecnica: string | null
          titulo: string | null
          updated_at: string
          voz_id: string
        }
        Insert: {
          ano?: string | null
          audio_fem_path?: string | null
          audio_masc_path?: string | null
          audio_trechos?: Json | null
          audio_url?: string | null
          audiodescricao?: string | null
          autor?: string | null
          created_at?: string
          descricao?: string | null
          dimensao?: string | null
          imagem_path?: string | null
          num: number
          parede?: string | null
          tecnica?: string | null
          titulo?: string | null
          updated_at?: string
          voz_id?: string
        }
        Update: {
          ano?: string | null
          audio_fem_path?: string | null
          audio_masc_path?: string | null
          audio_trechos?: Json | null
          audio_url?: string | null
          audiodescricao?: string | null
          autor?: string | null
          created_at?: string
          descricao?: string | null
          dimensao?: string | null
          imagem_path?: string | null
          num?: number
          parede?: string | null
          tecnica?: string | null
          titulo?: string | null
          updated_at?: string
          voz_id?: string
        }
        Relationships: []
      }
      obras_ocultas: {
        Row: {
          created_at: string
          num: number
        }
        Insert: {
          created_at?: string
          num: number
        }
        Update: {
          created_at?: string
          num?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      inserir_na_ordem: {
        Args: { p_chave: number; p_posicao: number }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      remover_da_ordem: { Args: { p_chave: number }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
