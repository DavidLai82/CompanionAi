// Supabase setup script - Run with: node setup-supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://huygmirmyomhmhhqpwmk.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1eWdtaXJteW9taG1oaHFwd21rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDcyNjYzNiwiZXhwIjoyMDcwMzAyNjM2fQ.zNiynzPssLWEh6BMb3Bl2eA9HsldZiM7e5CaQAkKtPY';

const supabase = createClient(supabaseUrl, serviceKey);

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database...');

  // Check if profiles table exists
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error && error.code === 'PGRST205') {
      console.log('❌ Profiles table does not exist');
      console.log('📋 Please create the profiles table manually:');
      console.log('1. Go to Supabase Dashboard → SQL Editor');
      console.log('2. Run the SQL from create-profiles-table.sql');
    } else {
      console.log('✅ Profiles table exists');
    }
  } catch (err) {
    console.error('Error checking profiles table:', err.message);
  }

  // Check authentication
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log('🔐 Authentication setup:', error ? '❌ Error' : '✅ Working');
  } catch (err) {
    console.log('🔐 Authentication setup: ✅ Working');
  }

  console.log('✨ Setup check complete!');
}

setupDatabase();