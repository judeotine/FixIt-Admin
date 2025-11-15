-- Insert admin user into admin_users table
INSERT INTO admin_users (email, name, role, is_active)
VALUES ('judextine28@gmail.com', 'Admin User', 'admin', true)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- Note: After running this migration, you need to create the Supabase Auth user separately.
-- The password cannot be set directly via SQL migration because Supabase Auth requires
-- specific bcrypt hashing that's handled by the Auth service.
--
-- To create the auth user with password "password", run the create-admin-auth-user.js script:
--   node scripts/create-admin-auth-user.js
--
-- Or manually create it via Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Click "Add User" > "Create new user"
-- 3. Email: judextine28@gmail.com
-- 4. Password: password
-- 5. Check "Auto Confirm User"

