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

async function addSuperAdminRole() {
  try {
    console.log('🚀 Adding Super Admin role...')
    
    // Get the user ID from auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError.message)
      return
    }

    // Find the admin user
    const adminUser = authUsers.users.find(user => user.email === 'admin@coaching.com')
    
    if (!adminUser) {
      console.error('❌ Admin user not found in auth.users')
      console.log('Available users:', authUsers.users.map(u => u.email))
      return
    }

    console.log('✅ Found admin user:', adminUser.email, 'ID:', adminUser.id)

    // Check if user record already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', adminUser.id)
      .single()

    if (existingUser) {
      console.log('✅ User record already exists:', existingUser.email, 'Role:', existingUser.role)
      return
    }

    // Create user record in public.users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: adminUser.id,
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
    console.log('🔑 Password: [your existing password]')
    console.log('👑 Role: super_admin')
    
  } catch (error) {
    console.error('💥 Setup failed:', error.message)
  }
}

// Run the setup
addSuperAdminRole()
