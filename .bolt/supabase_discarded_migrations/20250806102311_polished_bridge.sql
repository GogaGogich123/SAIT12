/*
  # Вставка тестовых данных

  1. Тестовые кадеты с правильными связями
  2. Баллы и достижения
  3. Задания и новости
  4. Автоматические достижения
*/

-- Вставка тестовых кадетов
INSERT INTO cadets (id, name, email, platoon, squad, total_score, rank, avatar_url) VALUES
('cadet1', 'Петров Алексей Владимирович', 'petrov@nkkk.ru', '10-1', 2, 275, 1, 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=400'),
('cadet2', 'Иванов Дмитрий Сергеевич', 'ivanov@nkkk.ru', '10-1', 1, 268, 2, 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?w=400'),
('cadet3', 'Сидоров Михаил Александрович', 'sidorov@nkkk.ru', '9-2', 3, 245, 3, 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?w=400'),
('cadet4', 'Козлов Андрей Викторович', 'kozlov@nkkk.ru', '11-1', 1, 232, 4, 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?w=400'),
('cadet5', 'Морозов Игорь Павлович', 'morozov@nkkk.ru', '8-1', 2, 218, 5, 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?w=400')
ON CONFLICT (id) DO NOTHING;

-- Вставка баллов для кадетов
INSERT INTO scores (cadet_id, study_score, discipline_score, events_score) VALUES
('cadet1', 95, 88, 92),
('cadet2', 92, 86, 90),
('cadet3', 88, 82, 75),
('cadet4', 85, 79, 68),
('cadet5', 82, 76, 60)
ON CONFLICT DO NOTHING;

-- Вставка автоматических достижений
INSERT INTO auto_achievements (id, title, description, icon, color, requirement_type, requirement_value, requirement_category) VALUES
('auto1', 'Первые шаги', 'Набрать 50 баллов', 'Star', 'from-blue-400 to-blue-600', 'total_score', 50, null),
('auto2', 'Хорошист', 'Набрать 100 баллов', 'CheckCircle', 'from-green-400 to-green-600', 'total_score', 100, null),
('auto3', 'Отличник', 'Набрать 200 баллов', 'Trophy', 'from-yellow-400 to-yellow-600', 'total_score', 200, null),
('auto4', 'Лидер', 'Набрать 300 баллов', 'Crown', 'from-purple-400 to-purple-600', 'total_score', 300, null),
('auto5', 'Ученый', 'Набрать 80 баллов по учебе', 'BookOpen', 'from-blue-500 to-blue-700', 'category_score', 80, 'study'),
('auto6', 'Дисциплинированный', 'Набрать 80 баллов по дисциплине', 'Shield', 'from-red-500 to-red-700', 'category_score', 80, 'discipline'),
('auto7', 'Активист', 'Набрать 80 баллов по мероприятиям', 'Users', 'from-green-500 to-green-700', 'category_score', 80, 'events')
ON CONFLICT (id) DO NOTHING;

-- Вставка достижений от администрации
INSERT INTO achievements (id, title, description, category, icon, color) VALUES
('ach1', 'Лучший кадет месяца', 'За выдающиеся успехи в учебе и дисциплине', 'general', 'Medal', 'from-yellow-500 to-orange-500'),
('ach2', 'Победитель олимпиады', 'За первое место в региональной олимпиаде', 'study', 'Trophy', 'from-blue-500 to-blue-700'),
('ach3', 'Спортивные достижения', 'За победу в спортивных соревнованиях', 'events', 'Zap', 'from-green-500 to-green-700')
ON CONFLICT (id) DO NOTHING;

-- Вставка достижений кадетов (автоматические)
INSERT INTO cadet_achievements (cadet_id, auto_achievement_id) VALUES
('cadet1', 'auto1'),
('cadet1', 'auto2'),
('cadet1', 'auto3'),
('cadet1', 'auto5'),
('cadet1', 'auto6'),
('cadet1', 'auto7'),
('cadet2', 'auto1'),
('cadet2', 'auto2'),
('cadet2', 'auto3'),
('cadet2', 'auto5'),
('cadet2', 'auto6'),
('cadet3', 'auto1'),
('cadet3', 'auto2'),
('cadet3', 'auto5'),
('cadet4', 'auto1'),
('cadet4', 'auto2'),
('cadet5', 'auto1')
ON CONFLICT DO NOTHING;

-- Вставка достижений от администрации
INSERT INTO cadet_achievements (cadet_id, achievement_id) VALUES
('cadet1', 'ach1'),
('cadet2', 'ach2')
ON CONFLICT DO NOTHING;

-- Вставка истории баллов
INSERT INTO score_history (cadet_id, category, points, description) VALUES
('cadet1', 'study', 15, 'Отличная контрольная работа по математике'),
('cadet1', 'discipline', 10, 'Образцовое поведение на построении'),
('cadet1', 'events', 12, 'Активное участие в военно-спортивной игре'),
('cadet2', 'study', 12, 'Хорошая презентация по истории'),
('cadet2', 'discipline', 8, 'Помощь младшим кадетам'),
('cadet3', 'events', 10, 'Участие в концерте ко Дню Победы')
ON CONFLICT DO NOTHING;

-- Вставка заданий
INSERT INTO tasks (id, title, description, category, points, difficulty, deadline, status) VALUES
('task1', 'Реферат по истории казачества', 'Написать реферат на 10-15 страниц о истории донского казачества', 'study', 25, 'medium', '2025-02-15', 'active'),
('task2', 'Подготовка к строевому смотру', 'Отработать строевые приемы и команды', 'discipline', 20, 'easy', '2025-02-10', 'active'),
('task3', 'Организация спортивного мероприятия', 'Помочь в организации турнира по футболу', 'events', 30, 'hard', '2025-02-20', 'active'),
('task4', 'Решение математических задач', 'Решить дополнительные задачи по алгебре', 'study', 15, 'easy', '2025-02-12', 'active'),
('task5', 'Дежурство по корпусу', 'Нести дежурство в течение недели', 'discipline', 18, 'medium', '2025-02-18', 'active')
ON CONFLICT (id) DO NOTHING;

-- Вставка сдач заданий
INSERT INTO task_submissions (task_id, cadet_id, status, submission_text, submitted_at) VALUES
('task1', 'cadet1', 'completed', 'Реферат готов, изучил множество источников о донском казачестве', '2025-01-20 10:00:00'),
('task2', 'cadet1', 'taken', null, null),
('task4', 'cadet2', 'submitted', 'Решил все задачи, приложил подробные решения', '2025-01-22 14:30:00')
ON CONFLICT DO NOTHING;

-- Вставка новостей
INSERT INTO news (id, title, content, author, is_main, background_image_url, images) VALUES
('news1', 'Победа в региональных соревнованиях', 'Кадеты нашего корпуса заняли первое место в региональных военно-спортивных соревнованиях. Команда показала отличную подготовку и слаженную работу.', 'Полковник Иванов И.И.', true, 'https://images.pexels.com/photos/6253311/pexels-photo-6253311.jpeg?w=1200', '["https://images.pexels.com/photos/6253311/pexels-photo-6253311.jpeg?w=800", "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?w=800"]'),
('news2', 'День открытых дверей', 'В субботу состоится день открытых дверей для будущих кадетов и их родителей. Начало в 10:00.', 'Майор Петров П.П.', false, null, '["https://images.pexels.com/photos/8923562/pexels-photo-8923562.jpeg?w=800"]'),
('news3', 'Новые достижения в учебе', 'Кадеты 10-1 взвода показали отличные результаты на олимпиаде по математике.', 'Капитан Сидоров С.С.', false, null, '[]')
ON CONFLICT (id) DO NOTHING;