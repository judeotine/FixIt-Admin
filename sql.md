-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admin_audit_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  admin_id uuid,
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT admin_audit_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admin_users(id)
);
CREATE TABLE public.admin_users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  role text DEFAULT 'admin'::text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  last_login timestamp with time zone,
  is_active boolean DEFAULT true,
  CONSTRAINT admin_users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.login_attempts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email text NOT NULL,
  ip_address text,
  success boolean,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT login_attempts_pkey PRIMARY KEY (id)
);
CREATE TABLE public.otp_codes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  admin_id uuid,
  otp_hash text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  attempts integer DEFAULT 0,
  used boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT otp_codes_pkey PRIMARY KEY (id),
  CONSTRAINT otp_codes_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admin_users(id)
);



CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  description text,
  icon_name text,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT services_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL,
  email character varying NOT NULL UNIQUE,
  full_name character varying NOT NULL,
  phone_number character varying,
  role integer NOT NULL DEFAULT 0 CHECK (role = ANY (ARRAY[0, 1])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.worker_profiles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL,
  phone_number text,
  service_type text NOT NULL,
  profile_picture_url text,
  national_id_url text NOT NULL,
  certification_url text,
  onboarding_completed boolean DEFAULT false,
  verification_status text DEFAULT 'pending'::text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  rating numeric,
  total_jobs integer NOT NULL DEFAULT 0,
  total_earnings numeric NOT NULL DEFAULT 0,
  CONSTRAINT worker_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT worker_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);