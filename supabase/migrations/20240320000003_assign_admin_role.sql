-- Set rob@thespeciales.com as company admin
DO $$ 
DECLARE
    v_user_id uuid;
    v_company_id uuid;
BEGIN
    -- Get the user ID
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'rob@thespeciales.com';

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email rob@thespeciales.com not found';
    END IF;

    -- Create a default company if none exists
    INSERT INTO companies (name)
    VALUES ('ABC Realty')
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_company_id;

    -- If company wasn't created (due to conflict), get the existing one
    IF v_company_id IS NULL THEN
        SELECT id INTO v_company_id
        FROM companies
        LIMIT 1;
    END IF;

    -- Insert or update user_roles entry
    INSERT INTO user_roles (user_id, company_id, role)
    VALUES (v_user_id, v_company_id, 'admin')
    ON CONFLICT (user_id, company_id, role)
    DO UPDATE SET role = 'admin';

    -- Insert or update team_members entry
    INSERT INTO team_members (id, company_id, email, role, status)
    VALUES (v_user_id, v_company_id, 'rob@thespeciales.com', 'admin', 'active')
    ON CONFLICT (id) DO UPDATE 
    SET company_id = EXCLUDED.company_id,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        status = EXCLUDED.status;
END
$$; 