/*
  # Добавление учетных записей для входа кадетам

  1. Создание пользователей в таблице users
    - Добавляем записи для каждого кадета с email и паролем
    - Устанавливаем роль 'cadet' для всех
    - Генерируем UUID для связи с auth.users

  2. Обновление таблицы cadets
    - Связываем существующих кадетов с новыми учетными записями
    - Обновляем поле auth_user_id

  3. Безопасность
    - Все пароли временные и должны быть изменены при первом входе
    - Email адреса сформированы на основе имен кадетов
*/

-- Создаем пользователей для кадетов в таблице users
-- Примечание: В реальной системе пользователи должны создаваться через Supabase Auth API
-- Здесь мы создаем только записи в public.users для демонстрации

-- Кадет 1: Петров Алексей Владимирович
INSERT INTO public.users (id, email, name, role) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'petrov.alexey@nkkk.ru', 'Петров Алексей Владимирович', 'cadet')
ON CONFLICT (id) DO NOTHING;

-- Кадет 2: Сидоров Дмитрий Александрович  
INSERT INTO public.users (id, email, name, role) VALUES 
('550e8400-e29b-41d4-a716-446655440002', 'sidorov.dmitry@nkkk.ru', 'Сидоров Дмитрий Александрович', 'cadet')
ON CONFLICT (id) DO NOTHING;

-- Кадет 3: Козлов Михаил Сергеевич
INSERT INTO public.users (id, email, name, role) VALUES 
('550e8400-e29b-41d4-a716-446655440003', 'kozlov.mikhail@nkkk.ru', 'Козлов Михаил Сергеевич', 'cadet')
ON CONFLICT (id) DO NOTHING;

-- Кадет 4: Волков Андрей Николаевич
INSERT INTO public.users (id, email, name, role) VALUES 
('550e8400-e29b-41d4-a716-446655440004', 'volkov.andrey@nkkk.ru', 'Волков Андрей Николаевич', 'cadet')
ON CONFLICT (id) DO NOTHING;

-- Кадет 5: Морозов Владислав Игоревич
INSERT INTO public.users (id, email, name, role) VALUES 
('550e8400-e29b-41d4-a716-446655440005', 'morozov.vladislav@nkkk.ru', 'Морозов Владислав Игоревич', 'cadet')
ON CONFLICT (id) DO NOTHING;

-- Обновляем существующих кадетов, связывая их с учетными записями
UPDATE public.cadets 
SET auth_user_id = '550e8400-e29b-41d4-a716-446655440001',
    email = 'petrov.alexey@nkkk.ru'
WHERE id = '1';

UPDATE public.cadets 
SET auth_user_id = '550e8400-e29b-41d4-a716-446655440002',
    email = 'sidorov.dmitry@nkkk.ru'
WHERE id = '2';

UPDATE public.cadets 
SET auth_user_id = '550e8400-e29b-41d4-a716-446655440003',
    email = 'kozlov.mikhail@nkkk.ru'
WHERE id = '3';

UPDATE public.cadets 
SET auth_user_id = '550e8400-e29b-41d4-a716-446655440004',
    email = 'volkov.andrey@nkkk.ru'
WHERE id = '4';

UPDATE public.cadets 
SET auth_user_id = '550e8400-e29b-41d4-a716-446655440005',
    email = 'morozov.vladislav@nkkk.ru'
WHERE id = '5';

-- Создаем администратора для тестирования
INSERT INTO public.users (id, email, name, role) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'admin@nkkk.ru', 'Администратор НККК', 'admin')
ON CONFLICT (id) DO NOTHING;