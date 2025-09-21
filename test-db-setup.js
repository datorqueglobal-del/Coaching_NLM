// Test database setup
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yjqxbrkclfdxjprtptlw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqcXhicmtjbGZkeGpwcnRwdGx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQ1MTU0NCwiZXhwIjoyMDc0MDI3NTQ0fQ.q7mv99Ysd3dEca3t8n3qT_AJfkFT-W7nxE6k-OPkScs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabaseSetup() {
  console.log('🔍 Testing database setup...\n')
  
  const tables = ['users', 'students', 'batches', 'student_batches', 'attendance', 'fee_structure', 'fee_payments', 'notifications']
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`)
      } else {
        console.log(`✅ ${table}: OK (${data.length} records)`)
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`)
    }
  }
  
  console.log('\n🎯 Testing sample data creation...')
  
  // Test creating a sample batch
  try {
    const { data, error } = await supabase
      .from('batches')
      .insert({
        name: 'Test Batch 2024',
        description: 'Test batch for verification',
        subjects: ['Math', 'Science'],
        monthly_fee: 5000,
        start_date: '2024-01-01',
        end_date: '2024-12-31'
      })
      .select()
    
    if (error) {
      console.log('❌ Batch creation failed:', error.message)
    } else {
      console.log('✅ Batch creation successful:', data[0].name)
      
      // Clean up test data
      await supabase.from('batches').delete().eq('id', data[0].id)
      console.log('🧹 Test data cleaned up')
    }
  } catch (err) {
    console.log('❌ Batch creation error:', err.message)
  }
}

testDatabaseSetup()
