import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { student_id } = await request.json()

    if (!student_id) {
      return NextResponse.json(
        { error: 'Student ID is required' },
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

    // Delete from student_batches first (foreign key constraint)
    const { error: batchError } = await supabaseAdmin
      .from('student_batches')
      .delete()
      .eq('student_id', student_id)

    if (batchError) {
      console.error('Error deleting batch enrollments:', batchError)
      // Continue with deletion even if batch deletion fails
    }

    // Delete from students table
    const { error: studentDeleteError } = await supabaseAdmin
      .from('students')
      .delete()
      .eq('id', student_id)

    if (studentDeleteError) {
      console.error('Error deleting student record:', studentDeleteError)
      return NextResponse.json(
        { error: 'Error deleting student record: ' + studentDeleteError.message },
        { status: 400 }
      )
    }

    // Delete from users table
    const { error: userDeleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', studentData.user_id)

    if (userDeleteError) {
      console.error('Error deleting user record:', userDeleteError)
      // Continue even if user record deletion fails
    }

    // Delete from auth.users (Supabase Auth)
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(
      studentData.user_id
    )

    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError)
      // Continue even if auth user deletion fails
    }

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully!'
    })

  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
