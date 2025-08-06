/*
  # Insert Sample Data for NKKK Rating System

  1. Sample Data
    - Admin and cadet users
    - Sample cadets with different platoons
    - Sample achievements and auto achievements
    - Sample news articles
    - Sample tasks
    - Sample scores and history

  2. Notes
    - All passwords are simplified for demo purposes
    - Real implementation should use proper password hashing
*/

-- Insert sample users
INSERT INTO users (id, email, name, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'admin@nkkk.ru', 'Администратор Иванов И.И.', 'admin'),
  ('550e8400-e29b-41d4-a716-446655440001', 'petrov@nkkk.ru', 'Петров Алексей Владимирович', 'cadet'),
  ('550e8400-e29b-41d4-a716-446655440002', 'sidorov@nkkk.ru', 'Сидоров Дмитрий Александрович', 'cadet'),
  ('550e8400-e29b-41d4-a716-446655440003', 'kozlov@nkkk.ru', 'Козлов Михаил Сергеевич', 'cadet'),
  ('550e8400-e29b-41d4-a716-446655440004', 'volkov@nkkk.ru', 'Волков Андрей Николаевич', 'cadet'),
  ('550e8400-e29b-41d4-a716-446655440005', 'morozov@nkkk.ru', 'Морозов Владислав Игоревич', 'cadet')
ON CONFLICT (id) DO NOTHING;

-- Insert sample cadets
INSERT INTO cadets (id, auth_user_id, name, platoon, squad, rank, total_score, avatar_url, join_date) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Петров Алексей Владимирович', '10-1', 1, 1, 275, 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=200', '2023-09-01'),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Сидоров Дмитрий Александрович', '10-1', 1, 2, 268, 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?w=200', '2023-09-01'),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Козлов Михаил Сергеевич', '10-2', 2, 3, 255, 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?w=200', '2023-09-01'),
  ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Волков Андрей Николаевич', '9-1', 1, 4, 242, 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?w=200', '2023-09-01'),
  ('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'Морозов Владислав Игоревич', '9-2', 2, 5, 238, 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?w=200', '2023-09-01')
ON CONFLICT (id) DO NOTHING;

-- Insert sample scores
INSERT INTO scores (cadet_id, study_score, discipline_score, events_score) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 95, 88, 92),
  ('650e8400-e29b-41d4-a716-446655440002', 92, 86, 90),
  ('650e8400-e29b-41d4-a716-446655440003', 88, 84, 83),
  ('650e8400-e29b-41d4-a716-446655440004', 85, 82, 75),
  ('650e8400-e29b-41d4-a716-446655440005', 82, 78, 78)
ON CONFLICT (cadet_id) DO NOTHING;

-- Insert sample achievements
INSERT INTO achievements (id, title, description, category, icon, color) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', 'Отличник учёбы', 'За выдающиеся успехи в учебной деятельности', 'study', 'Star', 'from-blue-500 to-blue-700'),
  ('750e8400-e29b-41d4-a716-446655440002', 'Лидер взвода', 'За проявленные лидерские качества', 'discipline', 'Crown', 'from-yellow-500 to-yellow-700'),
  ('750e8400-e29b-41d4-a716-446655440003', 'Активист корпуса', 'За активное участие в мероприятиях', 'events', 'Users', 'from-green-500 to-green-700')
ON CONFLICT (id) DO NOTHING;

-- Insert sample auto achievements
INSERT INTO auto_achievements (id, title, description, icon, color, requirement_type, requirement_value) VALUES
  ('850e8400-e29b-41d4-a716-446655440001', 'Первые шаги', 'Набрать 50 баллов', 'Zap', 'from-green-500 to-green-700', 'total_score', 50),
  ('850e8400-e29b-41d4-a716-446655440002', 'На пути к успеху', 'Набрать 100 баллов', 'Target', 'from-blue-500 to-blue-700', 'total_score', 100),
  ('850e8400-e29b-41d4-a716-446655440003', 'Отличник', 'Набрать 200 баллов', 'Trophy', 'from-yellow-500 to-yellow-700', 'total_score', 200),
  ('850e8400-e29b-41d4-a716-446655440004', 'Мастер учёбы', 'Набрать 80 баллов по учёбе', 'BookOpen', 'from-blue-500 to-blue-700', 'category_score', 80),
  ('850e8400-e29b-41d4-a716-446655440005', 'Дисциплинированный', 'Набрать 80 баллов по дисциплине', 'Shield', 'from-red-500 to-red-700', 'category_score', 80)
