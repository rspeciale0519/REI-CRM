-- Create company_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_url TEXT,
    business_hours TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (now the table exists)
DROP POLICY IF EXISTS "Users can view company settings" ON company_settings;
DROP POLICY IF EXISTS "Users can update company settings" ON company_settings;
DROP POLICY IF EXISTS "Company assets are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload company assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update company assets" ON storage.objects;

-- Create policies
CREATE POLICY "Users can view company settings"
    ON company_settings FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update company settings"
    ON company_settings FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Create storage bucket for company assets if it doesn't exist
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('company_assets', 'company_assets', true)
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Set up storage policies
CREATE POLICY "Company assets are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'company_assets');

CREATE POLICY "Users can upload company assets"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'company_assets' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update company assets"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'company_assets' AND
        auth.role() = 'authenticated'
    );

-- Insert default company settings if not exists
INSERT INTO company_settings (name)
SELECT 'REI CRM'
WHERE NOT EXISTS (SELECT 1 FROM company_settings); 