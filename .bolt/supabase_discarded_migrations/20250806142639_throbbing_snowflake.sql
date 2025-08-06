/*
  # Initial Schema Setup for NKKK Rating System

  1. New Tables
    - `users` - Authentication users (admin and cadets)
    - `cadets` - Cadet profiles and information
    - `scores` - Current scores for each cadet
    - `score_history` - History of score changes
    - `achievements` - Admin-created achievements
    - `auto_achievements` - Automatically awarded achievements
    - `cadet_achievements` - Junction table for cadet achievements
    - `news` - News articles
    - `tasks` - Available tasks for cadets
    - `task_submissions` - Task submissions by cadets

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'cadet')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cadets table
CREATE TABLE IF NOT EXISTS cadets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  platoon text NOT NULL,
  squad integer NOT NULL,
  rank integer DEFAULT 1,
  total_score integer DEFAULT 0,
  avatar_url text,
  join_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Scores table
CREATE TABLE IF NOT EXISTS scores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cadet_id uuid REFERENCES cadets(id) ON DELETE CASCADE,
  study_score integer DEFAULT 0,
  discipline_score integer DEFAULT 0,
  events_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(cadet_id)
);

-- Score history table
CREATE TABLE IF NOT EXISTS score_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cadet_id uuid REFERENCES cadets(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('study', 'discipline', 'events')),
  points integer NOT NULL,
  description text NOT NULL,
  awarded_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NOT NULL,
  category text DEFAULT 'general',
  icon text DEFAULT 'Star',
  color text DEFAULT 'from-blue-500 to-blue-700',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Auto achievements table
CREATE TABLE IF NOT EXISTS auto_achievements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NOT NULL,
  icon text DEFAULT 'Star',
  color text DEFAULT 'from-blue-500 to-blue-700',
  requirement_type text NOT NULL CHECK (requirement_type IN ('total_score', 'category_score')),
  requirement_category text CHECK (requirement_category IN ('study', 'discipline', 'events')),
  requirement_value integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Cadet achievements junction table
CREATE TABLE IF NOT EXISTS cadet_achievements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cadet_id uuid REFERENCES cadets(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE,
  auto_achievement_id uuid REFERENCES auto_achievements(id) ON DELETE CASCADE,
  awarded_by uuid REFERENCES users(id),
  awarded_date timestamptz DEFAULT now(),
  CHECK (
    (achievement_id IS NOT NULL AND auto_achievement_id IS NULL) OR
    (achievement_id IS NULL AND auto_achievement_id IS NOT NULL)
  )
);

-- News table
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text NOT NULL,
  author text NOT NULL,
  is_main boolean DEFAULT false,
  background_image_url text,
  images text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('study', 'discipline', 'events')),
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points integer NOT NULL DEFAULT 0,
  deadline timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Task submissions table
CREATE TABLE IF NOT EXISTS task_submissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  cadet_id uuid REFERENCES cadets(id) ON DELETE CASCADE,
  submission_text text DEFAULT '',
  status text NOT NULL DEFAULT 'taken' CHECK (status IN ('taken', 'submitted', 'completed', 'rejected')),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewer_feedback text,
  reviewed_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(task_id, cadet_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cadets ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE cadet_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can read all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (true);

-- Cadets policies
CREATE POLICY "Anyone can read cadets" ON cadets FOR SELECT USING (true);
CREATE POLICY "Admins can manage cadets" ON cadets FOR ALL USING (true);

-- Scores policies
CREATE POLICY "Anyone can read scores" ON scores FOR SELECT USING (true);
CREATE POLICY "Admins can manage scores" ON scores FOR ALL USING (true);

-- Score history policies
CREATE POLICY "Anyone can read score history" ON score_history FOR SELECT USING (true);
CREATE POLICY "Admins can manage score history" ON score_history FOR ALL USING (true);

-- Achievements policies
CREATE POLICY "Anyone can read achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Admins can manage achievements" ON achievements FOR ALL USING (true);

-- Auto achievements policies
CREATE POLICY "Anyone can read auto achievements" ON auto_achievements FOR SELECT USING (true);
CREATE POLICY "Admins can manage auto achievements" ON auto_achievements FOR ALL USING (true);

-- Cadet achievements policies
CREATE POLICY "Anyone can read cadet achievements" ON cadet_achievements FOR SELECT USING (true);
CREATE POLICY "Admins can manage cadet achievements" ON cadet_achievements FOR ALL USING (true);

-- News policies
CREATE POLICY "Anyone can read news" ON news FOR SELECT USING (true);
CREATE POLICY "Admins can manage news" ON news FOR ALL USING (true);

-- Tasks policies
CREATE POLICY "Anyone can read active tasks" ON tasks FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage tasks" ON tasks FOR ALL USING (true);

-- Task submissions policies
CREATE POLICY "Anyone can read task submissions" ON task_submissions FOR SELECT USING (true);
CREATE POLICY "Cadets can manage own submissions" ON task_submissions FOR ALL USING (true);
CREATE POLICY "Admins can manage all submissions" ON task_submissions FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cadets_rank ON cadets(rank);
CREATE INDEX IF NOT EXISTS idx_cadets_total_score ON cadets(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_cadets_platoon ON cadets(platoon);
CREATE INDEX IF NOT EXISTS idx_score_history_cadet_id ON score_history(cadet_id);
CREATE INDEX IF NOT EXISTS idx_score_history_created_at ON score_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cadet_achievements_cadet_id ON cadet_achievements(cadet_id);
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_is_main ON news(is_main);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_is_active ON tasks(is_active);
CREATE INDEX IF NOT EXISTS idx_task_submissions_cadet_id ON task_submissions(cadet_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_task_id ON task_submissions(task_id);