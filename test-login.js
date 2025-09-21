// Test login directly
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yjqxbrkclfdxjprtptlw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqcXhicmtjbGZkeGpwcnRwdGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NTE1NDQsImV4cCI6MjA3NDAyNzU0NH0.vB1V3Hy0svapHV_fAtCUeBnLUqF2wPdxdra0sF-hwEM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLogin() {
  try {
    console.log('Testing login...')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@coaching.com',
      password: 'admin123456'
    })
    
    if (error) {
      console.error('Login error:', error.message)
    } else {
      console.log('Login successful!')
      console.log('User ID:', data.user.id)
      console.log('Email:', data.user.email)
    }
  } catch (err) {
    console.error('Login error:', err.message)
  }
}

testLogin()
