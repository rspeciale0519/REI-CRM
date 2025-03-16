-- Create company table
CREATE TABLE IF NOT EXISTS public.companies (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

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

-- Enable RLS for user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

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

-- Enable RLS for team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

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

-- Create RLS policies for companies
CREATE POLICY "Companies are viewable by authenticated users" ON public.companies
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Companies can be managed by admins" ON public.companies
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'::user_role
            AND ur.company_id = companies.id
        )
    );

-- Create RLS policies for user_roles
CREATE POLICY "User roles are viewable by authenticated users" ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy for first user to become admin of a new company
CREATE POLICY "First user becomes company admin" ON public.user_roles AS permissive
    FOR INSERT
    TO authenticated
    WITH CHECK (
        NOT EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.company_id = user_roles.company_id
        )
        AND user_roles.role = 'admin'::user_role
        AND user_roles.user_id = auth.uid()
    );

-- Policy for admins to manage roles within their company
CREATE POLICY "Admins can manage company roles" ON public.user_roles AS permissive
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles admin_roles
            WHERE admin_roles.user_id = auth.uid()
            AND admin_roles.role = 'admin'::user_role
            AND admin_roles.company_id = user_roles.company_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles admin_roles
            WHERE admin_roles.user_id = auth.uid()
            AND admin_roles.role = 'admin'::user_role
            AND admin_roles.company_id = user_roles.company_id
        )
    );

-- Create RLS policies for team_members
CREATE POLICY "Team members are viewable by company members" ON public.team_members AS permissive
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.company_id = team_members.company_id
        )
    );

CREATE POLICY "Team members can be managed by admins and managers" ON public.team_members AS permissive
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin'::user_role, 'manager'::user_role)
            AND ur.company_id = team_members.company_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin'::user_role, 'manager'::user_role)
            AND ur.company_id = team_members.company_id
        )
    );

-- Insert function for creating a new company with the first admin
CREATE OR REPLACE FUNCTION public.create_company_with_admin(
    company_name text,
    user_id uuid,
    user_email text,
    first_name text DEFAULT NULL,
    last_name text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_company_id uuid;
BEGIN
    -- Create the company
    INSERT INTO public.companies (name)
    VALUES (company_name)
    RETURNING id INTO new_company_id;

    -- Create the admin role
    INSERT INTO public.user_roles (user_id, company_id, role)
    VALUES (user_id, new_company_id, 'admin');

    -- Create the team member record
    INSERT INTO public.team_members (
        id,
        company_id,
        email,
        first_name,
        last_name,
        role,
        status
    )
    VALUES (
        user_id,
        new_company_id,
        user_email,
        first_name,
        last_name,
        'admin',
        'active'
    );

    RETURN new_company_id;
END;
$$; 