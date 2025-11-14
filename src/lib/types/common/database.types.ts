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
      content: {
        Row: {
          content_urls: Json
          created_at: string | null
          day: number
          event_date: string | null
          event_type: Database["events"]["Enums"]["event_type"]
          extract: string
          id: string
          month: number
          original_image: Json | null
          text: string
          thumbnail: Json | null
          title: string
          updated_at: string | null
          wiki_metadata: Json
          year: number
        }
        Insert: {
          content_urls: Json
          created_at?: string | null
          day: number
          event_date?: string | null
          event_type: Database["events"]["Enums"]["event_type"]
          extract: string
          id?: string
          month: number
          original_image?: Json | null
          text: string
          thumbnail?: Json | null
          title: string
          updated_at?: string | null
          wiki_metadata: Json
          year: number
        }
        Update: {
          content_urls?: Json
          created_at?: string | null
          day?: number
          event_date?: string | null
          event_type?: Database["events"]["Enums"]["event_type"]
          extract?: string
          id?: string
          month?: number
          original_image?: Json | null
          text?: string
          thumbnail?: Json | null
          title?: string
          updated_at?: string | null
          wiki_metadata?: Json
          year?: number
        }
        Relationships: []
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
      daily_cluster: {
        Args: {
          p_day: number
          p_event_type: Database["events"]["Enums"]["event_type"]
          p_month: number
          p_num_items: number
          p_range?: number
          p_seed: number
        }
        Returns: {
          content_urls: Json
          day: number
          event_type: Database["events"]["Enums"]["event_type"]
          extract: string
          id: string
          month: number
          original_image: Json
          text: string
          thumbnail: Json
          title: string
          wiki_metadata: Json
          year: number
        }[]
      }
      get_event: {
        Args: { p_id: string }
        Returns: {
          content_urls: Json
          day: number
          event_type: Database["events"]["Enums"]["event_type"]
          extract: string
          id: string
          month: number
          original_image: Json
          text: string
          thumbnail: Json
          title: string
          wiki_metadata: Json
          year: number
        }[]
      }
      get_events_by_row_numbers: {
        Args: {
          p_day: number
          p_event_type: Database["events"]["Enums"]["event_type"]
          p_indices: number[]
          p_month: number
        }
        Returns: {
          content_urls: Json
          created_at: string
          day: number
          event_type: Database["events"]["Enums"]["event_type"]
          extract: string
          id: string
          month: number
          original_image: Json
          text: string
          thumbnail: Json
          title: string
          updated_at: string
          wiki_metadata: Json
          year: number
        }[]
      }
      get_pair_events: {
        Args: {
          in_event_type: Database["events"]["Enums"]["event_type"]
          max_attempts?: number
          max_years?: number
        }
        Returns: Json
      }
      insert_events: { Args: { p_events: Json }; Returns: undefined }
      random_cluster: {
        Args: {
          p_day: number
          p_event_type: Database["events"]["Enums"]["event_type"]
          p_month: number
          p_num_items: number
          p_range?: number
        }
        Returns: {
          content_urls: Json
          day: number
          event_type: Database["events"]["Enums"]["event_type"]
          extract: string
          id: string
          month: number
          original_image: Json
          text: string
          thumbnail: Json
          title: string
          wiki_metadata: Json
          year: number
        }[]
      }
      random_cluster_v6: {
        Args: {
          p_bucket_jitter?: number
          p_event_type: Database["events"]["Enums"]["event_type"]
          p_num_items: number
          p_pair_gap?: number
        }
        Returns: {
          content_urls: Json
          created_at: string | null
          day: number
          event_date: string | null
          event_type: Database["events"]["Enums"]["event_type"]
          extract: string
          id: string
          month: number
          original_image: Json | null
          text: string
          thumbnail: Json | null
          title: string
          updated_at: string | null
          wiki_metadata: Json
          year: number
        }[]
        SetofOptions: {
          from: "*"
          to: "content"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      event_type: "event" | "birth" | "death"
      fetching_type: "not_available" | "available" | "ongoing"
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
      event_type: ["event", "birth", "death"],
      fetching_type: ["not_available", "available", "ongoing"],
    },
  },
} as const

export type InsertEventType = Database["events"]["Tables"]["content"]["Insert"];
export type EventType = Database["events"]["Enums"]["event_type"];
export type EventData = Database["events"]["Tables"]["content"]["Row"];
export type RandomPairEvent = [Pick<EventData, "id" | "text" | "extract" | "title" | "thumbnail" | "original_image" | "event_type">, Pick<EventData, "id" | "text" | "extract" | "title" | "thumbnail" | "original_image" | "event_type">];