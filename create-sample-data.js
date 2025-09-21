// Create sample data for testing
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yjqxbrkclfdxjprtptlw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqcXhicmtjbGZkeGpwcnRwdGx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQ1MTU0NCwiZXhwIjoyMDc0MDI3NTQ0fQ.q7mv99Ysd3dEca3t8n3qT_AJfkFT-W7nxE6k-OPkScs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createSampleData() {
  console.log('🎯 Creating sample data for testing...\n')
  
  try {
    // 1. Create sample batches
    console.log('📚 Creating sample batches...')
    const { data: batch1, error: batch1Error } = await supabase
      .from('batches')
      .insert({
        name: 'Class 10 - Science',
        description: 'Science batch for Class 10 students',
        subjects: ['Physics', 'Chemistry', 'Biology'],
        monthly_fee: 5000,
        start_date: '2024-01-01',
        end_date: '2024-12-31'
      })
      .select()
    
    if (batch1Error) {
      console.log('❌ Batch 1 creation failed:', batch1Error.message)
    } else {
      console.log('✅ Batch 1 created:', batch1[0].name)
    }
    
    const { data: batch2, error: batch2Error } = await supabase
      .from('batches')
      .insert({
        name: 'Class 12 - Mathematics',
        description: 'Mathematics batch for Class 12 students',
        subjects: ['Mathematics', 'Statistics'],
        monthly_fee: 6000,
        start_date: '2024-01-01',
        end_date: '2024-12-31'
      })
      .select()
    
    if (batch2Error) {
      console.log('❌ Batch 2 creation failed:', batch2Error.message)
    } else {
      console.log('✅ Batch 2 created:', batch2[0].name)
    }
    
    // 2. Create sample students
    console.log('\n👥 Creating sample students...')
    const students = [
      {
        student_id: 'STU001',
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '2008-05-15',
        gender: 'male',
        phone: '+1234567890',
        email: 'john.doe@example.com',
        address: '123 Main St, City',
        parent_name: 'Jane Doe',
        parent_phone: '+1234567891',
        parent_email: 'jane.doe@example.com'
      },
      {
        student_id: 'STU002',
        first_name: 'Alice',
        last_name: 'Smith',
        date_of_birth: '2007-08-22',
        gender: 'female',
        phone: '+1234567892',
        email: 'alice.smith@example.com',
        address: '456 Oak Ave, City',
        parent_name: 'Bob Smith',
        parent_phone: '+1234567893',
        parent_email: 'bob.smith@example.com'
      },
      {
        student_id: 'STU003',
        first_name: 'Mike',
        last_name: 'Johnson',
        date_of_birth: '2009-03-10',
        gender: 'male',
        phone: '+1234567894',
        email: 'mike.johnson@example.com',
        address: '789 Pine St, City',
        parent_name: 'Sarah Johnson',
        parent_phone: '+1234567895',
        parent_email: 'sarah.johnson@example.com'
      }
    ]
    
    for (const student of students) {
      const { data, error } = await supabase
        .from('students')
        .insert(student)
        .select()
      
      if (error) {
        console.log(`❌ Student ${student.student_id} creation failed:`, error.message)
      } else {
        console.log(`✅ Student ${student.student_id} created: ${student.first_name} ${student.last_name}`)
      }
    }
    
    // 3. Enroll students in batches
    console.log('\n📝 Enrolling students in batches...')
    const { data: allStudents } = await supabase.from('students').select('id, student_id')
    const { data: allBatches } = await supabase.from('batches').select('id, name')
    
    if (allStudents && allBatches) {
      // Enroll first two students in first batch
      for (let i = 0; i < Math.min(2, allStudents.length); i++) {
        const { error } = await supabase
          .from('student_batches')
          .insert({
            student_id: allStudents[i].id,
            batch_id: allBatches[0].id
          })
        
        if (error) {
          console.log(`❌ Enrollment failed for ${allStudents[i].student_id}:`, error.message)
        } else {
          console.log(`✅ ${allStudents[i].student_id} enrolled in ${allBatches[0].name}`)
        }
      }
      
      // Enroll third student in second batch
      if (allStudents[2] && allBatches[1]) {
        const { error } = await supabase
          .from('student_batches')
          .insert({
            student_id: allStudents[2].id,
            batch_id: allBatches[1].id
          })
        
        if (error) {
          console.log(`❌ Enrollment failed for ${allStudents[2].student_id}:`, error.message)
        } else {
          console.log(`✅ ${allStudents[2].student_id} enrolled in ${allBatches[1].name}`)
        }
      }
    }
    
    // 4. Create sample attendance records
    console.log('\n📅 Creating sample attendance records...')
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    if (allStudents && allBatches) {
      // Today's attendance for first batch
      for (let i = 0; i < Math.min(2, allStudents.length); i++) {
        const { error } = await supabase
          .from('attendance')
          .insert({
            student_id: allStudents[i].id,
            batch_id: allBatches[0].id,
            date: today,
            status: i === 0 ? 'present' : 'late'
          })
        
        if (error) {
          console.log(`❌ Attendance creation failed for ${allStudents[i].student_id}:`, error.message)
        } else {
          console.log(`✅ Attendance recorded for ${allStudents[i].student_id}`)
        }
      }
    }
    
    // 5. Create sample fee structure
    console.log('\n💰 Creating sample fee structure...')
    if (allBatches) {
      for (const batch of allBatches) {
        const { error } = await supabase
          .from('fee_structure')
          .insert({
            batch_id: batch.id,
            fee_type: 'monthly',
            amount: batch.name.includes('Class 10') ? 5000 : 6000,
            due_date: '2024-02-01'
          })
        
        if (error) {
          console.log(`❌ Fee structure creation failed for ${batch.name}:`, error.message)
        } else {
          console.log(`✅ Fee structure created for ${batch.name}`)
        }
      }
    }
    
    console.log('\n🎉 Sample data creation completed!')
    console.log('\n📊 Summary:')
    console.log('- 2 batches created')
    console.log('- 3 students created')
    console.log('- Students enrolled in batches')
    console.log('- Sample attendance records created')
    console.log('- Fee structure created')
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error.message)
  }
}

createSampleData()
