/*
  # Исправление проблем авторизации и безопасности

  1. Структурные изменения
    - Удаление устаревшего поля password_hash из таблицы users
    - Добавление недостающих RLS политик
    - Исправление триггеров и функций

  2. Безопасность
    - Настройка RLS политик для всех таблиц
    - Ограничение доступа по ролям
    - Защита административных операций

  3. Функции
    - Функция для автоматического создания пользователя
    - Обновление триггеров
*/

-- Удаляем устаревшее поле password_hash если оно существует
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE users DROP COLUMN password_hash;
  END IF;
END $$;

-- Создаем функцию для обработки новых пользователей
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'cadet')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем триггер для автоматического создания пользователя
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Функция для получения текущего пользователя
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;

-- Функция для получения роли пользователя
CREATE OR REPLACE FUNCTION auth.role() RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (SELECT role FROM public.users WHERE id = auth.uid())
  )
$$;

-- RLS политики для таблицы users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous login check" ON users;
CREATE POLICY "Allow anonymous login check" ON users
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- RLS политики для таблицы cadets
ALTER TABLE cadets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read cadets" ON cadets;
CREATE POLICY "Allow anonymous read cadets" ON cadets
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "Cadets can read all cadets data" ON cadets;
CREATE POLICY "Cadets can read all cadets data" ON cadets
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Cadets can update own data" ON cadets;
CREATE POLICY "Cadets can update own data" ON cadets
  FOR UPDATE TO authenticated
  USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Admins can manage cadets" ON cadets;
CREATE POLICY "Admins can manage cadets" ON cadets
  FOR ALL TO authenticated
  USING (auth.role() = 'admin');

-- RLS политики для таблицы achievements
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read achievements" ON achievements;
CREATE POLICY "Allow anonymous read achievements" ON achievements
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage achievements" ON achievements;
CREATE POLICY "Admins can manage achievements" ON achievements
  FOR ALL TO authenticated
  USING (auth.role() = 'admin');

-- RLS политики для таблицы auto_achievements
ALTER TABLE auto_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read auto achievements" ON auto_achievements;
CREATE POLICY "Allow anonymous read auto achievements" ON auto_achievements
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage auto achievements" ON auto_achievements;
CREATE POLICY "Admins can manage auto achievements" ON auto_achievements
  FOR ALL TO authenticated
  USING (auth.role() = 'admin');

-- RLS политики для таблицы cadet_achievements
ALTER TABLE cadet_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read cadet achievements" ON cadet_achievements;
CREATE POLICY "Allow anonymous read cadet achievements" ON cadet_achievements
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage cadet achievements" ON cadet_achievements;
CREATE POLICY "Admins can manage cadet achievements" ON cadet_achievements
  FOR ALL TO authenticated
  USING (auth.role() = 'admin');

-- RLS политики для таблицы tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read active tasks" ON tasks;
CREATE POLICY "Allow anonymous read active tasks" ON tasks
  FOR SELECT TO anon
  USING (status = 'active');

DROP POLICY IF EXISTS "Everyone can read active tasks" ON tasks;
CREATE POLICY "Everyone can read active tasks" ON tasks
  FOR SELECT TO authenticated
  USING (status = 'active');

DROP POLICY IF EXISTS "Admins can manage tasks" ON tasks;
CREATE POLICY "Admins can manage tasks" ON tasks
  FOR ALL TO authenticated
  USING (auth.role() = 'admin');

-- RLS политики для таблицы task_submissions
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cadets can read own task submissions" ON task_submissions;
CREATE POLICY "Cadets can read own task submissions" ON task_submissions
  FOR SELECT TO authenticated
  USING (
    cadet_id IN (
      SELECT id FROM cadets WHERE auth_user_id = auth.uid()
    ) OR auth.role() = 'admin'
  );

DROP POLICY IF EXISTS "Cadets can insert own task submissions" ON task_submissions;
CREATE POLICY "Cadets can insert own task submissions" ON task_submissions
  FOR INSERT TO authenticated
  WITH CHECK (
    cadet_id IN (
      SELECT id FROM cadets WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Cadets can update own task submissions" ON task_submissions;
CREATE POLICY "Cadets can update own task submissions" ON task_submissions
  FOR UPDATE TO authenticated
  USING (
    cadet_id IN (
      SELECT id FROM cadets WHERE auth_user_id = auth.uid()
    ) OR auth.role() = 'admin'
  );

DROP POLICY IF EXISTS "Cadets can delete own task submissions" ON task_submissions;
CREATE POLICY "Cadets can delete own task submissions" ON task_submissions
  FOR DELETE TO authenticated
  USING (
    cadet_id IN (
      SELECT id FROM cadets WHERE auth_user_id = auth.uid()
    )
  );

-- RLS политики для таблицы news
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read news" ON news;
CREATE POLICY "Allow anonymous read news" ON news
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage news" ON news;
CREATE POLICY "Admins can manage news" ON news
  FOR ALL TO authenticated
  USING (auth.role() = 'admin');

-- RLS политики для таблицы scores
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read scores" ON scores;
CREATE POLICY "Allow anonymous read scores" ON scores
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage scores" ON scores;
CREATE POLICY "Admins can manage scores" ON scores
  FOR ALL TO authenticated
  USING (auth.role() = 'admin');

-- RLS политики для таблицы score_history
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read score history" ON score_history;
CREATE POLICY "Allow anonymous read score history" ON score_history
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage score history" ON score_history;
CREATE POLICY "Admins can manage score history" ON score_history
  FOR ALL TO authenticated
  USING (auth.role() = 'admin');

-- Обновляем существующие записи кадетов, если auth_user_id не заполнен
-- Это нужно сделать только если есть пользователи без связи
UPDATE cadets 
SET auth_user_id = (
  SELECT id FROM auth.users 
  WHERE email = cadets.email 
  LIMIT 1
)
WHERE auth_user_id IS NULL 
AND EXISTS (
  SELECT 1 FROM auth.users 
  WHERE email = cadets.email
);