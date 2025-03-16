-- Create roles enum
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'member');

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role user_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create initial admin policy that allows the first user to become admin
CREATE POLICY "First user becomes admin" ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        NOT EXISTS (SELECT 1 FROM public.user_roles)
        AND role = 'admin'
        AND user_id = auth.uid()
    );

-- Create policies
CREATE POLICY "User roles are viewable by authenticated users" ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy for admins to manage other users' roles
CREATE POLICY "Admins can manage user roles" ON public.user_roles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles admin_roles
            WHERE admin_roles.user_id = auth.uid()
            AND admin_roles.role = 'admin'::user_role
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles admin_roles
            WHERE admin_roles.user_id = auth.uid()
            AND admin_roles.role = 'admin'::user_role
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER handle_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at(); 