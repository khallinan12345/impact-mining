/*
  # Impact Mining Platform Database Schema

  1. New Tables
    - `profiles` - User profile information linked to auth.users
    - `projects` - Project listings with funding and KPI tracking
    - `donations` - Donation records linking users to projects
    - `stories` - Community stories with approval workflow
    - `donee_submissions` - Project submission requests
    - `page_views` - Optional analytics tracking

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
    - Ensure proper access control for different user roles

  3. Sample Data
    - Sample projects for demonstration
    - No user-dependent data to avoid foreign key issues
*/

-- Create custom types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('pending', 'in-progress', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE submission_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

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

-- Create page_views table (optional analytics)
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE donee_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can read projects" ON projects;
DROP POLICY IF EXISTS "Admins can insert projects" ON projects;
DROP POLICY IF EXISTS "Admins can update projects" ON projects;
DROP POLICY IF EXISTS "Users can read own donations" ON donations;
DROP POLICY IF EXISTS "Users can insert donations" ON donations;
DROP POLICY IF EXISTS "Public can read aggregated donations" ON donations;
DROP POLICY IF EXISTS "Anyone can read approved stories" ON stories;
DROP POLICY IF EXISTS "Users can read own stories" ON stories;
DROP POLICY IF EXISTS "Users can insert stories" ON stories;
DROP POLICY IF EXISTS "Users can update own stories" ON stories;
DROP POLICY IF EXISTS "Admins can update any story" ON stories;
DROP POLICY IF EXISTS "Users can read own submissions" ON donee_submissions;
DROP POLICY IF EXISTS "Users can insert submissions" ON donee_submissions;
DROP POLICY IF EXISTS "Admins can read all submissions" ON donee_submissions;
DROP POLICY IF EXISTS "Admins can update submissions" ON donee_submissions;
DROP POLICY IF EXISTS "Anyone can insert page views" ON page_views;

-- Profiles policies
CREATE POLICY "Users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

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
CREATE POLICY "Users can read own donations"
  ON donations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert donations"
  ON donations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can read aggregated donations"
  ON donations FOR SELECT
  TO public
  USING (true);

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
CREATE POLICY "Users can read own submissions"
  ON donee_submissions FOR SELECT
  TO authenticated
  USING (submitted_by = auth.email());

CREATE POLICY "Users can insert submissions"
  ON donee_submissions FOR INSERT
  TO authenticated
  WITH CHECK (true);

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_project_id ON donations(project_id);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);
CREATE INDEX IF NOT EXISTS idx_stories_approved ON stories(approved);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at);
CREATE INDEX IF NOT EXISTS idx_donee_submissions_status ON donee_submissions(status);
CREATE INDEX IF NOT EXISTS idx_donee_submissions_created_at ON donee_submissions(created_at);

