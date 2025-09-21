import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password, institute_id } = await request.json()

    if (!email || !password || !institute_id) {
      return NextResponse.json(
        { error: 'Email, password, and institute_id are required' },
        { status: 400 }
      )
    }

    // Create user in Supabase Auth with confirmed email
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Automatically confirm the email
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return NextResponse.json(
        { error: 'Error creating auth user: ' + authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 400 }
      )
    }

    // Create the user record in our users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        role: 'coaching_admin',
        institute_id: institute_id,
        is_active: true,
      })
      .select()
      .single()

    if (userError) {
      console.error('Error creating user record:', userError)
      return NextResponse.json(
        { error: 'Error creating admin: ' + userError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      user: userData,
      message: 'Coaching admin created successfully!'
    })

  } catch (error) {
    console.error('Error creating coaching admin:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
