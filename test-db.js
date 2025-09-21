// Test database connection
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yjqxbrkclfdxjprtptlw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqcXhicmtjbGZkeGpwcnRwdGx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQ1MTU0NCwiZXhwIjoyMDc0MDI3NTQ0fQ.q7mv99Ysd3dEca3t8n3qT_AJfkFT-W7nxE6k-OPkScs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  try {
    console.log('Testing database connection...')
    
    // Test if users table exists
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Database error:', error.message)
      console.log('This means the database schema needs to be set up.')
    } else {
      console.log('Database connection successful!')
      console.log('Users found:', data.length)
    }
  } catch (err) {
    console.error('Connection error:', err.message)
  }
}

testDatabase()
