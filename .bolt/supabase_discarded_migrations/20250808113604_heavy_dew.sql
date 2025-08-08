/*
  # Создание тестовых пользователей

  1. Описание
     - Создаёт тестовых пользователей для демонстрации системы
     - Включает администратора и 5 кадетов
     - Автоматически связывает auth.users с таблицами users и cadets

  2. Пользователи
     - admin@nkkk.ru (администратор)
     - petrov.alexey@nkkk.ru (кадет #1)
     - sidorov.dmitry@nkkk.ru (кадет #2)
     - kozlov.mikhail@nkkk.ru (кадет #3)
     - volkov.andrey@nkkk.ru (кадет #4)
     - morozov.vladislav@nkkk.ru (кадет #5)

  3. Важно
     - Все пароли временные и должны быть изменены в продакшене
     - Email подтверждение отключено для тестирования
     - Используются фиксированные UUID для предсказуемости

  ВНИМАНИЕ: Этот скрипт создаёт пользователей напрямую в auth.users.
  В продакшене используйте Supabase Admin API или Dashboard.
*/

-- Создаём администратора
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@nkkk.ru',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Администратор", "role": "admin"}',
  false,
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Создаём кадетов
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
) VALUES 
(
  '00000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'petrov.alexey@nkkk.ru',
  crypt('cadet123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Петров Алексей Владимирович", "role": "cadet"}',
  false,
  'authenticated',
  'authenticated'
),
(
  '00000000-0000-0000-0000-000000000003'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'sidorov.dmitry@nkkk.ru',
  crypt('cadet123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Сидоров Дмитрий Александрович", "role": "cadet"}',
  false,
  'authenticated',
  'authenticated'
),
(
  '00000000-0000-0000-0000-000000000004'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'kozlov.mikhail@nkkk.ru',
  crypt('cadet123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Козлов Михаил Сергеевич", "role": "cadet"}',
  false,
  'authenticated',
  'authenticated'
),
(
  '00000000-0000-0000-0000-000000000005'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'volkov.andrey@nkkk.ru',
  crypt('cadet123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Волков Андрей Николаевич", "role": "cadet"}',
  false,
  'authenticated',
  'authenticated'
),
(
  '00000000-0000-0000-0000-000000000006'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'morozov.vladislav@nkkk.ru',
  crypt('cadet123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Морозов Владислав Игоревич", "role": "cadet"}',
  false,
  'authenticated',
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- Создаём записи в таблице users
INSERT INTO public.users (
  id,
  email,
  role,
  name,
  created_at,
  updated_at
) VALUES 
(
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin@nkkk.ru',
  'admin',
  'Администратор',
  now(),
  now()
),
(
  '00000000-0000-0000-0000-000000000002'::uuid,
  'petrov.alexey@nkkk.ru',
  'cadet',
  'Петров Алексей Владимирович',
  now(),
  now()
),
(
  '00000000-0000-0000-0000-000000000003'::uuid,
  'sidorov.dmitry@nkkk.ru',
  'cadet',
  'Сидоров Дмитрий Александрович',
  now(),
  now()
),
(
  '00000000-0000-0000-0000-000000000004'::uuid,
  'kozlov.mikhail@nkkk.ru',
  'cadet',
  'Козлов Михаил Сергеевич',
  now(),
  now()
),
(
  '00000000-0000-0000-0000-000000000005'::uuid,
  'volkov.andrey@nkkk.ru',
  'cadet',
  'Волков Андрей Николаевич',
  now(),
  now()
),
(
  '00000000-0000-0000-0000-000000000006'::uuid,
  'morozov.vladislav@nkkk.ru',
  'cadet',
  'Морозов Владислав Игоревич',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Создаём записи кадетов
INSERT INTO public.cadets (
  id,
  auth_user_id,
  name,
  email,
  phone,
  platoon,
  squad,
  avatar_url,
  rank,
  total_score,
  join_date,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000002'::uuid,
  'Петров Алексей Владимирович',
  'petrov.alexey@nkkk.ru',
  '+7 (918) 123-45-67',
  '10-1',
  1,
  'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=200',
  1,
  275,
  '2023-09-01',
  now(),
  now()
),
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000003'::uuid,
  'Сидоров Дмитрий Александрович',
  'sidorov.dmitry@nkkk.ru',
  '+7 (918) 234-56-78',
  '10-1',
  1,
  'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?w=200',
  2,
  268,
  '2023-09-01',
  now(),
  now()
),
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000004'::uuid,
  'Козлов Михаил Сергеевич',
  'kozlov.mikhail@nkkk.ru',
  '+7 (918) 345-67-89',
  '10-2',
  2,
  'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?w=200',
  3,
  255,
  '2023-09-01',
  now(),
  now()
),
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000005'::uuid,
  'Волков Андрей Николаевич',
  'volkov.andrey@nkkk.ru',
  '+7 (918) 456-78-90',
  '9-1',
  1,
  'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?w=200',
  4,
  242,
  '2023-09-01',
  now(),
  now()
),
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000006'::uuid,
  'Морозов Владислав Игоревич',
  'morozov.vladislav@nkkk.ru',
  '+7 (918) 567-89-01',
  '9-2',
  2,
  'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?w=200',
  5,
  238,
  '2023-09-01',
  now(),
  now()
)
ON CONFLICT (auth_user_id) DO NOTHING;

-- Создаём начальные баллы для кадетов
INSERT INTO public.scores (
  id,
  cadet_id,
  study_score,
  discipline_score,
  events_score,
  created_at,
  updated_at
) 
SELECT 
  gen_random_uuid(),
  c.id,
  CASE 
    WHEN c.name LIKE '%Петров%' THEN 95
    WHEN c.name LIKE '%Сидоров%' THEN 92
    WHEN c.name LIKE '%Козлов%' THEN 88
    WHEN c.name LIKE '%Волков%' THEN 85
    WHEN c.name LIKE '%Морозов%' THEN 82
    ELSE 80
  END as study_score,
  CASE 
    WHEN c.name LIKE '%Петров%' THEN 88
    WHEN c.name LIKE '%Сидоров%' THEN 86
    WHEN c.name LIKE '%Козлов%' THEN 84
    WHEN c.name LIKE '%Волков%' THEN 82
    WHEN c.name LIKE '%Морозов%' THEN 78
    ELSE 75
  END as discipline_score,
  CASE 
    WHEN c.name LIKE '%Петров%' THEN 92
    WHEN c.name LIKE '%Сидоров%' THEN 90
    WHEN c.name LIKE '%Козлов%' THEN 83
    WHEN c.name LIKE '%Волков%' THEN 75
    WHEN c.name LIKE '%Морозов%' THEN 78
    ELSE 70
  END as events_score,
  now(),
  now()
FROM public.cadets c
WHERE c.auth_user_id IN (
  '00000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000003'::uuid,
  '00000000-0000-0000-0000-000000000004'::uuid,
  '00000000-0000-0000-0000-000000000005'::uuid,
  '00000000-0000-0000-0000-000000000006'::uuid
)
ON CONFLICT (cadet_id) DO NOTHING;

-- Создаём автоматические достижения
INSERT INTO public.auto_achievements (
  id,
  title,
  description,
  icon,
  color,
  requirement_type,
  requirement_value,
  requirement_category,
  created_at
) VALUES 
(
  gen_random_uuid(),
  'Первые шаги',
  'Набрать 50 баллов',
  'Zap',
  'from-green-500 to-green-700',
  'total_score',
  50,
  null,
  now()
),
(
  gen_random_uuid(),
  'На пути к успеху',
  'Набрать 100 баллов',
  'Target',
  'from-blue-500 to-blue-700',
  'total_score',
  100,
  null,
  now()
),
(
  gen_random_uuid(),
  'Отличник',
  'Набрать 200 баллов',
  'Trophy',
  'from-yellow-500 to-yellow-700',
  'total_score',
  200,
  null,
  now()
),
(
  gen_random_uuid(),
  'Мастер учёбы',
  'Набрать 80 баллов по учёбе',
  'BookOpen',
  'from-blue-500 to-blue-700',
  'category_score',
  80,
  'study',
  now()
),
(
  gen_random_uuid(),
  'Дисциплинированный',
  'Набрать 80 баллов по дисциплине',
  'Shield',
  'from-red-500 to-red-700',
  'category_score',
  80,
  'discipline',
  now()
),
(
  gen_random_uuid(),
  'Активист',
  'Набрать 80 баллов за мероприятия',
  'Users',
  'from-green-500 to-green-700',
  'category_score',
  80,
  'events',
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Создаём несколько достижений от администрации
INSERT INTO public.achievements (
  id,
  title,
  description,
  category,
  icon,
  color,
  created_at
) VALUES 
(
  gen_random_uuid(),
  'Отличник учёбы',
  'За выдающиеся успехи в учебной деятельности',
  'study',
  'Star',
  'from-blue-500 to-blue-700',
  now()
),
(
  gen_random_uuid(),
  'Лидер взвода',
  'За проявленные лидерские качества',
  'leadership',
  'Crown',
  'from-yellow-500 to-yellow-700',
  now()
),
(
  gen_random_uuid(),
  'Активист корпуса',
  'За активное участие в мероприятиях',
  'events',
  'Users',
  'from-green-500 to-green-700',
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Присуждаем достижение лучшему кадету
INSERT INTO public.cadet_achievements (
  id,
  cadet_id,
  achievement_id,
  awarded_date,
  awarded_by
)
SELECT 
  gen_random_uuid(),
  c.id,
  a.id,
  now(),
  '00000000-0000-0000-0000-000000000001'::uuid
FROM public.cadets c
CROSS JOIN public.achievements a
WHERE c.name LIKE '%Петров%' 
  AND a.title = 'Отличник учёбы'
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Создаём тестовые новости
INSERT INTO public.news (
  id,
  title,
  content,
  author,
  is_main,
  background_image_url,
  images,
  created_by,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'Победа в региональных соревнованиях',
  'Кадеты нашего корпуса заняли первое место в региональных военно-спортивных соревнованиях. Команда показала отличную подготовку и слаженную работу.',
  'Администрация НККК',
  true,
  'https://images.pexels.com/photos/1263986/pexels-photo-1263986.jpeg?w=1200',
  '["https://images.pexels.com/photos/1263986/pexels-photo-1263986.jpeg?w=800"]'::jsonb,
  '00000000-0000-0000-0000-000000000001'::uuid,
  now(),
  now()
),
(
  gen_random_uuid(),
  'День открытых дверей',
  'В субботу состоится день открытых дверей для будущих кадетов и их родителей. Приглашаем всех желающих познакомиться с нашим корпусом.',
  'Приёмная комиссия',
  false,
  'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?w=800',
  '["https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?w=600"]'::jsonb,
  '00000000-0000-0000-0000-000000000001'::uuid,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Создаём тестовые задания
INSERT INTO public.tasks (
  id,
  title,
  description,
  category,
  points,
  difficulty,
  deadline,
  status,
  created_by,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'Подготовить доклад по истории казачества',
  'Подготовить и представить доклад на тему "История кубанского казачества" объёмом не менее 5 страниц.',
  'study',
  15,
  'medium',
  '2024-12-31',
  'active',
  '00000000-0000-0000-0000-000000000001'::uuid,
  now(),
  now()
),
(
  gen_random_uuid(),
  'Участие в утренней зарядке',
  'Принять участие в утренней зарядке в течение недели без пропусков.',
  'discipline',
  10,
  'easy',
  '2024-12-25',
  'active',
  '00000000-0000-0000-0000-000000000001'::uuid,
  now(),
  now()
),
(
  gen_random_uuid(),
  'Организация мероприятия для младших кадетов',
  'Организовать и провести познавательное мероприятие для кадетов младших курсов.',
  'events',
  25,
  'hard',
  '2024-12-30',
  'active',
  '00000000-0000-0000-0000-000000000001'::uuid,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;