-- Insert sample projects (no user dependencies)
INSERT INTO projects (title, summary, description, status, target_usd, raised_usd, kpi_jsonb, image_url) VALUES 
  (
    'Solar Power for Rural Schools',
    'Bringing renewable energy to underserved educational institutions',
    'This project aims to install solar panel systems in 10 rural schools across developing regions, providing clean electricity for lighting, computers, and educational equipment. The initiative will directly impact over 2,000 students and 150 teachers, creating better learning environments while reducing carbon emissions by an estimated 50 tons annually.

## Project Goals
- Install 10 solar panel systems
- Serve 2,000+ students and 150+ teachers
- Generate 45,000 kWh of clean energy annually
- Reduce CO₂ emissions by 50 tons per year

## Implementation Timeline
- Phase 1: Site assessment and planning (Month 1-2)
- Phase 2: Equipment procurement and logistics (Month 3-4)
- Phase 3: Installation and testing (Month 5-8)
- Phase 4: Training and handover (Month 9-10)

## Sustainability Plan
Local technicians will be trained for ongoing maintenance, ensuring long-term project success and community ownership.',
    'in-progress',
    25000.00,
    18750.00,
    '{"kwh_generated": 45000, "students_served": 2000, "teachers_supported": 150, "co2_offset": 50, "schools_targeted": 10, "completion_percentage": 75}',
    'https://images.pexels.com/photos/9875410/pexels-photo-9875410.jpeg'
  ),
  (
    'Community Water Purification',
    'Clean water access through solar-powered filtration systems',
    'Implementing solar-powered water purification systems in remote communities that lack access to clean drinking water. Each system can purify 1,000 liters per day, serving approximately 200 people per installation. The project includes training local technicians for maintenance and sustainability.

## Project Impact
- 5 water purification systems
- Serving 1,000+ community members
- 5,000 liters of clean water daily
- Reduced waterborne illness by 80%

## Technology Features
- Solar-powered filtration systems
- Multi-stage purification process
- Real-time water quality monitoring
- Mobile app for system status

## Community Engagement
Local community members are trained as system operators, creating jobs and ensuring project sustainability. Regular health monitoring tracks the impact on community wellness.',
    'pending',
    40000.00,
    12500.00,
    '{"beneficiaries": 1000, "liters_per_day": 5000, "systems_planned": 5, "systems_installed": 0, "health_improvement": 80}',
    'https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg'
  ),
  (
    'Digital Learning Centers',
    'Technology education hubs powered by renewable energy',
    'Establishing digital learning centers in underserved communities, complete with computers, internet access, and educational software. Each center is powered by solar energy and serves as a hub for digital literacy, coding bootcamps, and remote learning opportunities.

## Center Features
- 20 computer workstations per center
- High-speed internet connectivity
- Solar power system with battery backup
- Interactive learning software and platforms

## Educational Programs
- Digital literacy courses
- Coding and programming bootcamps
- Remote learning opportunities
- Teacher training programs

## Success Metrics
This completed project has already transformed education in 3 communities, with 500 students completing various programs and 150 successfully finishing coding bootcamps.',
    'completed',
    15000.00,
    15000.00,
    '{"students_served": 500, "centers_built": 3, "courses_completed": 150, "kwh_generated": 12000, "teachers_trained": 25, "job_placements": 45}',
    'https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg'
  ),
  (
    'Sustainable Agriculture Initiative',
    'Smart farming solutions for small-scale farmers',
    'Empowering small-scale farmers with solar-powered irrigation systems, weather monitoring stations, and mobile technology for crop management. This initiative focuses on increasing crop yields while promoting sustainable farming practices.

## Key Components
- Solar-powered drip irrigation systems
- Weather monitoring and alert systems
- Mobile app for crop management
- Training on sustainable farming practices

## Expected Outcomes
- 40% increase in crop yields
- 60% reduction in water usage
- Improved farmer income and food security
- Reduced environmental impact

## Farmer Training Program
Comprehensive training covers modern farming techniques, technology usage, and business skills to ensure farmers can maximize the benefits of the new systems.',
    'pending',
    35000.00,
    8500.00,
    '{"farmers_targeted": 200, "irrigation_systems": 50, "yield_increase": 40, "water_savings": 60, "training_sessions": 20}',
    'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg'
  ),
  (
    'Mobile Health Clinics',
    'Solar-powered healthcare delivery to remote areas',
    'Deploying mobile health clinics equipped with solar power systems to provide essential healthcare services to remote and underserved communities. Each clinic includes telemedicine capabilities and basic medical equipment.

## Clinic Specifications
- Solar power system with medical-grade inverters
- Telemedicine equipment for remote consultations
- Basic diagnostic tools and medical supplies
- Refrigeration for vaccines and medications

## Healthcare Services
- Primary healthcare consultations
- Preventive care and health screenings
- Vaccination programs
- Health education and awareness

## Impact Goals
Reaching 5,000+ people across 20 remote communities with regular healthcare services, reducing travel time to healthcare facilities by 80%.',
    'in-progress',
    50000.00,
    32000.00,
    '{"people_served": 3200, "communities_reached": 12, "clinics_deployed": 2, "consultations_completed": 1500, "vaccines_administered": 800}',
    'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample donee submissions (no user dependencies)
INSERT INTO donee_submissions (org_name, proposal_md, budget_usd, initial_kpis, submitted_by, status) VALUES 
  (
    'Green Energy Cooperative',
    '# Solar Microgrids for Island Communities

## Problem Statement
Remote island communities often rely on expensive diesel generators for electricity, leading to high energy costs and environmental pollution.

## Proposed Solution
Install solar microgrids with battery storage to provide clean, reliable electricity to 3 island communities.

## Implementation Plan
1. Site surveys and community engagement
2. System design and equipment procurement
3. Installation and commissioning
4. Training and maintenance programs

## Expected Impact
- 500 households with reliable electricity
- 80% reduction in energy costs
- 200 tons CO₂ emissions avoided annually
- Local job creation and skills development',
    28000.00,
    '{"households": 500, "cost_reduction": 80, "co2_avoided": 200, "jobs_created": 15, "timeline_months": 12}',
    'contact@greenenergy.coop',
    'pending'
  ),
  (
    'Education First Foundation',
    '# STEM Learning Labs for Underserved Schools

## Project Overview
Establish fully equipped STEM learning laboratories in 5 underserved schools to enhance science and technology education.

## Lab Components
- Modern laboratory equipment
- 3D printers and robotics kits
- Solar power systems
- Interactive learning software

## Educational Impact
- 1,200 students gain access to hands-on STEM education
- Teacher training programs
- Science fair and competition participation
- Career guidance and mentorship

## Sustainability
Partnership with local universities for ongoing support and curriculum development.',
    22000.00,
    '{"students_impacted": 1200, "schools": 5, "teachers_trained": 30, "labs_established": 5, "timeline_months": 8}',
    'programs@educationfirst.org',
    'approved'
  )
ON CONFLICT (id) DO NOTHING;