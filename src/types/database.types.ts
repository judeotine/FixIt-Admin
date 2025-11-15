export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: string;
          avatar_url: string | null;
          created_at: string;
          last_login: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: string;
          avatar_url?: string | null;
          created_at?: string;
          last_login?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: string;
          avatar_url?: string | null;
          created_at?: string;
          last_login?: string | null;
          is_active?: boolean;
        };
      };
      otp_codes: {
        Row: {
          id: string;
          admin_id: string;
          otp_hash: string;
          expires_at: string;
          attempts: number;
          used: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          otp_hash: string;
          expires_at: string;
          attempts?: number;
          used?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          otp_hash?: string;
          expires_at?: string;
          attempts?: number;
          used?: boolean;
          created_at?: string;
        };
      };
      admin_audit_logs: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          resource_type: string | null;
          resource_id: string | null;
          details: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          action: string;
          resource_type?: string | null;
          resource_id?: string | null;
          details?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          action?: string;
          resource_type?: string | null;
          resource_id?: string | null;
          details?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      login_attempts: {
        Row: {
          id: string;
          email: string;
          ip_address: string | null;
          success: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          ip_address?: string | null;
          success?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          ip_address?: string | null;
          success?: boolean;
          created_at?: string;
        };
      };
    };
  };
}

