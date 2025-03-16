-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create enum types
create type property_status as enum ('available', 'under_contract', 'sold', 'off_market', 'pending');
create type property_type as enum ('single_family', 'multi_family', 'condo', 'townhouse', 'land', 'commercial');
create type deal_status as enum ('lead', 'prospect', 'under_contract', 'closed', 'cancelled');
create type task_priority as enum ('low', 'medium', 'high', 'urgent');
create type contact_type as enum ('buyer', 'seller', 'agent', 'vendor', 'other');

-- Create profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text,
  last_name text,
  phone text,
  company_name text,
  role text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create properties table
create table properties (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  status property_status default 'available',
  property_type property_type not null,
  address text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  price decimal(12,2),
  bedrooms integer,
  bathrooms decimal(3,1),
  square_feet decimal(10,2),
  lot_size decimal(10,2),
  year_built integer,
  description text,
  features jsonb,
  images jsonb[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create contacts table
create table contacts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  contact_type contact_type not null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  company text,
  address text,
  city text,
  state text,
  zip_code text,
  notes text,
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create deals table
create table deals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  property_id uuid references properties,
  buyer_id uuid references contacts,
  seller_id uuid references contacts,
  status deal_status default 'lead',
  name text not null,
  value decimal(12,2),
  expected_close_date date,
  actual_close_date date,
  commission decimal(12,2),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create tasks table
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  deal_id uuid references deals,
  contact_id uuid references contacts,
  property_id uuid references properties,
  title text not null,
  description text,
  due_date timestamptz,
  completed_at timestamptz,
  priority task_priority default 'medium',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create events/calendar table
create table events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  location text,
  deal_id uuid references deals,
  contact_id uuid references contacts,
  property_id uuid references properties,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create documents table
create table documents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  deal_id uuid references deals,
  property_id uuid references properties,
  contact_id uuid references contacts,
  name text not null,
  file_url text not null,
  file_type text,
  file_size integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create notes table for general notes
create table notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  deal_id uuid references deals,
  property_id uuid references properties,
  contact_id uuid references contacts,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create RLS policies
alter table profiles enable row level security;
alter table properties enable row level security;
alter table contacts enable row level security;
alter table deals enable row level security;
alter table tasks enable row level security;
alter table events enable row level security;
alter table documents enable row level security;
alter table notes enable row level security;

-- Create policies
create policy "Users can view own profile" 
  on profiles for select 
  using (auth.uid() = id);

create policy "Users can update own profile" 
  on profiles for update 
  using (auth.uid() = id);

create policy "Users can view own properties" 
  on properties for select 
  using (auth.uid() = user_id);

create policy "Users can insert own properties" 
  on properties for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own properties" 
  on properties for update 
  using (auth.uid() = user_id);

create policy "Users can delete own properties" 
  on properties for delete 
  using (auth.uid() = user_id);

-- Repeat similar policies for other tables
create policy "Users can view own contacts" 
  on contacts for select 
  using (auth.uid() = user_id);

create policy "Users can insert own contacts" 
  on contacts for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own contacts" 
  on contacts for update 
  using (auth.uid() = user_id);

create policy "Users can delete own contacts" 
  on contacts for delete 
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index idx_properties_user_id on properties(user_id);
create index idx_contacts_user_id on contacts(user_id);
create index idx_deals_user_id on deals(user_id);
create index idx_tasks_user_id on tasks(user_id);
create index idx_events_user_id on events(user_id);
create index idx_documents_user_id on documents(user_id);
create index idx_notes_user_id on notes(user_id);

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();

create trigger update_properties_updated_at
  before update on properties
  for each row
  execute function update_updated_at_column();

create trigger update_contacts_updated_at
  before update on contacts
  for each row
  execute function update_updated_at_column();

create trigger update_deals_updated_at
  before update on deals
  for each row
  execute function update_updated_at_column();

create trigger update_tasks_updated_at
  before update on tasks
  for each row
  execute function update_updated_at_column();

create trigger update_events_updated_at
  before update on events
  for each row
  execute function update_updated_at_column();

create trigger update_documents_updated_at
  before update on documents
  for each row
  execute function update_updated_at_column();

create trigger update_notes_updated_at
  before update on notes
  for each row
  execute function update_updated_at_column(); 