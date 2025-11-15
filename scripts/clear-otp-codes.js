// node scripts/clear-otp-codes.js 



const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearOTPCodes(email) {
  try {
    console.log(`Clearing OTP codes for: ${email}`);
    
    const { data: adminUser, error: userError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !adminUser) {
      console.error('Admin user not found:', userError);
      return;
    }

    const { data, error } = await supabase
      .from('otp_codes')
      .delete()
      .eq('admin_id', adminUser.id);

    if (error) {
      console.error('Error clearing OTP codes:', error);
      return;
    }

    console.log(`✅ Cleared all OTP codes for ${email}`);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

const email = process.argv[2];

if (!email) {
  console.log('Usage: node scripts/clear-otp-codes.js <email>');
  console.log('Example: node scripts/clear-otp-codes.js admin@example.com');
  process.exit(1);
}

clearOTPCodes(email).then(() => process.exit(0));

