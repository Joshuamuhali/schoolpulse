# School Pulse

A lifecycle-driven, multi-tenant educational management system built for modern schools.

## Overview

School Pulse is a production-ready SaaS platform that transforms how schools manage their daily operations. Built with React, TypeScript, and Supabase, it provides a comprehensive solution for student management, attendance tracking, exams, finance, and communications.

## Architecture

### Multi-Tenant System
- **Tenant Isolation**: Complete data separation between schools
- **Role-Based Access**: Admin, Teacher, Student, Bursar, and Parent roles
- **Feature Gating**: Dynamic UI based on school subscriptions
- **State Machine Control**: Enforced lifecycle transitions

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Data Fetching**: React Query + Custom API Layer

## Features

### Core Modules
- **Students Management**: Enrollment, records, and class assignments
- **Attendance Tracking**: Real-time attendance with reporting
- **Exam Management**: Create, schedule, and grade examinations
- **Finance System**: Fee tracking, payments, and billing
- **Communication**: Announcements and notifications

### System Features
- **Real-time Updates**: Live data synchronization
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Error Resilience**: Comprehensive error handling and recovery
- **Loading States**: Professional loading and empty states
- **Type Safety**: Full TypeScript integration

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd school-pulse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## Database Setup

### Required Tables
Create these tables in your Supabase project:

```sql
-- Schools table
CREATE TABLE schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  state TEXT NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes table
CREATE TABLE classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('M', 'F')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  balance DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance table
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('present', 'absent', 'late')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, date)
);
```

### Row Level Security (RLS)
Enable RLS and create policies for tenant isolation:

```sql
-- Enable RLS
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- School policies
CREATE POLICY "Schools are viewable by authenticated users" ON schools
  FOR SELECT USING (auth.role() = 'authenticated');

-- Student policies (tenant isolation)
CREATE POLICY "Students are viewable by school users" ON students
  FOR SELECT USING (school_id IN (
    SELECT school_id FROM auth.users() 
    WHERE id = auth.uid()
  ));
```

## Project Structure

```
src/
  components/
    auth/           # Authentication components
    feature/        # Feature gating components
    navigation/     # Dynamic navigation
    ui/            # Reusable UI components
  hooks/
    useOptimisticUpdate.ts  # Optimistic UI hooks
  lib/
    api/           # API abstraction layer
    supabase/      # Supabase client configuration
    tenant/        # Tenant resolution logic
  pages/
    dashboard/     # Main application pages
  stores/
    authStore.ts   # Authentication state
    schoolStore.ts # School/tenant state
```

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

### Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks

## Architecture Patterns

### Feature Gating
```tsx
<FeatureGate feature="attendance">
  <AttendancePage />
</FeatureGate>
```

### Tenant-Aware API Calls
```tsx
// All API calls automatically include school_id filtering
const { data } = await api.getStudents();
```

### Error Handling
```tsx
const { handleError } = useErrorHandler();
try {
  await api.markAttendance(data);
} catch (error) {
  handleError(error);
}
```

## Deployment

### Environment Variables
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

### Build Process
```bash
npm run build
npm run preview
```

### Production Considerations
- Enable RLS policies in Supabase
- Set up proper CORS configuration
- Configure environment variables
- Set up monitoring and error tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.

---

**School Pulse** - Empowering education through technology.
