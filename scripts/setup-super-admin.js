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

async function setupSuperAdmin() {
  try {
    console.log('🚀 Setting up Super Admin user...')
    
    // Create super admin user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@coaching.com',
      password: 'admin123',
      email_confirm: true,
    })

    if (authError) {
      console.error('❌ Error creating auth user:', authError.message)
      return
    }

    console.log('✅ Auth user created:', authData.user.email)

    // Create user record in public.users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: 'admin@coaching.com',
        role: 'super_admin',
        institute_id: null,
        is_active: true
      })
      .select()
      .single()

    if (userError) {
      console.error('❌ Error creating user record:', userError.message)
      return
    }

    console.log('✅ User record created:', userData.email, 'with role:', userData.role)
    console.log('\n🎉 Super Admin setup complete!')
    console.log('📧 Email: admin@coaching.com')
    console.log('🔑 Password: admin123')
    console.log('👑 Role: super_admin')
    
  } catch (error) {
    console.error('💥 Setup failed:', error.message)
  }
}

// Run the setup
setupSuperAdmin()
