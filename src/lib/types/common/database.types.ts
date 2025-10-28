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
    PostgrestVersion: "13.0.5"
  }
  events: {
    Tables: {
      detail: {
        Row: {
          day: number
          event_type: Database["events"]["Enums"]["event_type"]
          html: string
          id: string
          links: Json
          month: number
          text: string
          year: number
        }
        Insert: {
          day: number
          event_type: Database["events"]["Enums"]["event_type"]
          html: string
          id?: string
          links?: Json
          month: number
          text: string
          year: number
        }
        Update: {
          day?: number
          event_type?: Database["events"]["Enums"]["event_type"]
          html?: string
          id?: string
          links?: Json
          month?: number
          text?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "detail_month_day_fkey"
            columns: ["month", "day"]
            isOneToOne: false
            referencedRelation: "metadata"
            referencedColumns: ["month", "day"]
          },
        ]
      }
      metadata: {
        Row: {
          created_at: string | null
          date_string: string
          day: number
          fetching: Database["events"]["Enums"]["fetching_type"] | null
          last_api_update: number
          month: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_string: string
          day: number
          fetching?: Database["events"]["Enums"]["fetching_type"] | null
          last_api_update?: number
          month: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_string?: string
          day?: number
          fetching?: Database["events"]["Enums"]["fetching_type"] | null
          last_api_update?: number
          month?: number
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_fullevent_for_date: {
        Args: { p_day: number; p_month: number }
        Returns: Json
      }
      random_cluster: {
        Args: { k: number; radius?: number }
        Returns: {
          day: number
          event_type: Database["events"]["Enums"]["event_type"]
          html: string
          id: string
          links: Json
          month: number
          text: string
          year: number
        }[]
        SetofOptions: {
          from: "*"
          to: "detail"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      random_cluster_with_filter: {
        Args: {
          p_event_type: Database["events"]["Enums"]["event_type"]
          p_in_day: number
          p_in_month: number
          p_k: number
          p_radius?: number
        }
        Returns: {
          day: number
          event_type: Database["events"]["Enums"]["event_type"]
          html: string
          id: string
          links: Json
          month: number
          text: string
          year: number
        }[]
        SetofOptions: {
          from: "*"
          to: "detail"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_daily_events: {
        Args: {
          p_api_update_time: number
          p_births: Json
          p_day: number
          p_deaths: Json
          p_events: Json
          p_month: number
        }
        Returns: undefined
      }
    }
    Enums: {
      event_type: "events" | "births" | "deaths"
      fetching_type: "not_available" | "ongoing" | "available"
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
  events: {
    Enums: {
      event_type: ["events", "births", "deaths"],
      fetching_type: ["not_available", "ongoing", "available"],
    },
  },
} as const

export type EventType = Database["events"]["Enums"]["event_type"];
export type EventData = Database["events"]["Tables"]["detail"]["Row"];