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

async function testMultiInstituteSystem() {
  try {
    console.log('🧪 Testing Multi-Institute System...\n')

    // Test 1: Check if tables exist
    console.log('1️⃣ Checking database tables...')
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['institutes', 'users', 'students', 'batches', 'attendance', 'fee_payments'])

    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError.message)
      return
    }

    const tableNames = tables?.map(t => t.table_name) || []
    console.log('✅ Tables found:', tableNames)

    // Test 2: Check if super admin exists
    console.log('\n2️⃣ Checking Super Admin user...')
    const { data: superAdmin, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'super_admin')
      .single()

    if (adminError) {
      console.error('❌ Error checking super admin:', adminError.message)
    } else if (superAdmin) {
      console.log('✅ Super Admin found:', superAdmin.username)
    } else {
      console.log('⚠️  Super Admin not found - this is expected for a fresh database')
    }

    // Test 3: Check if sample institute exists
    console.log('\n3️⃣ Checking sample institute...')
    const { data: institutes, error: instituteError } = await supabase
      .from('institutes')
      .select('*')

    if (instituteError) {
      console.error('❌ Error checking institutes:', instituteError.message)
    } else {
      console.log('✅ Institutes found:', institutes?.length || 0)
      if (institutes && institutes.length > 0) {
        console.log('   Sample institute:', institutes[0].name)
      }
    }

    // Test 4: Test user creation
    console.log('\n4️⃣ Testing user creation...')
    const testUsername = 'test.coaching.admin'
    const testPassword = 'test123'

    // First, create a test institute if none exists
    let testInstituteId
    if (!institutes || institutes.length === 0) {
      console.log('   Creating test institute...')
      const { data: newInstitute, error: instituteCreateError } = await supabase
        .from('institutes')
        .insert({
          name: 'Test Institute',
          contact_person: 'Test Contact',
          contact_email: 'test@institute.com',
          contact_phone: '+1234567890',
          address: 'Test Address',
          subscription_status: 'active',
          subscription_plan: 'basic',
          max_students: 100
        })
        .select()
        .single()

      if (instituteCreateError) {
        console.error('❌ Error creating test institute:', instituteCreateError.message)
        return
      }
      testInstituteId = newInstitute.id
      console.log('✅ Test institute created:', newInstitute.name)
    } else {
      testInstituteId = institutes[0].id
    }

    // Create a test coaching admin
    const { data: newAdmin, error: adminCreateError } = await supabase
      .from('users')
      .insert({
        username: testUsername,
        password_hash: testPassword,
        role: 'coaching_admin',
        institute_id: testInstituteId,
        is_active: true
      })
      .select()
      .single()

    if (adminCreateError) {
      console.error('❌ Error creating test admin:', adminCreateError.message)
    } else {
      console.log('✅ Test coaching admin created:', newAdmin.username)
    }

    // Test 5: Test student creation
    console.log('\n5️⃣ Testing student creation...')
    const { data: newStudent, error: studentCreateError } = await supabase
      .from('students')
      .insert({
        user_id: newAdmin.id, // This should be a separate user record
        institute_id: testInstituteId,
        student_id: 'STU001',
        first_name: 'Test',
        last_name: 'Student',
        date_of_birth: '2010-01-01',
        gender: 'male',
        phone: '+1234567890',
        email: 'test.student@example.com',
        address: 'Test Address',
        parent_name: 'Test Parent',
        parent_phone: '+1234567890',
        parent_email: 'parent@example.com',
        is_active: true
      })
      .select()
      .single()

    if (studentCreateError) {
      console.error('❌ Error creating test student:', studentCreateError.message)
    } else {
      console.log('✅ Test student created:', newStudent.first_name, newStudent.last_name)
    }

    console.log('\n🎉 Multi-Institute System Test Completed!')
    console.log('\n📋 Next Steps:')
    console.log('1. Apply the database schema in Supabase SQL Editor')
    console.log('2. Start the development server: npm run dev')
    console.log('3. Test login with: superadmin / superadmin123')
    console.log('4. Create institutes and coaching admins through the UI')

  } catch (error) {
    console.error('💥 Test failed:', error.message)
  }
}

// Run the test
testMultiInstituteSystem()
