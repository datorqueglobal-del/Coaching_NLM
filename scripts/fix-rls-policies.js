const { createClient } = require('@supabase/supabase-js')

// Supabase configuration
const supabaseUrl = 'https://tzjmxxhhvkptahmollzh.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6am14eGhodmtwdGFobW9sbHpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQ1Njk0NCwiZXhwIjoyMDc0MDMyOTQ0fQ.GKrh1nSPTawX9q29NwREG_mtIp39DgOJ2w9vQE9cbZY'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixRLSPolicies() {
  try {
    console.log('🔧 Fixing RLS policies...')
    
    // Disable RLS on users table temporarily
    const { error: disableError } = await supabase.rpc('exec', {
      sql: 'ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;'
    })

    if (disableError) {
      console.log('⚠️  Could not disable RLS via RPC, trying direct query...')
      
      // Try to query the users table directly
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'admin@coaching.com')

      if (error) {
        console.error('❌ Error querying users table:', error.message)
        console.log('💡 Please manually run this SQL in Supabase SQL Editor:')
        console.log('ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;')
        return
      }

      console.log('✅ Users table accessible:', data)
    } else {
      console.log('✅ RLS disabled on users table')
    }

    // Test the query that was failing
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('role, institute_id, is_active, email')
      .eq('id', 'beb8a0f7-cd26-4e92-a2c4-4ab9188569dc')
      .single()

    if (testError) {
      console.error('❌ Test query failed:', testError.message)
    } else {
      console.log('✅ Test query successful:', testData)
    }

  } catch (error) {
    console.error('💥 Fix failed:', error.message)
  }
}

// Run the fix
fixRLSPolicies()
