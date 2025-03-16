-- Create enum for predefined role types
CREATE TYPE role_type AS ENUM ('admin', 'manager', 'user');

-- Create company_roles table
CREATE TABLE IF NOT EXISTS company_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type role_type NOT NULL DEFAULT 'user',
    description TEXT,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS company_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID REFERENCES company_roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES company_permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    PRIMARY KEY (role_id, permission_id)
);

-- Create user_roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES company_roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    PRIMARY KEY (user_id, role_id)
);

-- Enable RLS
ALTER TABLE company_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view roles"
    ON company_roles FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can modify roles"
    ON company_roles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN company_roles cr ON ur.role_id = cr.id
            WHERE ur.user_id = auth.uid()
            AND cr.type = 'admin'
        )
    );

CREATE POLICY "Users can view permissions"
    ON company_permissions FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can modify permissions"
    ON company_permissions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN company_roles cr ON ur.role_id = cr.id
            WHERE ur.user_id = auth.uid()
            AND cr.type = 'admin'
        )
    );

CREATE POLICY "Users can view role permissions"
    ON role_permissions FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can modify role permissions"
    ON role_permissions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN company_roles cr ON ur.role_id = cr.id
            WHERE ur.user_id = auth.uid()
            AND cr.type = 'admin'
        )
    );

CREATE POLICY "Users can view user roles"
    ON user_roles FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can modify user roles"
    ON user_roles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN company_roles cr ON ur.role_id = cr.id
            WHERE ur.user_id = auth.uid()
            AND cr.type = 'admin'
        )
    );

-- Insert default roles
INSERT INTO company_roles (name, type, description, is_custom) VALUES
    ('Administrator', 'admin', 'Full access to all system features and settings', false),
    ('Manager', 'manager', 'Can manage team members and most company settings', false),
    ('User', 'user', 'Basic access to personal settings and features', false);

-- Insert default permissions
INSERT INTO company_permissions (name, description, category) VALUES
    -- Company Settings permissions
    ('company.settings.view', 'View company settings', 'company_settings'),
    ('company.settings.edit', 'Edit company settings', 'company_settings'),
    ('company.branding.manage', 'Manage company branding', 'company_settings'),
    ('company.billing.manage', 'Manage billing and subscriptions', 'company_settings'),
    
    -- User Management permissions
    ('users.view', 'View user list', 'user_management'),
    ('users.invite', 'Invite new users', 'user_management'),
    ('users.manage', 'Manage user accounts', 'user_management'),
    ('roles.manage', 'Manage user roles', 'user_management'),
    
    -- Team Management permissions
    ('team.view', 'View team members', 'team_management'),
    ('team.manage', 'Manage team members', 'team_management'),
    
    -- Integration permissions
    ('integrations.view', 'View integrations', 'integrations'),
    ('integrations.manage', 'Manage integrations', 'integrations');

-- Assign permissions to default roles
-- Admin role gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM company_roles WHERE type = 'admin'),
    id
FROM company_permissions;

-- Manager role gets most permissions except critical ones
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM company_roles WHERE type = 'manager'),
    id
FROM company_permissions
WHERE name NOT IN ('company.billing.manage', 'roles.manage');

-- User role gets basic permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM company_roles WHERE type = 'user'),
    id
FROM company_permissions
WHERE name IN ('company.settings.view', 'team.view');

-- Create function to check if a user has a specific permission
CREATE OR REPLACE FUNCTION has_permission(user_id UUID, permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN company_permissions cp ON rp.permission_id = cp.id
        WHERE ur.user_id = user_id
        AND cp.name = permission_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 