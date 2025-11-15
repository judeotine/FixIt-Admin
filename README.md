# FixIt UG Admin Dashboard

Secure Next.js admin dashboard for managing the FixIt UG platform.

## Setup Instructions

### 1. Environment Variables

Copy the `.env.example` file to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (keep this secret!)
- `RESEND_API_KEY` - Your Resend API key for sending OTP emails
- `RESEND_FROM_EMAIL` - Email address to send OTP emails from
- `NEXT_PUBLIC_APP_URL` - Your application URL (default: http://localhost:3000)
- `ADMIN_OTP_EXPIRY_MINUTES` - OTP expiration time in minutes (default: 10)
- `NEXTAUTH_SECRET` - Generate a secure random string for session encryption
- `ENCRYPTION_KEY` - Generate a 32-character string for data encryption

### 2. Database Setup

Run the SQL migration file in your Supabase SQL editor:

```bash
supabase/migrations/001_admin_schema.sql
```

This will create the necessary tables:
- `admin_users` - Admin user accounts
- `otp_codes` - OTP codes for authentication
- `admin_audit_logs` - Audit trail for admin actions
- `login_attempts` - Login attempt tracking

### 3. Create Admin User

After running the migration, create your first admin user in Supabase SQL editor:

```sql
INSERT INTO admin_users (email, name, role) 
VALUES ('admin@fixit-ug.com', 'Admin User', 'admin');
```

### 4. Install Dependencies

```bash
bun install
```

### 5. Run Development Server

```bash
bun run dev
```

The application will be available at `http://localhost:3000`

## Features

- **Secure OTP Authentication** - Email-based OTP login system
- **Dashboard Overview** - Key metrics, charts, and recent activity
- **Workers Management** - View, verify, and manage workers
- **Recruiters Management** - Manage recruiter accounts
- **Services Management** - Manage service categories
- **Transactions** - View and export transaction data
- **Disputes** - Handle and resolve platform disputes
- **Analytics** - Comprehensive platform analytics

## Security Features

- Rate limiting on API routes
- Secure session management with HTTP-only cookies
- OTP expiration and attempt tracking
- Audit logging for all admin actions
- Row Level Security (RLS) policies
- Security headers (CSP, HSTS, X-Frame-Options)

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Supabase (Backend & Auth)
- Tailwind CSS
- shadcn/ui (UI Components)
- Recharts (Data Visualization)
- Resend (Email Service)

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (dashboard)/     # Dashboard pages
│   └── api/            # API routes
├── components/
│   ├── dashboard/      # Dashboard components
│   ├── workers/        # Worker management components
│   ├── shared/         # Shared components
│   └── ui/             # shadcn/ui components
├── lib/
│   ├── supabase/       # Supabase clients
│   ├── constants.ts    # App constants
│   └── validations.ts  # Zod schemas
└── types/              # TypeScript types
```

## Development

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Start production server
bun start

# Run linter
bun run lint
```

## Production Deployment

1. Set up environment variables in your hosting platform (Vercel recommended)
2. Run database migrations in Supabase
3. Build and deploy the application

## Support

For issues or questions, please contact the development team.
