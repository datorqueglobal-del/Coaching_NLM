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

async function applySchema() {
  try {
    console.log('🚀 Applying Multi-Institute Database Schema...')
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'supabase', 'multi-institute-schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('📝 Executing schema...')
    
    // Execute the entire schema as one query
    const { data, error } = await supabase.rpc('exec', { sql: schema })
    
    if (error) {
      console.error('❌ Error applying schema:', error.message)
      console.log('💡 Please manually copy and paste the schema from supabase/multi-institute-schema.sql into your Supabase SQL Editor')
    } else {
      console.log('✅ Schema applied successfully!')
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message)
    console.log('💡 Please manually copy and paste the schema from supabase/multi-institute-schema.sql into your Supabase SQL Editor')
  }
}

// Run the setup
applySchema()
