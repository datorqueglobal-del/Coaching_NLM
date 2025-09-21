-- Add generated_password column to students table
ALTER TABLE public.students 
ADD COLUMN generated_password TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN public.students.generated_password IS 'Stores the auto-generated password for the student account';
