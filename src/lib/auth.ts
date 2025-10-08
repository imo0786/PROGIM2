import { supabase } from './supabase';

export const authenticateUser = async (username: string, password: string) => {
  console.log('🔐 Starting authentication for user:', username);
  
  try {
    // Test 1: Try auth_users table first
    console.log('📊 Querying auth_users table...');
    const { data: authData, error: authError } = await supabase
      .from('auth_users')
      .select('*')
      .eq('username', username)
      .single();

    console.log('auth_users result:', { data: authData, error: authError });

    if (authData && !authError) {
      // Check password - try both plain text and password field
      if (authData.password === password || authData.password_hash === password) {
        console.log('✅ Authentication successful via auth_users');
        return {
          id: authData.id,
          username: authData.username,
          email: authData.email || `${username}@progim.com`,
          role: authData.role || 'user'
        };
      } else {
        console.log('❌ Password mismatch in auth_users');
      }
    }

    // Test 2: Try users table as alternative
    console.log('📊 Querying users table...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    console.log('users result:', { data: userData, error: userError });

    if (userData && !userError) {
      // Check password - try both plain text and password field
      if (userData.password === password || userData.password_hash === password) {
        console.log('✅ Authentication successful via users');
        return {
          id: userData.id,
          username: userData.username,
          email: userData.email || `${username}@progim.com`,
          role: userData.role || 'user'
        };
      } else {
        console.log('❌ Password mismatch in users');
      }
    }

  } catch (error) {
    console.error('🚨 Database connection error:', error);
  }

  // If all database attempts fail, return null
  console.log('❌ Authentication failed - user not found in database');
  return null;
};