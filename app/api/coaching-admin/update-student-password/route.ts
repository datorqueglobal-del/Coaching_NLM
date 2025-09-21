import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { student_id, new_password } = await request.json()

    if (!student_id || !new_password) {
      return NextResponse.json(
        { error: 'Student ID and new password are required' },
        { status: 400 }
      )
    }

    // Get the user ID from the students table
    const { data: studentData, error: studentError } = await supabaseAdmin
      .from('students')
      .select('user_id')
      .eq('id', student_id)
      .single()

    if (studentError || !studentData) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Update the password in Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      studentData.user_id,
      { password: new_password }
    )

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json(
        { error: 'Error updating password: ' + updateError.message },
        { status: 400 }
      )
    }

    // Update the stored password in the students table
    const { error: studentUpdateError } = await supabaseAdmin
      .from('students')
      .update({ generated_password: new_password })
      .eq('id', student_id)

    if (studentUpdateError) {
      console.error('Error updating stored password:', studentUpdateError)
      // Don't fail the operation, just log the error
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully!'
    })

  } catch (error) {
    console.error('Error updating student password:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
