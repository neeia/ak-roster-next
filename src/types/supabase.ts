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
      depot: {
        Row: {
          crafting: boolean
          material_id: string
          stock: number
          user_id: string
        }
        Insert: {
          crafting?: boolean
          material_id: string
          stock: number
          user_id?: string
        }
        Update: {
          crafting?: boolean
          material_id?: string
          stock?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "depot_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "krooster_accounts"
            referencedColumns: ["user_id"]
          },
        ]
      }
      goals: {
        Row: {
          elite: number | null
          group_name: string
          level: number | null
          masteries: number[] | null
          modules: Json | null
          op_id: string
          skill_level: number | null
          user_id: string
        }
        Insert: {
          elite?: number | null
          group_name: string
          level?: number | null
          masteries?: number[] | null
          modules?: Json | null
          op_id: string
          skill_level?: number | null
          user_id?: string
        }
        Update: {
          elite?: number | null
          group_name?: string
          level?: number | null
          masteries?: number[] | null
          modules?: Json | null
          op_id?: string
          skill_level?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "krooster_accounts"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "goals_user_id_group_name_fkey"
            columns: ["user_id", "group_name"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["user_id", "group_name"]
          },
        ]
      }
      groups: {
        Row: {
          group_name: string
          user_id: string
        }
        Insert: {
          group_name: string
          user_id?: string
        }
        Update: {
          group_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "krooster_accounts"
            referencedColumns: ["user_id"]
          },
        ]
      }
      krooster_accounts: {
        Row: {
          assistant: string | null
          color: string | null
          discordcode: string | null
          display_name: string | null
          friendcode: Json | null
          level: number | null
          onboard: string | null
          private: boolean
          reddituser: string | null
          server: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          assistant?: string | null
          color?: string | null
          discordcode?: string | null
          display_name?: string | null
          friendcode?: Json | null
          level?: number | null
          onboard?: string | null
          private: boolean
          reddituser?: string | null
          server?: string | null
          user_id?: string
          username?: string | null
        }
        Update: {
          assistant?: string | null
          color?: string | null
          discordcode?: string | null
          display_name?: string | null
          friendcode?: Json | null
          level?: number | null
          onboard?: string | null
          private?: boolean
          reddituser?: string | null
          server?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "krooster_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      operators: {
        Row: {
          elite: number
          favorite: boolean
          level: number
          masteries: number[] | null
          modules: Json | null
          op_id: string
          potential: number
          skill_level: number
          skin: string | null
          user_id: string
        }
        Insert: {
          elite: number
          favorite: boolean
          level: number
          masteries?: number[] | null
          modules?: Json | null
          op_id: string
          potential: number
          skill_level: number
          skin?: string | null
          user_id?: string
        }
        Update: {
          elite?: number
          favorite?: boolean
          level?: number
          masteries?: number[] | null
          modules?: Json | null
          op_id?: string
          potential?: number
          skill_level?: number
          skin?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "operators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "krooster_accounts"
            referencedColumns: ["user_id"]
          },
        ]
      }
      presets: {
        Row: {
          presets: Json[]
          user_id: string
        }
        Insert: {
          presets: Json[]
          user_id?: string
        }
        Update: {
          presets?: Json[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "presets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "krooster_accounts"
            referencedColumns: ["user_id"]
          },
        ]
      }
      supports: {
        Row: {
          module: Json | null
          op_id: string
          skill: number
          slot: number
          user_id: string
        }
        Insert: {
          module?: Json | null
          op_id: string
          skill: number
          slot: number
          user_id?: string
        }
        Update: {
          module?: Json | null
          op_id?: string
          skill?: number
          slot?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "krooster_accounts"
            referencedColumns: ["user_id"]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
      | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
      | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
      | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
      | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
