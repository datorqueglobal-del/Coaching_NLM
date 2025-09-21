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

async function setupMultiInstituteDatabase() {
  try {
    console.log('🚀 Setting up Multi-Institute Database Schema...')
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'supabase', 'multi-institute-schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`)
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error.message)
          // Continue with next statement
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
        }
      } catch (err) {
        console.error(`❌ Exception in statement ${i + 1}:`, err.message)
      }
    }
    
    console.log('🎉 Database schema setup completed!')
    
    // Test the setup by checking if tables exist
    console.log('🔍 Verifying table creation...')
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['institutes', 'users', 'students', 'batches', 'attendance', 'fee_payments'])
    
    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError.message)
    } else {
      console.log('✅ Tables created successfully:', tables.map(t => t.table_name))
    }
    
  } catch (error) {
    console.error('💥 Setup failed:', error.message)
    process.exit(1)
  }
}

// Run the setup
setupMultiInstituteDatabase()
