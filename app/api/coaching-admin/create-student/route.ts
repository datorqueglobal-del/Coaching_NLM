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
      email,
      address,
      parent_name,
      parent_phone,
      parent_email,
      institute_id,
      batch_ids
    } = await request.json()

    if (!email || !institute_id) {
      return NextResponse.json(
        { error: 'Email and institute_id are required' },
        { status: 400 }
      )
    }

    // Create user in Supabase Auth with confirmed email
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: 'student123', // Default password
      email_confirm: true, // Automatically confirm the email
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
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
    if (batch_ids && batch_ids.length > 0) {
      const enrollments = batch_ids.map((batchId: string) => ({
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
