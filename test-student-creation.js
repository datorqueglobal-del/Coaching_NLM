// Test student creation with proper user account
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yjqxbrkclfdxjprtptlw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqcXhicmtjbGZkeGpwcnRwdGx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQ1MTU0NCwiZXhwIjoyMDc0MDI3NTQ0fQ.q7mv99Ysd3dEca3t8n3qT_AJfkFT-W7nxE6k-OPkScs'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestStudent() {
  console.log('🎯 Creating test student with user account...\n')
  
  try {
    const testEmail = 'test.student@example.com'
    const testPassword = 'test123456'
    
    // 1. Create user account
    console.log('👤 Creating user account...')
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    })
    
    if (authError) {
      console.error('❌ Auth error:', authError.message)
      return
    }
    
    console.log('✅ User account created:', authData.user.id)
    
    // 2. Create user record
    console.log('👥 Creating user record...')
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: testEmail,
        role: 'student',
      })
    
    if (userError) {
      console.error('❌ User record error:', userError.message)
      return
    }
    
    console.log('✅ User record created')
    
    // 3. Create student record
    console.log('🎓 Creating student record...')
    const { error: studentError } = await supabaseAdmin
      .from('students')
      .insert({
        user_id: authData.user.id,
        student_id: `TEST${Date.now().toString().slice(-4)}`,
        first_name: 'Test',
        last_name: 'Student',
        date_of_birth: '2010-01-01',
        gender: 'male',
        phone: '+1234567890',
        email: testEmail,
        address: '123 Test Street',
        parent_name: 'Test Parent',
        parent_phone: '+1234567891',
        parent_email: 'test.parent@example.com',
      })
    
    if (studentError) {
      console.error('❌ Student record error:', studentError.message)
      return
    }
    
    console.log('✅ Student record created')
    
    // 4. Test login
    console.log('\n🔐 Testing login...')
    const { data: loginData, error: loginError } = await supabaseAdmin.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })
    
    if (loginError) {
      console.error('❌ Login error:', loginError.message)
    } else {
      console.log('✅ Login successful!')
      console.log('📧 Email:', loginData.user.email)
      console.log('🆔 User ID:', loginData.user.id)
    }
    
    console.log('\n🎉 Test student creation completed!')
    console.log('\n📋 Credentials:')
    console.log('Email:', testEmail)
    console.log('Password:', testPassword)
    console.log('\n💡 Both student and parent can use these credentials to login!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

createTestStudent()
