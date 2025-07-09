import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          role: 'admin' | 'user';
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'user';
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          role?: 'admin' | 'user';
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          summary: string;
          description: string;
          status: 'pending' | 'in-progress' | 'completed';
          target_usd: number;
          raised_usd: number;
          kpi_jsonb: Record<string, any>;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          title: string;
          summary: string;
          description: string;
          status?: 'pending' | 'in-progress' | 'completed';
          target_usd: number;
          raised_usd?: number;
          kpi_jsonb?: Record<string, any>;
          image_url?: string | null;
        };
        Update: {
          title?: string;
          summary?: string;
          description?: string;
          status?: 'pending' | 'in-progress' | 'completed';
          target_usd?: number;
          raised_usd?: number;
          kpi_jsonb?: Record<string, any>;
          image_url?: string | null;
        };
      };
      donations: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          amount_usd: number;
          tx_hash: string | null;
          created_at: string;
        };
        Insert: {
          project_id: string;
          user_id: string;
          amount_usd: number;
          tx_hash?: string | null;
        };
        Update: {
          amount_usd?: number;
          tx_hash?: string | null;
        };
      };
      stories: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body_md: string;
          approved: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          body_md: string;
          approved?: boolean;
        };
        Update: {
          title?: string;
          body_md?: string;
          approved?: boolean;
        };
      };
      donee_submissions: {
        Row: {
          id: string;
          org_name: string;
          proposal_md: string;
          budget_usd: number;
          initial_kpis: Record<string, any>;
          submitted_by: string;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
        };
        Insert: {
          org_name: string;
          proposal_md: string;
          budget_usd: number;
          initial_kpis: Record<string, any>;
          submitted_by: string;
          status?: 'pending' | 'approved' | 'rejected';
        };
        Update: {
          status?: 'pending' | 'approved' | 'rejected';
        };
      };
    };
  };
};