// Types auto-generados para Supabase - Calendaria Multi-tenant
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
      audit_logs: {
        Row: {
          id: string
          company_id: string
          user_id: string | null
          action: string
          resource_type: string | null
          resource_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id?: string | null
          action: string
          resource_type?: string | null
          resource_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string | null
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_invoices: {
        Row: {
          id: string
          company_id: string
          invoice_number: string
          amount: number
          currency: string
          status: string
          due_date: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          invoice_number: string
          amount: number
          currency?: string
          status?: string
          due_date?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          invoice_number?: string
          amount?: number
          currency?: string
          status?: string
          due_date?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          logo_url: string | null
          website: string | null
          subscription_plan: Database["public"]["Enums"]["subscription_plan"]
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          max_users: number
          max_storage_gb: number
          subscription_expires_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          logo_url?: string | null
          website?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          max_users?: number
          max_storage_gb?: number
          subscription_expires_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          logo_url?: string | null
          website?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          max_users?: number
          max_storage_gb?: number
          subscription_expires_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      company_features: {
        Row: {
          id: string
          company_id: string
          feature_name: string
          is_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          feature_name: string
          is_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          feature_name?: string
          is_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_features_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_history: {
        Row: {
          id: string
          company_id: string
          old_plan: Database["public"]["Enums"]["subscription_plan"] | null
          new_plan: Database["public"]["Enums"]["subscription_plan"] | null
          changed_by: string | null
          reason: string | null
          effective_date: string
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          old_plan?: Database["public"]["Enums"]["subscription_plan"] | null
          new_plan?: Database["public"]["Enums"]["subscription_plan"] | null
          changed_by?: string | null
          reason?: string | null
          effective_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          old_plan?: Database["public"]["Enums"]["subscription_plan"] | null
          new_plan?: Database["public"]["Enums"]["subscription_plan"] | null
          changed_by?: string | null
          reason?: string | null
          effective_date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          id: string
          user_id: string
          permission_name: string
          is_granted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          permission_name: string
          is_granted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          permission_name?: string
          is_granted?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          id: string
          company_id: string
          email: string
          password_hash: string | null
          full_name: string
          avatar_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          is_active: boolean
          last_login: string | null
          email_verified: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          email: string
          password_hash?: string | null
          full_name: string
          avatar_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          is_active?: boolean
          last_login?: string | null
          email_verified?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          email?: string
          password_hash?: string | null
          full_name?: string
          avatar_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          is_active?: boolean
          last_login?: string | null
          email_verified?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      set_current_company: {
        Args: {
          company_id: string
        }
        Returns: void
      }
      promote_user_to_admin: {
        Args: {
          target_user_id: string
          promoted_by_user_id: string
        }
        Returns: Json
      }
      demote_admin_to_user: {
        Args: {
          target_user_id: string
          demoted_by_user_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      subscription_plan: "basic" | "premium" | "enterprise"
      subscription_status: "active" | "inactive" | "cancelled" | "expired"
      user_role: "super_admin" | "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Tipos de utilidad para trabajar con la base de datos
export type Company = Database['public']['Tables']['companies']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type CompanyFeature = Database['public']['Tables']['company_features']['Row']
export type UserPermission = Database['public']['Tables']['user_permissions']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']
export type BillingInvoice = Database['public']['Tables']['billing_invoices']['Row']
export type SubscriptionHistory = Database['public']['Tables']['subscription_history']['Row']

// Tipos para insert/update
export type CompanyInsert = Database['public']['Tables']['companies']['Insert']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type CompanyFeatureInsert = Database['public']['Tables']['company_features']['Insert']
export type UserPermissionInsert = Database['public']['Tables']['user_permissions']['Insert']

// Enums
export type SubscriptionPlan = Database['public']['Enums']['subscription_plan']
export type SubscriptionStatus = Database['public']['Enums']['subscription_status']
export type UserRole = Database['public']['Enums']['user_role']

// Tipos compuestos para vistas complejas
export interface CompanyWithUsers extends Company {
  users: User[]
  features: CompanyFeature[]
  user_count: number
  active_user_count: number
}

export interface UserWithPermissions extends User {
  permissions: UserPermission[]
  company: Company
}

export interface CompanyDashboard {
  company: Company
  total_users: number
  active_users: number
  subscription_expires_days: number
  enabled_features: string[]
  recent_activity: AuditLog[]
}

// Configuración de permisos por rol
export const ROLE_PERMISSIONS = {
  super_admin: [
    'manage_users',
    'manage_billing',
    'view_audit_logs',
    'manage_company',
    'access_all_features',
    'manage_roles',
    'delete_users',
    'export_data',
    'promote_users',
    'demote_users'
  ],
  admin: [
    'manage_users',
    'view_billing',
    'manage_calendar',
    'view_reports',
    'manage_team',
    'create_users'
  ],
  user: [
    'view_calendar',
    'manage_profile',
    'view_own_data'
  ]
} as const

// Features por plan de subscripción
export const PLAN_FEATURES = {
  basic: [
    'user_management',
    'basic_calendar',
    'profile_management'
  ],
  premium: [
    'user_management',
    'basic_calendar',
    'profile_management',
    'advanced_calendar',
    'billing_management',
    'reports'
  ],
  enterprise: [
    'user_management',
    'basic_calendar',
    'profile_management',
    'advanced_calendar',
    'billing_management',
    'reports',
    'audit_logs',
    'api_access',
    'custom_branding',
    'priority_support'
  ]
} as const
