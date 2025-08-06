/*
  # Создание полной схемы базы данных для НККК

  1. Новые таблицы
    - Все основные таблицы системы с правильными полями и связями
    - Правильная настройка RLS и политик безопасности
    
  2. Безопасность
    - Включение RLS на всех таблицах
    - Публичные политики для чтения данных
    - Политики для аутентифицированных пользователей
    
  3. Функции и триггеры
    - Автоматическое обновление рангов
    - Проверка достижений
    - Обновление временных меток
*/

-- Создание таблицы кадетов
CREATE TABLE IF NOT EXISTS cadets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  platoon text NOT NULL,
  squad integer NOT NULL,
  avatar_url text,
  rank integer DEFAULT 0,
  total_score integer DEFAULT 0,
  join_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создание таблицы баллов
CREATE TABLE IF NOT EXISTS scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cadet_id uuid NOT NULL REFERENCES cadets(id) ON DELETE CASCADE,
  study_score integer DEFAULT 0,
  discipline_score integer DEFAULT 0,
  events_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создание таблицы достижений
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  icon text DEFAULT 'award',
  color text DEFAULT 'from-blue-500 to-cyan-500',
  created_at timestamptz DEFAULT now()
);

-- Создание таблицы автоматических достижений
CREATE TABLE IF NOT EXISTS auto_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon text DEFAULT 'star',
  color text DEFAULT 'from-blue-400 to-blue-600',
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL,
  requirement_category text,
  created_at timestamptz DEFAULT now()
);

-- Создание таблицы достижений кадетов
CREATE TABLE IF NOT EXISTS cadet_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cadet_id uuid NOT NULL REFERENCES cadets(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE,
  auto_achievement_id uuid REFERENCES auto_achievements(id) ON DELETE CASCADE,
  awarded_date timestamptz DEFAULT now(),
  awarded_by uuid REFERENCES auth.users(id),
  CONSTRAINT check_achievement_type CHECK (
    (achievement_id IS NOT NULL AND auto_achievement_id IS NULL) OR
    (achievement_id IS NULL AND auto_achievement_id IS NOT NULL)
  )
);

-- Создание таблицы заданий
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('study', 'discipline', 'events')),
  points integer DEFAULT 0,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  deadline date NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создание таблицы сдач заданий
CREATE TABLE IF NOT EXISTS task_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  cadet_id uuid NOT NULL REFERENCES cadets(id) ON DELETE CASCADE,
  status text DEFAULT 'taken' CHECK (status IN ('taken', 'submitted', 'completed', 'rejected')),
  submission_text text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  feedback text,
  points_awarded integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(task_id, cadet_id)
);

-- Создание таблицы новостей
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author text NOT NULL,
  is_main boolean DEFAULT false,
  background_image_url text,
  images jsonb DEFAULT '[]',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создание таблицы истории баллов
CREATE TABLE IF NOT EXISTS score_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cadet_id uuid NOT NULL REFERENCES cadets(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('study', 'discipline', 'events')),
  points integer NOT NULL,
  description text NOT NULL,
  awarded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Создание таблицы пользователей (для совместимости)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'cadet')),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Функция обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Функция обновления ранга кадета
CREATE OR REPLACE FUNCTION update_cadet_rank()
RETURNS TRIGGER AS $$
BEGIN
  -- Обновляем общий балл кадета
  UPDATE cadets 
  SET total_score = NEW.study_score + NEW.discipline_score + NEW.events_score
  WHERE id = NEW.cadet_id;
  
  -- Обновляем ранги всех кадетов
  WITH ranked_cadets AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY total_score DESC) as new_rank
    FROM cadets
  )
  UPDATE cadets 
  SET rank = ranked_cadets.new_rank
  FROM ranked_cadets
  WHERE cadets.id = ranked_cadets.id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Функция проверки автоматических достижений
CREATE OR REPLACE FUNCTION check_auto_achievements()
RETURNS TRIGGER AS $$
DECLARE
  cadet_record RECORD;
  achievement_record RECORD;
