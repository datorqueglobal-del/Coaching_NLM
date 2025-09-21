// Check user details
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yjqxbrkclfdxjprtptlw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqcXhicmtjbGZkeGpwcnRwdGx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQ1MTU0NCwiZXhwIjoyMDc0MDI3NTQ0fQ.q7mv99Ysd3dEca3t8n3qT_AJfkFT-W7nxE6k-OPkScs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUser() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
    
    if (error) {
      console.error('Error:', error.message)
    } else {
      console.log('Users in database:')
      console.log(JSON.stringify(data, null, 2))
    }
  } catch (err) {
    console.error('Error:', err.message)
  }
}

checkUser()
