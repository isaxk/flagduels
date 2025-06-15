export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      flags: {
        Row: {
          created_at: string
          id: number
          image_url: string
          name: string
          shorthand: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          image_url: string
          name: string
          shorthand?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          image_url?: string
          name?: string
          shorthand?: string | null
        }
        Relationships: []
      }
      game_rounds: {
        Row: {
          flag_id: number | null
          game_id: number
          id: number
          player1_correct: boolean | null
          player1_guess: number | null
          player1_guess_time_ms: number | null
          player2_correct: boolean | null
          player2_guess: number | null
          player2_guess_time_ms: number | null
          round_winner_id: string | null
          score_awarded_player1: number | null
          score_awarded_player2: number | null
          start_time: string
        }
        Insert: {
          flag_id?: number | null
          game_id: number
          id?: number
          player1_correct?: boolean | null
          player1_guess?: number | null
          player1_guess_time_ms?: number | null
          player2_correct?: boolean | null
          player2_guess?: number | null
          player2_guess_time_ms?: number | null
          round_winner_id?: string | null
          score_awarded_player1?: number | null
          score_awarded_player2?: number | null
          start_time: string
        }
        Update: {
          flag_id?: number | null
          game_id?: number
          id?: number
          player1_correct?: boolean | null
          player1_guess?: number | null
          player1_guess_time_ms?: number | null
          player2_correct?: boolean | null
          player2_guess?: number | null
          player2_guess_time_ms?: number | null
          round_winner_id?: string | null
          score_awarded_player1?: number | null
          score_awarded_player2?: number | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "rounds_flag_id_fkey"
            columns: ["flag_id"]
            isOneToOne: false
            referencedRelation: "flags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rounds_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string
          current_flag_id: number | null
          current_round: number | null
          id: number
          player1_id: string
          player1_score: number | null
          player2_id: string | null
          player2_score: number | null
          status: string | null
          total_rounds: number | null
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          current_flag_id?: number | null
          current_round?: number | null
          id?: number
          player1_id?: string
          player1_score?: number | null
          player2_id?: string | null
          player2_score?: number | null
          status?: string | null
          total_rounds?: number | null
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          current_flag_id?: number | null
          current_round?: number | null
          id?: number
          player1_id?: string
          player1_score?: number | null
          player2_id?: string | null
          player2_score?: number | null
          status?: string | null
          total_rounds?: number | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_current_flag_id_fkey"
            columns: ["current_flag_id"]
            isOneToOne: false
            referencedRelation: "flags"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