BEGIN
  -- Получаем данные кадета
  SELECT * INTO cadet_record FROM cadets WHERE id = NEW.cadet_id;
  
  -- Проверяем все автоматические достижения
  FOR achievement_record IN 
    SELECT * FROM auto_achievements
  LOOP
    -- Проверяем, есть ли уже это достижение у кадета
    IF NOT EXISTS (
      SELECT 1 FROM cadet_achievements 
      WHERE cadet_id = NEW.cadet_id 
      AND auto_achievement_id = achievement_record.id
    ) THEN
      -- Проверяем условия достижения
      IF (achievement_record.requirement_type = 'total_score' AND 
          cadet_record.total_score >= achievement_record.requirement_value) OR
         (achievement_record.requirement_type = 'category_score' AND
          achievement_record.requirement_category = 'study' AND
          NEW.study_score >= achievement_record.requirement_value) OR
         (achievement_record.requirement_type = 'category_score' AND
          achievement_record.requirement_category = 'discipline' AND
          NEW.discipline_score >= achievement_record.requirement_value) OR
         (achievement_record.requirement_type = 'category_score' AND
          achievement_record.requirement_category = 'events' AND
          NEW.events_score >= achievement_record.requirement_value) THEN
        
        -- Добавляем достижение
        INSERT INTO cadet_achievements (cadet_id, auto_achievement_id)
        VALUES (NEW.cadet_id, achievement_record.id);
      END IF;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Создание триггеров
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rank_trigger 
  AFTER INSERT OR UPDATE ON scores 
  FOR EACH ROW EXECUTE FUNCTION update_cadet_rank();

CREATE TRIGGER check_achievements_trigger 
  AFTER INSERT OR UPDATE ON scores 
  FOR EACH ROW EXECUTE FUNCTION check_auto_achievements();

-- Включение RLS на всех таблицах
ALTER TABLE cadets ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE cadet_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Политики для публичного чтения
CREATE POLICY "Allow anonymous read cadets" ON cadets FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read scores" ON scores FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read achievements" ON achievements FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read auto achievements" ON auto_achievements FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read cadet achievements" ON cadet_achievements FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read active tasks" ON tasks FOR SELECT TO anon USING (status = 'active');
CREATE POLICY "Allow anonymous read news" ON news FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read score history" ON score_history FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous login check" ON users FOR SELECT TO anon USING (true);

-- Политики для аутентифицированных пользователей
CREATE POLICY "Cadets can read all cadets data" ON cadets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Cadets can update own data" ON cadets FOR UPDATE TO authenticated USING (auth.uid() = auth_user_id);

CREATE POLICY "Everyone can read scores" ON scores FOR SELECT TO authenticated USING (true);

CREATE POLICY "Everyone can read achievements" ON achievements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Everyone can read auto achievements" ON auto_achievements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Everyone can read cadet achievements" ON cadet_achievements FOR SELECT TO authenticated USING (true);

CREATE POLICY "Everyone can read active tasks" ON tasks FOR SELECT TO authenticated USING (status = 'active');

CREATE POLICY "Cadets can read own task submissions" ON task_submissions FOR SELECT TO authenticated 
  USING (cadet_id IN (SELECT id FROM cadets WHERE auth_user_id = auth.uid()));
CREATE POLICY "Cadets can insert own task submissions" ON task_submissions FOR INSERT TO authenticated 
  WITH CHECK (cadet_id IN (SELECT id FROM cadets WHERE auth_user_id = auth.uid()));
CREATE POLICY "Cadets can update own task submissions" ON task_submissions FOR UPDATE TO authenticated 
  USING (cadet_id IN (SELECT id FROM cadets WHERE auth_user_id = auth.uid()));
CREATE POLICY "Cadets can delete own task submissions" ON task_submissions FOR DELETE TO authenticated 
  USING (cadet_id IN (SELECT id FROM cadets WHERE auth_user_id = auth.uid()));

CREATE POLICY "Everyone can read news" ON news FOR SELECT TO authenticated USING (true);
CREATE POLICY "Everyone can read score history" ON score_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read own data" ON users FOR SELECT TO authenticated USING (auth.uid() = id);