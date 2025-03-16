import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Initialize the Supabase client with environment variables and types
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a strongly typed Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper type for table names in our database
export type Tables = keyof Database['public']['Tables'];

// Helper types for database operations
export type TableRow<T extends Tables> = Database['public']['Tables'][T]['Row'];
export type InsertDto<T extends Tables> = Database['public']['Tables'][T]['Insert'];
export type UpdateDto<T extends Tables> = Database['public']['Tables'][T]['Update'];

// Auth helper functions
export const auth = {
  // Sign up a new user
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // Sign in an existing user
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out the current user
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get the current user session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Get the current user
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  }
};
