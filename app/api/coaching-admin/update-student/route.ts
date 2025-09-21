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
      batch_ids
    } = await request.json()

    if (!student_id || !first_name || !last_name) {
      return NextResponse.json(
        { error: 'Student ID, first name, and last name are required' },
        { status: 400 }
      )
    }

    // Update the student record
    const { data: studentData, error: studentError } = await supabaseAdmin
      .from('students')
      .update({
        first_name,
        last_name,
        date_of_birth,
        gender,
        phone,
        address,
        parent_name,
        parent_phone,
        parent_email,
      })
      .eq('id', student_id)
      .select()
      .single()

    if (studentError) {
      console.error('Error updating student:', studentError)
      return NextResponse.json(
        { error: 'Error updating student: ' + studentError.message },
        { status: 400 }
      )
    }

    // Update batch enrollments if provided
    if (batch_ids && batch_ids.length > 0) {
      // First, remove existing enrollments
      const { error: deleteError } = await supabaseAdmin
        .from('student_batches')
        .delete()
        .eq('student_id', student_id)

      if (deleteError) {
        console.error('Error removing old batch enrollments:', deleteError)
        // Don't fail the entire operation, just log the error
      } else {
        // Add new enrollments
        const enrollments = batch_ids.map((batchId: string) => ({
          student_id: student_id,
          batch_id: batchId,
          institute_id: studentData.institute_id,
          is_active: true,
        }))

        const { error: enrollmentError } = await supabaseAdmin
          .from('student_batches')
          .insert(enrollments)

        if (enrollmentError) {
          console.error('Error updating batch enrollments:', enrollmentError)
          // Don't fail the entire operation, just log the error
        }
      }
    }

    return NextResponse.json({
      success: true,
      student: studentData,
      message: 'Student updated successfully!'
    })

  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
