const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Supabase configuration
const supabaseUrl = 'https://tzjmxxhhvkptahmollzh.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6am14eGhodmtwdGFobW9sbHpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQ1Njk0NCwiZXhwIjoyMDc0MDMyOTQ0fQ.GKrh1nSPTawX9q29NwREG_mtIp39DgOJ2w9vQE9cbZY'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applySchemaManually() {
  try {
    console.log('🚀 Applying Multi-Institute Database Schema...')
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'supabase', 'multi-institute-schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('📝 Schema content loaded, length:', schema.length)
    console.log('💡 Please manually copy and paste the following schema into your Supabase SQL Editor:')
    console.log('=' * 80)
    console.log(schema)
    console.log('=' * 80)
    console.log('\n🔗 Go to: https://supabase.com/dashboard/project/tzjmxxhhvkptahmollzh/sql')
    console.log('📋 Copy the schema above and paste it into the SQL Editor')
    console.log('▶️  Click "Run" to execute the schema')
    console.log('\n✅ After applying the schema, the login should work!')
    
  } catch (error) {
    console.error('💥 Error:', error.message)
  }
}

// Run the script
applySchemaManually()
