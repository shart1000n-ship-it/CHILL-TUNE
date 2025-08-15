const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createSupabaseAdmin() {
  try {
    // Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@chillandtune.fm',
      password: 'admin123',
      email_confirm: true,
      user_metadata: { role: 'admin' }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return;
    }

    console.log('Admin user created in Supabase Auth:', authData.user.email);

    // You might also need to insert into your custom users table if you have one
    // This depends on your database schema

  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createSupabaseAdmin();
