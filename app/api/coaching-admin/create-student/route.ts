import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { 
      student_id,
      first_name,
      last_name,
      date_of_birth,
      gender,
      phone,
      address,
      parent_name,
      parent_phone,
      parent_email,
      institute_id,
      batch_ids
    } = await request.json()

    if (!institute_id || !first_name || !last_name) {
      return NextResponse.json(
        { error: 'Institute ID, first name, and last name are required' },
        { status: 400 }
      )
    }

    // Ensure batch_ids is an array
    const batchIdsArray = Array.isArray(batch_ids) ? batch_ids : (batch_ids ? [batch_ids] : [])
    
    console.log('Received batch_ids:', batch_ids, 'Type:', typeof batch_ids)
    console.log('Processed batchIdsArray:', batchIdsArray)

    // Get institute name for email generation
    const { data: instituteData, error: instituteError } = await supabaseAdmin
      .from('institutes')
      .select('name')
      .eq('id', institute_id)
      .single()

    if (instituteError || !instituteData) {
      return NextResponse.json(
        { error: 'Institute not found' },
        { status: 400 }
      )
    }

    // Generate email: firstname.lastname@institutename.com
    const instituteName = instituteData.name.toLowerCase().replace(/\s+/g, '')
    const email = `${first_name.toLowerCase()}.${last_name.toLowerCase()}@${instituteName}.com`

    // Generate random password: institutename + random 4 digits
    const randomDigits = Math.floor(1000 + Math.random() * 9000)
    const password = `${instituteName}${randomDigits}`

    // Create user in Supabase Auth with confirmed email
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password, // Generated password
      email_confirm: true, // Automatically confirm the email
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      
      // Handle specific error cases
      if (authError.message.includes('already been registered') || authError.message.includes('email_exists')) {
        return NextResponse.json(
          { error: 'A student with this email already exists. Please try again or contact support.' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Error creating student account: ' + authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create student account' },
        { status: 400 }
      )
    }

    console.log('Created auth user:', authData.user.id, authData.user.email)

    // First, add the user to the public.users table
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        role: 'student',
        institute_id: institute_id,
        is_active: true,
      })

    if (userError) {
      console.error('Error creating user record:', userError)
      return NextResponse.json(
        { error: 'Error creating user record: ' + userError.message },
        { status: 400 }
      )
    }

    // Create the student record
    const { data: studentData, error: studentError } = await supabaseAdmin
      .from('students')
      .insert({
        user_id: authData.user.id,
        institute_id: institute_id,
        student_id: student_id,
        first_name: first_name,
        last_name: last_name,
        date_of_birth: date_of_birth,
        gender: gender,
        phone: phone,
        email: email,
        address: address,
        parent_name: parent_name,
        parent_phone: parent_phone,
        parent_email: parent_email,
        generated_password: password, // Store the generated password
        is_active: true,
      })
      .select()
      .single()

    if (studentError) {
      console.error('Error creating student record:', studentError)
      return NextResponse.json(
        { error: 'Error creating student: ' + studentError.message },
        { status: 400 }
      )
    }

    // Enroll student in selected batches
    if (batchIdsArray.length > 0) {
      const enrollments = batchIdsArray.map((batchId: string) => ({
        student_id: studentData.id,
        batch_id: batchId,
        institute_id: institute_id,
        is_active: true,
      }))

      const { error: enrollmentError } = await supabaseAdmin
        .from('student_batches')
        .insert(enrollments)

      if (enrollmentError) {
        console.error('Error enrolling in batches:', enrollmentError)
        // Don't fail the entire operation, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      student: studentData,
      credentials: {
        email: email,
        password: password
      },
      message: 'Student created successfully!'
    })

  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
