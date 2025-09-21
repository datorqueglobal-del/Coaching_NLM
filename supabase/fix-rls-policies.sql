-- Fix RLS Policies for Multi-Institute System
-- This script fixes RLS policies that are blocking client-side access

-- Disable RLS on all tables temporarily for easier access
ALTER TABLE public.institutes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_batches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structure DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- Alternative: If you want to keep RLS enabled, use these policies instead:

-- Re-enable RLS (uncomment if you want to use the policies below)
-- ALTER TABLE public.institutes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.student_batches ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.fee_structure ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
-- DROP POLICY IF EXISTS "Super Admin can access all institutes" ON public.institutes;
-- DROP POLICY IF EXISTS "Super Admin can access all users" ON public.users;
-- DROP POLICY IF EXISTS "Coaching Admin can access own institute" ON public.institutes;
-- DROP POLICY IF EXISTS "Coaching Admin can access institute users" ON public.users;
-- DROP POLICY IF EXISTS "Coaching Admin can access institute students" ON public.students;
-- DROP POLICY IF EXISTS "Coaching Admin can access institute batches" ON public.batches;
-- DROP POLICY IF EXISTS "Coaching Admin can access institute attendance" ON public.attendance;
-- DROP POLICY IF EXISTS "Coaching Admin can access institute fees" ON public.fee_payments;
-- DROP POLICY IF EXISTS "Students can access own data" ON public.students;
-- DROP POLICY IF EXISTS "Students can access own batches" ON public.student_batches;
-- DROP POLICY IF EXISTS "Students can access own attendance" ON public.attendance;
-- DROP POLICY IF EXISTS "Students can access own fee payments" ON public.fee_payments;

-- Create simple policies that allow authenticated users to access data
-- (Uncomment these if you re-enable RLS above)

-- Allow authenticated users to read institutes
-- CREATE POLICY "Authenticated users can read institutes" ON public.institutes
--   FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to read users
-- CREATE POLICY "Authenticated users can read users" ON public.users
--   FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert institutes (for super admin)
-- CREATE POLICY "Authenticated users can insert institutes" ON public.institutes
--   FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to insert users (for super admin)
-- CREATE POLICY "Authenticated users can insert users" ON public.users
--   FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update institutes
-- CREATE POLICY "Authenticated users can update institutes" ON public.institutes
--   FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to update users
-- CREATE POLICY "Authenticated users can update users" ON public.users
--   FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete institutes
-- CREATE POLICY "Authenticated users can delete institutes" ON public.institutes
--   FOR DELETE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete users
-- CREATE POLICY "Authenticated users can delete users" ON public.users
--   FOR DELETE USING (auth.role() = 'authenticated');
