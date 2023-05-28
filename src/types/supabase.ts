export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      ak_accounts: {
        Row: {
          account_name: string
          assistant: string | null
          default: boolean
          displayname: string
          friendcode: Json | null
          lastmodified: string | null
          level: number | null
          onboard: string | null
          server: string | null
          user_id: string
        }
        Insert: {
          account_name: string
          assistant?: string | null
          default: boolean
          displayname: string
          friendcode?: Json | null
          lastmodified?: string | null
          level?: number | null
          onboard?: string | null
          server?: string | null
          user_id: string
        }
        Update: {
          account_name?: string
          assistant?: string | null
          default?: boolean
          displayname?: string
          friendcode?: Json | null
          lastmodified?: string | null
          level?: number | null
          onboard?: string | null
          server?: string | null
          user_id?: string
        }
      }
      depot: {
        Row: {
          account_name: string
          crafting: boolean
          material_id: string
          stock: number
          user_id: string
        }
        Insert: {
          account_name: string
          crafting?: boolean
          material_id: string
          stock: number
          user_id: string
        }
        Update: {
          account_name?: string
          crafting?: boolean
          material_id?: string
          stock?: number
          user_id?: string
        }
      }
      goals: {
        Row: {
          account_name: string
          elite: number | null
          group_name: string
          level: number | null
          masteries: number[] | null
          modules: number[] | null
          op_id: string
          skill_level: number
          user_id: string
        }
        Insert: {
          account_name: string
          elite?: number | null
          group_name: string
          level?: number | null
          masteries?: number[] | null
          modules?: number[] | null
          op_id: string
          skill_level: number
          user_id: string
        }
        Update: {
          account_name?: string
          elite?: number | null
          group_name?: string
          level?: number | null
          masteries?: number[] | null
          modules?: number[] | null
          op_id?: string
          skill_level?: number
          user_id?: string
        }
      }
      groups: {
        Row: {
          group_name: string
          user_id: string
        }
        Insert: {
          group_name: string
          user_id: string
        }
        Update: {
          group_name?: string
          user_id?: string
        }
      }
      krooster_accounts: {
        Row: {
          discordcode: Json | null
          lastmodified: string
          private: boolean
          reddituser: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          discordcode?: Json | null
          lastmodified: string
          private: boolean
          reddituser?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          discordcode?: Json | null
          lastmodified?: string
          private?: boolean
          reddituser?: string | null
          user_id?: string
          username?: string | null
        }
      }
      operators: {
        Row: {
          account_name: string
          elite: number
          favorite: boolean
          level: number
          masteries: number[] | null
          modules: number[] | null
          op_id: string
          potential: number
          skill_level: number
          skin: string | null
          user_id: string
        }
        Insert: {
          account_name: string
          elite: number
          favorite: boolean
          level: number
          masteries?: number[] | null
          modules?: number[] | null
          op_id: string
          potential: number
          skill_level: number
          skin?: string | null
          user_id: string
        }
        Update: {
          account_name?: string
          elite?: number
          favorite?: boolean
          level?: number
          masteries?: number[] | null
          modules?: number[] | null
          op_id?: string
          potential?: number
          skill_level?: number
          skin?: string | null
          user_id?: string
        }
      }
      presets: {
        Row: {
          elite: number | null
          level: number | null
          masteries: number[] | null
          modules: number[] | null
          name: string
          potential: number | null
          skill_level: number | null
          user_id: string
        }
        Insert: {
          elite?: number | null
          level?: number | null
          masteries?: number[] | null
          modules?: number[] | null
          name: string
          potential?: number | null
          skill_level?: number | null
          user_id: string
        }
        Update: {
          elite?: number | null
          level?: number | null
          masteries?: number[] | null
          modules?: number[] | null
          name?: string
          potential?: number | null
          skill_level?: number | null
          user_id?: string
        }
      }
      supports: {
        Row: {
          account_name: string
          module: number | null
          op_id: string
          skill: number
          slot: number
          user_id: string
        }
        Insert: {
          account_name: string
          module?: number | null
          op_id: string
          skill: number
          slot: number
          user_id: string
        }
        Update: {
          account_name?: string
          module?: number | null
          op_id?: string
          skill?: number
          slot?: number
          user_id?: string
        }
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
