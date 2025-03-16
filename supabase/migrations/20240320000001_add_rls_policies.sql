-- Enable RLS for all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for companies
CREATE POLICY "Companies are viewable by authenticated users"
    ON public.companies
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Companies can be managed by admins"
    ON public.companies
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
            AND company_id = companies.id
        )
    );

-- Create RLS policies for user_roles
CREATE POLICY "User roles are viewable by authenticated users"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "First user becomes company admin"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        NOT EXISTS (
            SELECT 1 FROM public.user_roles existing_roles
            WHERE existing_roles.company_id = user_roles.company_id
        )
        AND role = 'admin'
        AND user_id = auth.uid()
    );

CREATE POLICY "Admins can manage company roles"
    ON public.user_roles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles admin_roles
            WHERE admin_roles.user_id = auth.uid()
            AND admin_roles.role = 'admin'
            AND admin_roles.company_id = user_roles.company_id
        )
    );

-- Create RLS policies for team_members
CREATE POLICY "Team members are viewable by company members"
    ON public.team_members
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND company_id = team_members.company_id
        )
    );

CREATE POLICY "Team members can be managed by admins and managers"
    ON public.team_members
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'manager')
            AND company_id = team_members.company_id
        )
    );

-- Create helper function for company setup
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