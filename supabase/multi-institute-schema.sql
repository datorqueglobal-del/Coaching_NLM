-- Multi-Institute Coaching Management System Schema
-- Drop existing tables and recreate for multi-institute system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('super_admin', 'coaching_admin', 'student');
CREATE TYPE gender AS ENUM ('male', 'female', 'other');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late');
CREATE TYPE fee_status AS ENUM ('paid', 'pending', 'overdue');
CREATE TYPE subscription_status AS ENUM ('active', 'suspended', 'expired', 'trial');

-- Institutes table
CREATE TABLE public.institutes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  logo_url TEXT,
  subscription_status subscription_status DEFAULT 'trial',
  subscription_plan TEXT DEFAULT 'basic',
  max_students INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (username-based authentication)
CREATE TABLE public.users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL,
  institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE public.students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, institute_id)
);

-- Batches table
CREATE TABLE public.batches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE,
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
  institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(student_id, batch_id)
);

-- Attendance table
CREATE TABLE public.attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE,
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
  institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  fee_type TEXT NOT NULL,
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
  institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE,
  fee_structure_id UUID REFERENCES public.fee_structure(id),
  amount DECIMAL(10,2) NOT NULL,
  status fee_status NOT NULL DEFAULT 'pending',
  due_date DATE NOT NULL,
  paid_date DATE,
  payment_method TEXT,
  transaction_id TEXT,
  receipt_number TEXT UNIQUE,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_institute ON public.users(institute_id);
CREATE INDEX idx_students_institute ON public.students(institute_id);
CREATE INDEX idx_students_user_id ON public.students(user_id);
CREATE INDEX idx_batches_institute ON public.batches(institute_id);
CREATE INDEX idx_attendance_institute ON public.attendance(institute_id);
CREATE INDEX idx_attendance_student_date ON public.attendance(student_id, date);
CREATE INDEX idx_fee_payments_institute ON public.fee_payments(institute_id);
CREATE INDEX idx_fee_payments_student ON public.fee_payments(student_id);
CREATE INDEX idx_notifications_institute ON public.notifications(institute_id);

-- Row Level Security (RLS) policies
ALTER TABLE public.institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Super Admin can access everything
CREATE POLICY "Super Admin can access all institutes" ON public.institutes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super Admin can access all users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Coaching Admin can access their institute data only
CREATE POLICY "Coaching Admin can access own institute" ON public.institutes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'coaching_admin' AND institute_id = institutes.id
    )
  );

CREATE POLICY "Coaching Admin can access institute users" ON public.users
  FOR ALL USING (
    institute_id = (SELECT institute_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Coaching Admin can access institute students" ON public.students
  FOR ALL USING (
    institute_id = (SELECT institute_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Coaching Admin can access institute batches" ON public.batches
  FOR ALL USING (
    institute_id = (SELECT institute_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Coaching Admin can access institute attendance" ON public.attendance
  FOR ALL USING (
    institute_id = (SELECT institute_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Coaching Admin can access institute fees" ON public.fee_payments
  FOR ALL USING (
    institute_id = (SELECT institute_id FROM public.users WHERE id = auth.uid())
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

-- Insert Super Admin user
INSERT INTO public.users (username, password_hash, role, institute_id) VALUES 
('superadmin', '$2a$10$rQZ8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K', 'super_admin', NULL);

-- Insert sample institute
INSERT INTO public.institutes (name, contact_person, contact_email, contact_phone, address, subscription_status) VALUES 
('Demo Institute', 'John Doe', 'admin@demo.com', '+1234567890', '123 Demo Street, City', 'active');
