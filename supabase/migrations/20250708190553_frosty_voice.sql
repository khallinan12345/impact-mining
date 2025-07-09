/*
  # Complete Database Schema Setup

  1. New Tables
    - `profiles` - User profile information with roles
    - `projects` - Fundraising projects with status and KPIs
    - `donations` - Individual donations linked to projects and users
    - `stories` - User-submitted stories with approval system
    - `donee_submissions` - Organization submissions for funding
    - `page_views` - Simple analytics tracking

  2. Custom Types
    - `user_role` enum (admin, user)
    - `project_status` enum (pending, in-progress, completed)
    - `submission_status` enum (pending, approved, rejected)

  3. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table based on user roles
    - Ensure data isolation and proper access control

  4. Indexes
    - Performance indexes on frequently queried columns
    - Foreign key relationships with cascade deletes
*/

-- Create custom enum types
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE project_status AS ENUM ('pending', 'in-progress', 'completed');
CREATE TYPE submission_status AS ENUM ('pending', 'approved', 'rejected');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  role user_role DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text NOT NULL,
  description text NOT NULL,
  status project_status DEFAULT 'pending',
  target_usd numeric(12,2) NOT NULL,
  raised_usd numeric(12,2) DEFAULT 0,
  kpi_jsonb jsonb DEFAULT '{}',
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount_usd numeric(12,2) NOT NULL,
  tx_hash text,
  created_at timestamptz DEFAULT now()
);

-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  body_md text NOT NULL,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create donee_submissions table
CREATE TABLE IF NOT EXISTS donee_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name text NOT NULL,
  proposal_md text NOT NULL,
  budget_usd numeric(12,2) NOT NULL,
  initial_kpis jsonb DEFAULT '{}',
  submitted_by text NOT NULL,
  status submission_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create page_views table
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_donations_project_id ON donations(project_id);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_approved ON stories(approved);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at);
CREATE INDEX IF NOT EXISTS idx_donee_submissions_status ON donee_submissions(status);
CREATE INDEX IF NOT EXISTS idx_donee_submissions_created_at ON donee_submissions(created_at);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE donee_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Anyone can read projects"
  ON projects FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Donations policies
CREATE POLICY "Public can read aggregated donations"
  ON donations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert donations"
  ON donations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own donations"
  ON donations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Stories policies
CREATE POLICY "Anyone can read approved stories"
  ON stories FOR SELECT
  TO public
  USING (approved = true);

CREATE POLICY "Users can read own stories"
  ON stories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert stories"
  ON stories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stories"
  ON stories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any story"
  ON stories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Donee submissions policies
CREATE POLICY "Users can insert submissions"
  ON donee_submissions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read own submissions"
  ON donee_submissions FOR SELECT
  TO authenticated
  USING (submitted_by = auth.email());

CREATE POLICY "Admins can read all submissions"
  ON donee_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update submissions"
  ON donee_submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Page views policies
CREATE POLICY "Anyone can insert page views"
  ON page_views FOR INSERT
  TO public
  WITH CHECK (true);