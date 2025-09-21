-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'student', 'parent');
CREATE TYPE gender AS ENUM ('male', 'female', 'other');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late');
CREATE TYPE fee_status AS ENUM ('paid', 'pending', 'overdue');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE public.students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  student_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender gender NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Batches table
CREATE TABLE public.batches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  subjects TEXT[] NOT NULL,
  monthly_fee DECIMAL(10,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student-Batch enrollments
CREATE TABLE public.student_batches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(student_id, batch_id)
);

-- Attendance table
CREATE TABLE public.attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status attendance_status NOT NULL,
  remarks TEXT,
  marked_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, batch_id, date)
);

-- Fee structure table
CREATE TABLE public.fee_structure (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  fee_type TEXT NOT NULL, -- 'monthly', 'quarterly', 'one_time'
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fee payments table
CREATE TABLE public.fee_payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  fee_structure_id UUID REFERENCES public.fee_structure(id),
  amount DECIMAL(10,2) NOT NULL,
  status fee_status NOT NULL DEFAULT 'pending',
  due_date DATE NOT NULL,
  paid_date DATE,
  payment_method TEXT,
  transaction_id TEXT,
  receipt_number TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'attendance', 'fee_due', 'fee_overdue'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_students_user_id ON public.students(user_id);
CREATE INDEX idx_students_student_id ON public.students(student_id);
CREATE INDEX idx_attendance_student_date ON public.attendance(student_id, date);
CREATE INDEX idx_attendance_batch_date ON public.attendance(batch_id, date);
CREATE INDEX idx_fee_payments_student ON public.fee_payments(student_id);
CREATE INDEX idx_fee_payments_status ON public.fee_payments(status);
CREATE INDEX idx_notifications_student ON public.notifications(student_id);
CREATE INDEX idx_notifications_sent ON public.notifications(is_sent);

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Admin can access everything
CREATE POLICY "Admin can access all data" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can access all students" ON public.students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can access all batches" ON public.batches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can access all student_batches" ON public.student_batches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can access all attendance" ON public.attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can access all fee_structure" ON public.fee_structure
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can access all fee_payments" ON public.fee_payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can access all notifications" ON public.notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Students can only access their own data
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

-- Parents can access their child's data (using student credentials)
CREATE POLICY "Parents can access child data" ON public.students
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Parents can access child batches" ON public.student_batches
  FOR ALL USING (
    student_id IN (
      SELECT id FROM public.students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can access child attendance" ON public.attendance
  FOR ALL USING (
    student_id IN (
      SELECT id FROM public.students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can access child fee payments" ON public.fee_payments
  FOR ALL USING (
    student_id IN (
      SELECT id FROM public.students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can access child notifications" ON public.notifications
  FOR ALL USING (
    student_id IN (
      SELECT id FROM public.students WHERE user_id = auth.uid()
    )
  );

-- Functions for common operations
CREATE OR REPLACE FUNCTION generate_student_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  counter INTEGER := 1;
BEGIN
  LOOP
    new_id := 'STU' || LPAD(counter::TEXT, 4, '0');
    IF NOT EXISTS (SELECT 1 FROM public.students WHERE student_id = new_id) THEN
      RETURN new_id;
    END IF;
    counter := counter + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER := 1;
BEGIN
  LOOP
    new_number := 'RCP' || LPAD(counter::TEXT, 6, '0');
    IF NOT EXISTS (SELECT 1 FROM public.fee_payments WHERE receipt_number = new_number) THEN
      RETURN new_number;
    END IF;
    counter := counter + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON public.batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fee_payments_updated_at BEFORE UPDATE ON public.fee_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
