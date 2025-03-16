-- Create team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email text NOT NULL,
    first_name text,
    last_name text,
    role text NOT NULL,
    avatar_url text,
    status text NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'inactive')),
    invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    invited_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Team members are viewable by authenticated users" ON public.team_members
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Team members can be updated by admins and managers" ON public.team_members
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'manager')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Team members can be deleted by admins" ON public.team_members
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
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
CREATE TRIGGER handle_team_members_updated_at
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at(); 