ON CONFLICT (id) DO NOTHING;

-- Update requirement_category for category_score achievements
UPDATE auto_achievements 
SET requirement_category = 'study' 
WHERE id = '850e8400-e29b-41d4-a716-446655440004';

UPDATE auto_achievements 
SET requirement_category = 'discipline' 
WHERE id = '850e8400-e29b-41d4-a716-446655440005';

-- Insert sample cadet achievements
INSERT INTO cadet_achievements (cadet_id, auto_achievement_id, awarded_date) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '2024-01-15'),
  ('650e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440002', '2024-02-20'),
  ('650e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440003', '2024-03-10'),
  ('650e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', '2024-01-20'),
  ('650e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440002', '2024-02-25')
ON CONFLICT DO NOTHING;

-- Insert sample news
INSERT INTO news (id, title, content, author, is_main, background_image_url, images) VALUES
  ('950e8400-e29b-41d4-a716-446655440001', 'Победа в региональных соревнованиях', 'Кадеты нашего корпуса заняли первое место в региональных военно-спортивных соревнованиях. Команда показала отличную подготовку и слаженную работу.', 'Администрация НККК', true, 'https://images.pexels.com/photos/1263986/pexels-photo-1263986.jpeg?w=1200', ARRAY['https://images.pexels.com/photos/1263986/pexels-photo-1263986.jpeg?w=800']),
  ('950e8400-e29b-41d4-a716-446655440002', 'День открытых дверей', 'В субботу состоится день открытых дверей для будущих кадетов и их родителей. Приглашаем всех желающих познакомиться с нашим корпусом.', 'Приёмная комиссия', false, 'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?w=800', ARRAY['https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?w=600']),
  ('950e8400-e29b-41d4-a716-446655440003', 'Новые достижения кадетов', 'Поздравляем кадетов 10-го взвода с успешным завершением учебного модуля по истории казачества.', 'Преподавательский состав', false, 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?w=800', ARRAY[])
ON CONFLICT (id) DO NOTHING;

-- Insert sample tasks
INSERT INTO tasks (id, title, description, category, difficulty, points, deadline, is_active, created_by) VALUES
  ('a50e8400-e29b-41d4-a716-446655440001', 'Подготовить доклад по истории казачества', 'Подготовить и представить доклад на тему "История кубанского казачества" объёмом не менее 5 страниц.', 'study', 'medium', 15, '2024-12-31 23:59:59', true, '550e8400-e29b-41d4-a716-446655440000'),
  ('a50e8400-e29b-41d4-a716-446655440002', 'Участие в утренней зарядке', 'Принять участие в утренней зарядке в течение недели без пропусков.', 'discipline', 'easy', 10, '2024-12-25 23:59:59', true, '550e8400-e29b-41d4-a716-446655440000'),
  ('a50e8400-e29b-41d4-a716-446655440003', 'Организация мероприятия для младших кадетов', 'Организовать и провести познавательное мероприятие для кадетов младших курсов.', 'events', 'hard', 25, '2024-12-30 23:59:59', true, '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT (id) DO NOTHING;

-- Insert sample score history
INSERT INTO score_history (cadet_id, category, points, description, awarded_by) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'study', 5, 'Отличная работа на уроке истории', '550e8400-e29b-41d4-a716-446655440000'),
  ('650e8400-e29b-41d4-a716-446655440001', 'discipline', 3, 'Примерное поведение на построении', '550e8400-e29b-41d4-a716-446655440000'),
  ('650e8400-e29b-41d4-a716-446655440001', 'events', 8, 'Активное участие в спортивном мероприятии', '550e8400-e29b-41d4-a716-446655440000'),
  ('650e8400-e29b-41d4-a716-446655440002', 'study', 4, 'Хорошая подготовка к контрольной работе', '550e8400-e29b-41d4-a716-446655440000'),
  ('650e8400-e29b-41d4-a716-446655440002', 'discipline', 2, 'Соблюдение дисциплины в столовой', '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT DO NOTHING;