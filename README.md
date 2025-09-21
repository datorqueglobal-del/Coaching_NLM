# Coaching Management System

A comprehensive student management system for coaching classes built with Next.js, TypeScript, and Supabase.

## Features

### 👤 User Roles
- **Admin (Super User)**: Complete system management and student account creation
- **Student**: View personal data, attendance, and fees

### 🔑 Core Modules

#### 1. Student Information Management
- Store student details (ID, name, DOB, gender, contact info)
- Parent/guardian information
- Batch/subject enrollment tracking

#### 2. Attendance Management
- Mark attendance per batch/session
- Automatic parent notifications for absences
- Attendance percentage calculations
- Export attendance reports to PDF

#### 3. Fee & Finance Management
- Flexible fee structures (monthly/quarterly/one-time)
- Payment tracking and status management
- Auto-generated invoices and receipts
- Email notifications for pending/overdue fees

#### 4. Dashboard & Analytics
- **Admin Dashboard**: Quick stats, notifications, analytics, student management
- **Student Dashboard**: Personal attendance, fee status, profile info
- Real-time data visualization

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Deployment**: Vercel (Frontend), Supabase (Backend)
- **UI Components**: Lucide React icons, React Hook Form
- **Charts**: Recharts
- **PDF Generation**: jsPDF, html2canvas

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone the Repository

```bash
git clone <repository-url>
cd coaching-management-system
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The system uses the following main tables:

- `users` - User authentication and roles
- `students` - Student information
- `batches` - Course/batch information
- `student_batches` - Student enrollment
- `attendance` - Attendance records
- `fee_structure` - Fee configuration
- `fee_payments` - Payment tracking
- `notifications` - System notifications

## Key Features Implementation

### Authentication
- Supabase Auth with email/password
- Role-based access control (Admin, Student)
- Automatic redirects based on user role
- Admin creates student accounts with credentials

### Student Management
- CRUD operations for student data
- Auto-generated student IDs and credentials
- Parent contact information tracking

### Attendance System
- Daily attendance marking per batch
- Automatic parent notifications for absences
- Attendance percentage calculations
- Export functionality for reports

### Fee Management
- Flexible fee structure configuration
- Payment status tracking
- Receipt generation
- Overdue fee notifications

### Notifications
- Email notifications for parents
- Absence alerts
- Fee due/overdue reminders
- System-wide notification management

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Supabase)

1. Your Supabase project is already hosted
2. Configure email settings for notifications
3. Set up proper RLS policies for production

## Usage

### Admin Workflow

1. **Login** with admin credentials
2. **Add Students**: Create student accounts with auto-generated credentials
3. **Create Batches**: Set up courses with fee structures
4. **Mark Attendance**: Daily attendance tracking
5. **Manage Fees**: Process payments and generate receipts
6. **View Analytics**: Monitor system performance and student progress

### Student Workflow

1. **Login** with provided credentials
2. **View Dashboard**: See attendance percentage and fee status
3. **Check Attendance**: View detailed attendance records
4. **View Fees**: See payment history and pending amounts
5. **Download Receipts**: Get payment receipts

### Parent Workflow

1. **Login** using student credentials
2. **Receive Notifications**: Get email alerts for absences and fees
3. **Monitor Progress**: View child's academic progress

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
