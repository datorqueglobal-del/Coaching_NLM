// Setup script to create initial admin user
// Run this with: node scripts/setup-admin.js

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  const adminEmail = process.argv[2] || 'admin@coaching.com'
  const adminPassword = process.argv[3] || 'admin123456'

  try {
    console.log('Creating admin user...')
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    })

    if (authError) {
      console.error('Error creating auth user:', authError.message)
      return
    }

    console.log('Auth user created successfully')

    // Create user record
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: adminEmail,
        role: 'admin',
      })

    if (userError) {
      console.error('Error creating user record:', userError.message)
      return
    }

    console.log('Admin user created successfully!')
    console.log('Email:', adminEmail)
    console.log('Password:', adminPassword)
    console.log('You can now login to the admin dashboard.')

  } catch (error) {
    console.error('Error:', error.message)
  }
}

createAdminUser()
