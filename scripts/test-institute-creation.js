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

async function testInstituteCreation() {
  try {
    console.log('🧪 Testing Institute Creation...')
    
    // Test 1: Check if institutes table exists and is accessible
    console.log('\n1️⃣ Checking institutes table...')
    const { data: institutes, error: institutesError } = await supabase
      .from('institutes')
      .select('*')
      .limit(5)

    if (institutesError) {
      console.error('❌ Error accessing institutes table:', institutesError.message)
      return
    }

    console.log('✅ Institutes table accessible. Found', institutes.length, 'institutes')

    // Test 2: Try to create a test institute
    console.log('\n2️⃣ Testing institute creation...')
    const testInstitute = {
      name: 'Test Institute ' + Date.now(),
      contact_person: 'Test Contact',
      contact_email: 'test@institute.com',
      contact_phone: '+1234567890',
      address: 'Test Address',
      subscription_plan: 'basic',
      max_students: 100,
      subscription_status: 'trial'
    }

    const { data: newInstitute, error: createError } = await supabase
      .from('institutes')
      .insert(testInstitute)
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating institute:', createError.message)
      console.log('💡 This might be due to RLS policies blocking the insert')
    } else {
      console.log('✅ Institute created successfully:', newInstitute.name)
      
      // Clean up - delete the test institute
      const { error: deleteError } = await supabase
        .from('institutes')
        .delete()
        .eq('id', newInstitute.id)
      
      if (deleteError) {
        console.log('⚠️  Could not delete test institute:', deleteError.message)
      } else {
        console.log('✅ Test institute cleaned up')
      }
    }

    // Test 3: Check RLS status
    console.log('\n3️⃣ Checking RLS status...')
    const { data: rlsStatus, error: rlsError } = await supabase.rpc('exec', {
      sql: `
        SELECT schemaname, tablename, rowsecurity 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('institutes', 'users', 'students')
        ORDER BY tablename;
      `
    })

    if (rlsError) {
      console.log('⚠️  Could not check RLS status via RPC')
    } else {
      console.log('📊 RLS Status:', rlsStatus)
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message)
  }
}

// Run the test
testInstituteCreation()
