-- Create table for Epictus IA user preferences
CREATE TABLE IF NOT EXISTS epictus_ia_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  sound_enabled BOOLEAN NOT NULL DEFAULT true,
  sound_volume INTEGER NOT NULL DEFAULT 50,
  message_theme VARCHAR NOT NULL DEFAULT 'default',
  font_size VARCHAR NOT NULL DEFAULT 'medium',
  auto_save_history BOOLEAN NOT NULL DEFAULT true,
  keyboard_shortcuts BOOLEAN NOT NULL DEFAULT true,
  ai_intelligence_level VARCHAR NOT NULL DEFAULT 'normal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create table for Epictus IA chat messages
CREATE TABLE IF NOT EXISTS epictus_ia_messages (
  id BIGINT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender VARCHAR NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  is_file BOOLEAN NOT NULL DEFAULT false,
  file_name VARCHAR,
  file_type VARCHAR,
  is_edited BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create table for study plans
CREATE TABLE IF NOT EXISTS study_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  type VARCHAR NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create table for subjects within study plans
CREATE TABLE IF NOT EXISTS study_plan_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  color VARCHAR NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create table for tasks within study plans
CREATE TABLE IF NOT EXISTS study_plan_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES study_plan_subjects(id) ON DELETE SET NULL,
  name VARCHAR NOT NULL,
  due_date TIMESTAMPTZ,
  completed BOOLEAN NOT NULL DEFAULT false,
  priority VARCHAR NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create table for goals within study plans
CREATE TABLE IF NOT EXISTS study_plan_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create table for performance analytics
CREATE TABLE IF NOT EXISTS performance_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  study_time_minutes INTEGER NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  tasks_total INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create table for subject performance
CREATE TABLE IF NOT EXISTS subject_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES study_plan_subjects(id) ON DELETE SET NULL,
  subject_name VARCHAR NOT NULL,
  date DATE NOT NULL,
  score DECIMAL(4,2),
  study_time_minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE epictus_ia_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE epictus_ia_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plan_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plan_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plan_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_performance ENABLE ROW LEVEL SECURITY;

-- Create policies for epictus_ia_preferences
CREATE POLICY "Users can view their own preferences" 
  ON epictus_ia_preferences FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
  ON epictus_ia_preferences FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
  ON epictus_ia_preferences FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policies for epictus_ia_messages
CREATE POLICY "Users can view their own messages" 
  ON epictus_ia_messages FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages" 
  ON epictus_ia_messages FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" 
  ON epictus_ia_messages FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" 
  ON epictus_ia_messages FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for study_plans
CREATE POLICY "Users can view their own study plans" 
  ON study_plans FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study plans" 
  ON study_plans FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study plans" 
  ON study_plans FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study plans" 
  ON study_plans FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for study_plan_subjects
CREATE POLICY "Users can view subjects in their study plans" 
  ON study_plan_subjects FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM study_plans 
    WHERE study_plans.id = study_plan_subjects.plan_id 
    AND study_plans.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert subjects in their study plans" 
  ON study_plan_subjects FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM study_plans 