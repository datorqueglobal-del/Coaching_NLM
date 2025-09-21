-- Fix RLS policies to prevent infinite recursion

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admin can access all data" ON public.users;
DROP POLICY IF EXISTS "Students can access own data" ON public.students;
DROP POLICY IF EXISTS "Students can access own batches" ON public.student_batches;
DROP POLICY IF EXISTS "Students can access own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Students can access own fee payments" ON public.fee_payments;
DROP POLICY IF EXISTS "Students can access own notifications" ON public.notifications;

-- Create a simple policy for users table - allow all authenticated users to read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Admin policies for other tables (these are fine as they don't reference users table)
-- Students can access their own data
CREATE POLICY "Students can access own data" ON public.students
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Students can access own batches" ON public.student_batches
  FOR ALL USING (
    student_id IN (
      SELECT id FROM public.students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students can access own attendance" ON public.attendance
  FOR ALL USING (
    student_id IN (
      SELECT id FROM public.students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students can access own fee payments" ON public.fee_payments
  FOR ALL USING (
    student_id IN (
      SELECT id FROM public.students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Students can access own notifications" ON public.notifications
  FOR ALL USING (
    student_id IN (
      SELECT id FROM public.students WHERE user_id = auth.uid()
    )
  );
