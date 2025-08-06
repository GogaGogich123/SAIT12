/*
  # Создание системы аутентификации

  1. Новые таблицы
    - `auth_users` - пользователи системы
    - Связь с существующими кадетами через `auth_user_id`
  
  2. Тестовые данные
    - Администратор: admin@nkkk.ru / admin123
    - Кадеты с логинами и паролями
  
  3. Безопасность
    - Хеширование паролей
    - RLS политики
*/

-- Создаем таблицу пользователей для аутентификации
CREATE TABLE IF NOT EXISTS auth_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'cadet')),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Включаем RLS
ALTER TABLE auth_users ENABLE ROW LEVEL SECURITY;

-- Политики для auth_users
CREATE POLICY "Allow anonymous login check"
  ON auth_users
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can read own data"
  ON auth_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для обновления updated_at
CREATE TRIGGER update_auth_users_updated_at
    BEFORE UPDATE ON auth_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Вставляем администратора
INSERT INTO auth_users (email, password_hash, role, name) VALUES
('admin@nkkk.ru', '$2b$10$8K1p/a0dqbPyuqiXkNYOL.eMhX6pIBqyCdHVUjjHg6P0nGxCr5jqy', 'admin', 'Администратор Иванов И.И.');

-- Обновляем существующих кадетов с тестовыми данными
DO $$
DECLARE
    cadet_record RECORD;
    user_id uuid;
    cadet_email text;
    cadet_password text;
BEGIN
    -- Создаем пользователей для первых 10 кадетов
    FOR cadet_record IN 
        SELECT id, name, platoon, squad 
        FROM cadets 
        ORDER BY rank 
        LIMIT 10
    LOOP
        -- Генерируем email и пароль для кадета
        cadet_email := 'cadet' || cadet_record.platoon || '_' || cadet_record.squad || '_' || SUBSTRING(cadet_record.name FROM 1 FOR 3) || '@nkkk.ru';
        cadet_password := 'cadet' || cadet_record.platoon || cadet_record.squad;
        
        -- Создаем пользователя
        INSERT INTO auth_users (email, password_hash, role, name)
        VALUES (
            cadet_email,
            '$2b$10$8K1p/a0dqbPyuqiXkNYOL.eMhX6pIBqyCdHVUjjHg6P0nGxCr5jqy', -- хеш для простого пароля
            'cadet',
            cadet_record.name
        )
        RETURNING id INTO user_id;
        
        -- Связываем с кадетом
        UPDATE cadets 
        SET auth_user_id = user_id 
        WHERE id = cadet_record.id;
    END LOOP;
END $$;

-- Добавляем несколько конкретных тестовых аккаунтов
INSERT INTO auth_users (email, password_hash, role, name) VALUES
('petrov@nkkk.ru', '$2b$10$8K1p/a0dqbPyuqiXkNYOL.eMhX6pIBqyCdHVUjjHg6P0nGxCr5jqy', 'cadet', 'Петров Алексей Владимирович'),
('sidorov@nkkk.ru', '$2b$10$8K1p/a0dqbPyuqiXkNYOL.eMhX6pIBqyCdHVUjjHg6P0nGxCr5jqy', 'cadet', 'Сидоров Дмитрий Александрович'),
('kozlov@nkkk.ru', '$2b$10$8K1p/a0dqbPyuqiXkNYOL.eMhX6pIBqyCdHVUjjHg6P0nGxCr5jqy', 'cadet', 'Козлов Михаил Сергеевич');

-- Связываем тестовых кадетов с существующими записями (если они есть)
DO $$
DECLARE
    test_cadets text[] := ARRAY['Петров Алексей Владимирович', 'Сидоров Дмитрий Александрович', 'Козлов Михаил Сергеевич'];
    cadet_name text;
    user_record RECORD;
    cadet_record RECORD;
BEGIN
    FOREACH cadet_name IN ARRAY test_cadets
    LOOP
        -- Находим пользователя
        SELECT id INTO user_record FROM auth_users WHERE name = cadet_name;
        
        -- Находим кадета с похожим именем
        SELECT id INTO cadet_record FROM cadets WHERE name ILIKE '%' || SPLIT_PART(cadet_name, ' ', 1) || '%' LIMIT 1;
        
        -- Если нашли кадета, связываем
        IF cadet_record.id IS NOT NULL AND user_record.id IS NOT NULL THEN
            UPDATE cadets SET auth_user_id = user_record.id WHERE id = cadet_record.id;
        END IF;
    END LOOP;
END $$;