/**
 * Database Types - Generated from Supabase Schema
 * v1.0.0
 */

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
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'checking' | 'savings' | 'investment' | 'credit' | 'other'
          balance: number
          currency: string
          color: string | null
          icon: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'checking' | 'savings' | 'investment' | 'credit' | 'other'
          balance?: number
          currency?: string
          color?: string | null
          icon?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          type?: 'checking' | 'savings' | 'investment' | 'credit' | 'other'
          balance?: number
          currency?: string
          color?: string | null
          icon?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string
          amount: number
          type: 'income' | 'expense' | 'transfer'
          category_id: string | null
          description: string | null
          date: string
          notes: string | null
          tags: string[] | null
          attachments: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id: string
          amount: number
          type: 'income' | 'expense' | 'transfer'
          category_id?: string | null
          description?: string | null
          date: string
          notes?: string | null
          tags?: string[] | null
          attachments?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          amount?: number
          type?: 'income' | 'expense' | 'transfer'
          category_id?: string | null
          description?: string | null
          date?: string
          notes?: string | null
          tags?: string[] | null
          attachments?: string[] | null
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          color: string
          icon: string
          parent_id: string | null
          order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          color?: string
          icon?: string
          parent_id?: string | null
          order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          type?: 'income' | 'expense'
          color?: string
          icon?: string
          parent_id?: string | null
          order?: number
          is_active?: boolean
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: number
          period: 'weekly' | 'monthly' | 'yearly'
          start_date: string
          end_date: string | null
          alert_percentage: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          amount: number
          period?: 'weekly' | 'monthly' | 'yearly'
          start_date: string
          end_date?: string | null
          alert_percentage?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          amount?: number
          period?: 'weekly' | 'monthly' | 'yearly'
          start_date?: string
          end_date?: string | null
          alert_percentage?: number
          is_active?: boolean
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          target_amount: number
          current_amount: number
          deadline: string | null
          icon: string | null
          color: string | null
          is_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          target_amount: number
          current_amount?: number
          deadline?: string | null
          icon?: string | null
          color?: string | null
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          target_amount?: number
          current_amount?: number
          deadline?: string | null
          icon?: string | null
          color?: string | null
          is_completed?: boolean
          updated_at?: string
        }
      }
      recurring_transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string
          amount: number
          type: 'income' | 'expense'
          category_id: string | null
          description: string
          frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
          next_date: string
          end_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id: string
          amount: number
          type: 'income' | 'expense'
          category_id?: string | null
          description: string
          frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
          next_date: string
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          amount?: number
          type?: 'income' | 'expense'
          category_id?: string | null
          description?: string
          frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
          next_date?: string
          end_date?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      dashboard_settings: {
        Row: {
          id: string
          user_id: string
          widgets: Json
          layout_mode: string
          theme: string | null
          preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          widgets: Json
          layout_mode?: string
          theme?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          widgets?: Json
          layout_mode?: string
          theme?: string | null
          preferences?: Json | null
          updated_at?: string
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
  }
}
