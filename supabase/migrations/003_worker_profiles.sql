-- Ensure supporting profile tables exist for worker management flows

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR NOT NULL,
  phone_number VARCHAR,
  role INTEGER NOT NULL DEFAULT 0 CHECK (role IN (0, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.worker_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  phone_number TEXT,
  service_type TEXT NOT NULL,
  profile_picture_url TEXT,
  national_id_url TEXT NOT NULL,
  certification_url TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  verification_status TEXT DEFAULT 'pending',
  rating NUMERIC(3,2),
  total_jobs INTEGER DEFAULT 0,
  total_earnings NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;

-- Backfill newer metric columns when running against existing databases
ALTER TABLE public.worker_profiles
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2);

ALTER TABLE public.worker_profiles
  ADD COLUMN IF NOT EXISTS total_jobs INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.worker_profiles
  ADD COLUMN IF NOT EXISTS total_earnings NUMERIC(12,2) NOT NULL DEFAULT 0;

UPDATE public.worker_profiles
SET rating = COALESCE(rating, 0),
    total_jobs = COALESCE(total_jobs, 0),
    total_earnings = COALESCE(total_earnings, 0);


