const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://tzjmxxhhvkptahmollzh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6am14eGhodmtwdGFobW9sbHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NTY5NDQsImV4cCI6MjA3NDAzMjk0NH0.Qd56LmddBmb1vqErSNos2yDYFqtbnCJrK5TfHpzzqyY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLogin() {
  console.log('Testing login with admin@coaching.com...')
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@coaching.com',
      password: 'admin123'
    })

    if (error) {
      console.error('Login error:', error.message)
      return
    }

    if (data.user) {
      console.log('✅ Login successful!')
      console.log('User ID:', data.user.id)
      console.log('Email:', data.user.email)
      console.log('Email confirmed:', data.user.email_confirmed_at)
      
      // Test fetching user role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, institute_id, is_active, email')
        .eq('id', data.user.id)
        .single()

      if (userError) {
        console.error('Error fetching user role:', userError.message)
      } else {
        console.log('✅ User role fetched successfully!')
        console.log('Role:', userData.role)
        console.log('Institute ID:', userData.institute_id)
        console.log('Is Active:', userData.is_active)
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testLogin()
