import { Database } from '@supabase/supabase-js';

// Enum types matching our database enums
export type PropertyStatus = 'available' | 'under_contract' | 'sold' | 'off_market' | 'pending';
export type PropertyType = 'single_family' | 'multi_family' | 'condo' | 'townhouse' | 'land' | 'commercial';
export type DealStatus = 'lead' | 'prospect' | 'under_contract' | 'closed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ContactType = 'buyer' | 'seller' | 'agent' | 'vendor' | 'other';

// Base interface for common fields
interface BaseModel {
  created_at: string;
  updated_at: string;
}

// Profile interface (extends auth.users)
export interface Profile extends BaseModel {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  company_name: string | null;
  role: string | null;
  avatar_url: string | null;
}

// Property interface
export interface Property extends BaseModel {
  id: string;
  user_id: string;
  status: PropertyStatus;
  property_type: PropertyType;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  lot_size: number | null;
  year_built: number | null;
  description: string | null;
  features: Record<string, any> | null;
  images: string[] | null;
}

// Contact interface
export interface Contact extends BaseModel {
  id: string;
  user_id: string;
  contact_type: ContactType;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  notes: string | null;
  tags: string[] | null;
}

// Deal interface
export interface Deal extends BaseModel {
  id: string;
  user_id: string;
  property_id: string | null;
  buyer_id: string | null;
  seller_id: string | null;
  status: DealStatus;
  name: string;
  value: number | null;
  expected_close_date: string | null;
  actual_close_date: string | null;
  commission: number | null;
  notes: string | null;
}

// Task interface
export interface Task extends BaseModel {
  id: string;
  user_id: string;
  deal_id: string | null;
  contact_id: string | null;
  property_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  completed_at: string | null;
  priority: TaskPriority;
}

// Event interface
export interface Event extends BaseModel {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  deal_id: string | null;
  contact_id: string | null;
  property_id: string | null;
}

// Document interface
export interface Document extends BaseModel {
  id: string;
  user_id: string;
  deal_id: string | null;
  property_id: string | null;
  contact_id: string | null;
  name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
}

// Note interface
export interface Note extends BaseModel {
  id: string;
  user_id: string;
  deal_id: string | null;
  property_id: string | null;
  contact_id: string | null;
  content: string;
}

// Database interface for Supabase
export interface DatabaseSchema {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      properties: {
        Row: Property;
        Insert: Omit<Property, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Property, 'id' | 'created_at' | 'updated_at'>>;
      };
      contacts: {
        Row: Contact;
        Insert: Omit<Contact, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Contact, 'id' | 'created_at' | 'updated_at'>>;
      };
      deals: {
        Row: Deal;
        Insert: Omit<Deal, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Deal, 'id' | 'created_at' | 'updated_at'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>;
      };
      documents: {
        Row: Document;
        Insert: Omit<Document, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Document, 'id' | 'created_at' | 'updated_at'>>;
      };
      notes: {
        Row: Note;
        Insert: Omit<Note, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Note, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Functions: {
      [key: string]: unknown;
    };
    Enums: {
      property_status: PropertyStatus;
      property_type: PropertyType;
      deal_status: DealStatus;
      task_priority: TaskPriority;
      contact_type: ContactType;
    };
  };
} 