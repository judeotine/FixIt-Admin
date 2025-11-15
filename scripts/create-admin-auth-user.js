/**
 * Script to create a Supabase Auth user for the admin account
 * Run this after running the migration: supabase/migrations/002_add_admin_user.sql
 * 
 * Usage: 
 *   node scripts/create-admin-auth-user.js
 * 
 * Make sure your .env.local file has:
 *   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
 *   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
}

loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing required environment variables.');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminAuthUser() {
  const email = 'judextine28@gmail.com';
  const password = 'password';

  try {
    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }

    const userExists = existingUsers.users.some(user => user.email === email);

    if (userExists) {
      console.log(`User with email ${email} already exists in Supabase Auth.`);
      console.log('If you want to update the password, do it manually via the Supabase Dashboard.');
      return;
    }

    // Create the auth user
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: 'Admin User',
        role: 'admin'
      }
    });

    if (error) {
      console.error('Error creating auth user:', error);
      return;
    }

    console.log('✅ Successfully created Supabase Auth user!');
    console.log(`   Email: ${email}`);
    console.log(`   User ID: ${data.user.id}`);
    console.log('\nYou can now log in with:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createAdminAuthUser();

