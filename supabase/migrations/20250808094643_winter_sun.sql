/*
  # Настройка пользователей и связи с Supabase Auth

  1. Обновление таблицы users
    - Связываем с auth.users через id
    - Убираем password_hash (используем Supabase Auth)
  
  2. Обновление таблицы cadets
    - Связываем с auth.users через auth_user_id
  
  3. Создание функций и триггеров
    - Автоматическое создание записи в users при регистрации
*/

-- Обновляем таблицу users
ALTER TABLE users DROP COLUMN IF EXISTS password_hash;
ALTER TABLE users ADD COLUMN IF NOT EXISTS id uuid PRIMARY KEY DEFAULT gen_random_uuid();

-- Добавляем внешний ключ к auth.users если его нет
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_id_fkey'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Функция для автоматического создания записи пользователя
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'cadet')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для автоматического создания пользователя
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Обновляем RLS политики для users
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow anonymous login check" ON users;
CREATE POLICY "Allow service role full access"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Обновляем политики для cadets
DROP POLICY IF EXISTS "Cadets can update own data" ON cadets;
CREATE POLICY "Cadets can update own data"
  ON cadets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- Создаем несколько тестовых пользователей для демонстрации
-- (В реальном проекте это будет делаться через интерфейс регистрации)

-- Вставляем тестовых пользователей в auth.users (это нужно делать через Supabase Dashboard или API)
-- Здесь мы создаем только записи в таблице users для существующих auth пользователей

-- Если нужно создать тестового администратора
INSERT INTO users (id, email, name, role) 
VALUES (
  gen_random_uuid(),
  'admin@nkkk.ru',
  'Администратор Системы',
  'admin'
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Обновляем существующие записи кадетов, если они есть
UPDATE cadets SET auth_user_id = (
  SELECT id FROM users WHERE email = 'petrov@nkkk.ru' LIMIT 1
) WHERE name = 'Петров Алексей Владимирович' AND auth_user_id IS NULL;

UPDATE cadets SET auth_user_id = (
  SELECT id FROM users WHERE email = 'sidorov@nkkk.ru' LIMIT 1
) WHERE name = 'Сидоров Дмитрий Александрович' AND auth_user_id IS NULL;

UPDATE cadets SET auth_user_id = (
  SELECT id FROM users WHERE email = 'kozlov@nkkk.ru' LIMIT 1
) WHERE name = 'Козлов Михаил Сергеевич' AND auth_user_id IS NULL;