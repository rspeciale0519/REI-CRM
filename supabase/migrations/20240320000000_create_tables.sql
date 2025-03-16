-- Create company table
CREATE TABLE IF NOT EXISTS public.companies (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create roles enum
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'member');

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    role user_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, company_id, role)
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    email text NOT NULL,
    first_name text,
    last_name text,
    role user_role NOT NULL,
    avatar_url text,
    status text NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'inactive')),
    invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    invited_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(email, company_id)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER handle_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_team_members_updated_at
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at(); 