# База данных НККК - Документация схемы

## Обзор

База данных системы рейтинга Новороссийского казачьего кадетского корпуса построена на PostgreSQL с использованием Supabase. Система включает в себя управление кадетами, их баллами, достижениями, заданиями и новостями.

## Структура базы данных

### Таблица `cadets` - Кадеты

Основная таблица для хранения информации о кадетах корпуса.

**Поля:**
- `id` (uuid, PRIMARY KEY) - Уникальный идентификатор кадета
- `auth_user_id` (uuid, FOREIGN KEY) - Связь с таблицей auth.users
- `name` (text, NOT NULL) - Полное имя кадета
- `email` (text, NOT NULL, UNIQUE) - Email адрес кадета
- `phone` (text) - Номер телефона
- `platoon` (text, NOT NULL) - Взвод (например, "10-1")
- `squad` (integer, NOT NULL) - Отделение (1, 2, 3)
- `avatar_url` (text) - URL аватара кадета
- `rank` (integer, DEFAULT 0) - Позиция в рейтинге
- `total_score` (integer, DEFAULT 0) - Общий балл кадета
- `join_date` (date, DEFAULT CURRENT_DATE) - Дата поступления в корпус
- `created_at` (timestamptz, DEFAULT now()) - Дата создания записи
- `updated_at` (timestamptz, DEFAULT now()) - Дата последнего обновления

**Индексы:**
- `cadets_pkey` - PRIMARY KEY на поле id
- `cadets_email_key` - UNIQUE INDEX на поле email

**Ограничения:**
- `cadets_email_key` - UNIQUE constraint на email
- `cadets_auth_user_id_fkey` - FOREIGN KEY на auth.users(id) с CASCADE DELETE

**RLS (Row Level Security):**
- Включена защита на уровне строк
- Анонимное чтение разрешено
- Аутентифицированные пользователи могут читать все данные кадетов
- Кадеты могут обновлять только свои данные

---

### Таблица `scores` - Баллы кадетов

Хранит текущие баллы кадетов по категориям.

**Поля:**
- `id` (uuid, PRIMARY KEY) - Уникальный идентификатор записи
- `cadet_id` (uuid, FOREIGN KEY, NOT NULL) - ID кадета
- `study_score` (integer, DEFAULT 0) - Баллы за учёбу
- `discipline_score` (integer, DEFAULT 0) - Баллы за дисциплину
- `events_score` (integer, DEFAULT 0) - Баллы за мероприятия
- `created_at` (timestamptz, DEFAULT now()) - Дата создания
- `updated_at` (timestamptz, DEFAULT now()) - Дата обновления

**Связи:**
- `scores_cadet_id_fkey` - FOREIGN KEY на cadets(id) с CASCADE DELETE

**Триггеры:**
- `check_achievements_trigger` - Проверяет автоматические достижения после обновления
- `update_rank_trigger` - Обновляет рейтинг кадета после изменения баллов

**RLS:**
- Анонимное и аутентифицированное чтение разрешено

---

### Таблица `achievements` - Достижения (создаваемые администратором)

Хранит достижения, которые может присуждать администратор.

**Поля:**
- `id` (uuid, PRIMARY KEY) - Уникальный идентификатор
- `title` (text, NOT NULL) - Название достижения
- `description` (text, NOT NULL) - Описание достижения
- `category` (text, NOT NULL) - Категория достижения
- `icon` (text, DEFAULT 'award') - Название иконки
- `color` (text, DEFAULT 'from-blue-500 to-cyan-500') - CSS классы для градиента
- `created_at` (timestamptz, DEFAULT now()) - Дата создания

**RLS:**
- Анонимное и аутентифицированное чтение разрешено

---

### Таблица `auto_achievements` - Автоматические достижения

Достижения, которые выдаются автоматически при достижении определённых условий.

**Поля:**
- `id` (uuid, PRIMARY KEY) - Уникальный идентификатор
- `title` (text, NOT NULL) - Название достижения
- `description` (text, NOT NULL) - Описание
- `icon` (text, DEFAULT 'star') - Иконка
- `color` (text, DEFAULT 'from-blue-400 to-blue-600') - Цветовая схема
- `requirement_type` (text, NOT NULL) - Тип требования ('total_score', 'category_score')
- `requirement_value` (integer, NOT NULL) - Значение для достижения
- `requirement_category` (text) - Категория для category_score ('study', 'discipline', 'events')
- `created_at` (timestamptz, DEFAULT now()) - Дата создания

**RLS:**
- Анонимное и аутентифицированное чтение разрешено

---

### Таблица `cadet_achievements` - Связь кадетов и достижений

Хранит информацию о присуждённых достижениях кадетам.

**Поля:**
- `id` (uuid, PRIMARY KEY) - Уникальный идентификатор
- `cadet_id` (uuid, FOREIGN KEY, NOT NULL) - ID кадета
- `achievement_id` (uuid, FOREIGN KEY) - ID обычного достижения
- `auto_achievement_id` (uuid, FOREIGN KEY) - ID автоматического достижения
- `awarded_date` (timestamptz, DEFAULT now()) - Дата присуждения
- `awarded_by` (uuid, FOREIGN KEY) - Кто присудил (для обычных достижений)

**Ограничения:**
- `check_achievement_type` - CHECK constraint: должен быть заполнен либо achievement_id, либо auto_achievement_id, но не оба

**Связи:**
- `cadet_achievements_cadet_id_fkey` - FOREIGN KEY на cadets(id) с CASCADE DELETE
- `cadet_achievements_achievement_id_fkey` - FOREIGN KEY на achievements(id) с CASCADE DELETE
- `cadet_achievements_auto_achievement_id_fkey` - FOREIGN KEY на auto_achievements(id) с CASCADE DELETE
- `cadet_achievements_awarded_by_fkey` - FOREIGN KEY на auth.users(id)

**RLS:**
- Анонимное и аутентифицированное чтение разрешено

---

### Таблица `tasks` - Задания

Хранит задания для кадетов.

**Поля:**
- `id` (uuid, PRIMARY KEY) - Уникальный идентификатор
- `title` (text, NOT NULL) - Название задания
- `description` (text, NOT NULL) - Описание задания
- `category` (text, NOT NULL) - Категория ('study', 'discipline', 'events')
- `points` (integer, DEFAULT 0, NOT NULL) - Количество баллов за выполнение
- `difficulty` (text, NOT NULL) - Сложность ('easy', 'medium', 'hard')
- `deadline` (date, NOT NULL) - Срок выполнения
- `status` (text, DEFAULT 'active') - Статус ('active', 'inactive')
- `created_by` (uuid, FOREIGN KEY) - Кто создал задание
- `created_at` (timestamptz, DEFAULT now()) - Дата создания
- `updated_at` (timestamptz, DEFAULT now()) - Дата обновления

**Ограничения:**
- `tasks_category_check` - CHECK: category IN ('study', 'discipline', 'events')
- `tasks_difficulty_check` - CHECK: difficulty IN ('easy', 'medium', 'hard')
- `tasks_status_check` - CHECK: status IN ('active', 'inactive')

**Связи:**
- `tasks_created_by_fkey` - FOREIGN KEY на auth.users(id)

**RLS:**
- Анонимное и аутентифицированное чтение только активных заданий

---

### Таблица `task_submissions` - Сдача заданий

Хранит информацию о взятых и сданных заданиях кадетами.

**Поля:**
- `id` (uuid, PRIMARY KEY) - Уникальный идентификатор
- `task_id` (uuid, FOREIGN KEY, NOT NULL) - ID задания
- `cadet_id` (uuid, FOREIGN KEY, NOT NULL) - ID кадета
- `status` (text, DEFAULT 'taken') - Статус ('taken', 'submitted', 'completed', 'rejected')
- `submission_text` (text) - Текст сдачи задания
- `submitted_at` (timestamptz) - Дата сдачи
- `reviewed_at` (timestamptz) - Дата проверки
- `reviewed_by` (uuid, FOREIGN KEY) - Кто проверил
- `feedback` (text) - Обратная связь от проверяющего
- `points_awarded` (integer, DEFAULT 0) - Присуждённые баллы
- `created_at` (timestamptz, DEFAULT now()) - Дата создания
- `updated_at` (timestamptz, DEFAULT now()) - Дата обновления

**Индексы:**
- `task_submissions_task_id_cadet_id_key` - UNIQUE INDEX на (task_id, cadet_id)

**Ограничения:**
- `task_submissions_status_check` - CHECK: status IN ('taken', 'submitted', 'completed', 'rejected')
- `task_submissions_task_id_cadet_id_key` - UNIQUE constraint на (task_id, cadet_id)

**Связи:**
- `task_submissions_task_id_fkey` - FOREIGN KEY на tasks(id) с CASCADE DELETE
- `task_submissions_cadet_id_fkey` - FOREIGN KEY на cadets(id) с CASCADE DELETE
- `task_submissions_reviewed_by_fkey` - FOREIGN KEY на auth.users(id)

**RLS:**
- Кадеты могут читать, создавать, обновлять и удалять только свои сдачи заданий

---

### Таблица `news` - Новости

Хранит новости корпуса.

**Поля:**
- `id` (uuid, PRIMARY KEY) - Уникальный идентификатор
- `title` (text, NOT NULL) - Заголовок новости
- `content` (text, NOT NULL) - Содержание новости
- `author` (text, NOT NULL) - Автор новости
- `is_main` (boolean, DEFAULT false) - Является ли главной новостью
- `background_image_url` (text) - URL фонового изображения
- `images` (jsonb, DEFAULT '[]') - Массив URL изображений
- `created_by` (uuid, FOREIGN KEY) - Кто создал новость
- `created_at` (timestamptz, DEFAULT now()) - Дата создания
- `updated_at` (timestamptz, DEFAULT now()) - Дата обновления

**Связи:**
- `news_created_by_fkey` - FOREIGN KEY на auth.users(id)

**RLS:**
- Анонимное и аутентифицированное чтение разрешено

---

### Таблица `score_history` - История начисления баллов

Хранит историю всех начислений и списаний баллов.

**Поля:**
- `id` (uuid, PRIMARY KEY) - Уникальный идентификатор
- `cadet_id` (uuid, FOREIGN KEY, NOT NULL) - ID кадета
- `category` (text, NOT NULL) - Категория ('study', 'discipline', 'events')
- `points` (integer, NOT NULL) - Количество баллов (может быть отрицательным)
- `description` (text, NOT NULL) - Описание за что начислены/списаны баллы
- `awarded_by` (uuid, FOREIGN KEY) - Кто начислил баллы
- `created_at` (timestamptz, DEFAULT now()) - Дата начисления

**Ограничения:**
- `score_history_category_check` - CHECK: category IN ('study', 'discipline', 'events')

**Связи:**
- `score_history_cadet_id_fkey` - FOREIGN KEY на cadets(id) с CASCADE DELETE
- `score_history_awarded_by_fkey` - FOREIGN KEY на auth.users(id)

**RLS:**
- Анонимное и аутентифицированное чтение разрешено

---

### Таблица `users` - Пользователи системы

Дополнительная информация о пользователях (дополняет auth.users).

**Поля:**
- `id` (uuid, PRIMARY KEY) - Уникальный идентификатор (совпадает с auth.users.id)
- `email` (text, NOT NULL, UNIQUE) - Email пользователя
- `password_hash` (text, NOT NULL) - Хеш пароля
- `role` (text, NOT NULL) - Роль ('admin', 'cadet')
- `name` (text, NOT NULL) - Имя пользователя
- `created_at` (timestamptz, DEFAULT now()) - Дата создания
- `updated_at` (timestamptz, DEFAULT now()) - Дата обновления

**Ограничения:**
- `users_role_check` - CHECK: role IN ('admin', 'cadet')
- `users_email_key` - UNIQUE constraint на email

**Триггеры:**
- `update_users_updated_at` - Автоматически обновляет updated_at при изменении записи

**RLS:**
- Анонимное чтение для проверки логина
- Пользователи могут читать только свои данные

---

## Функции базы данных

### `update_updated_at_column()`
Триггерная функция для автоматического обновления поля `updated_at`.

### `update_cadet_rank()`
Триггерная функция для пересчёта рейтинга кадетов после изменения баллов.

### `check_auto_achievements()`
Триггерная функция для проверки и автоматического присуждения достижений при изменении баллов.

---

## Связи между таблицами

```
auth.users (Supabase Auth)
├── cadets (auth_user_id)
├── users (id)
├── tasks (created_by)
├── news (created_by)
├── cadet_achievements (awarded_by)
└── score_history (awarded_by)

cadets
├── scores (cadet_id)
├── cadet_achievements (cadet_id)
├── task_submissions (cadet_id)
└── score_history (cadet_id)

tasks
└── task_submissions (task_id)

achievements
└── cadet_achievements (achievement_id)

auto_achievements
└── cadet_achievements (auto_achievement_id)
```

---

## Безопасность (RLS)

Все таблицы имеют включённую защиту на уровне строк (Row Level Security). Основные принципы:

1. **Публичное чтение**: Большинство данных доступно для анонимного чтения (рейтинги, новости, достижения)
2. **Ограниченная запись**: Только аутентифицированные пользователи могут создавать/изменять данные
3. **Персональные данные**: Кадеты могут изменять только свои данные
4. **Административные функции**: Создание новостей, заданий, присуждение достижений доступно только администраторам

---

## Индексы и производительность

- Все первичные ключи автоматически индексированы
- Уникальные поля (email) имеют соответствующие индексы
- Составной уникальный индекс на (task_id, cadet_id) в task_submissions предотвращает дублирование сдач заданий

---

## Миграции

Все изменения схемы базы данных должны выполняться через миграции в папке `/supabase/migrations/`. Каждая миграция должна содержать:

1. Описательный комментарий с объяснением изменений
2. Безопасные операции с использованием `IF EXISTS`/`IF NOT EXISTS`
3. Настройку RLS для новых таблиц
4. Создание необходимых политик безопасности

Пример структуры миграции:
```sql
/*
  # Название миграции
  
  1. Новые таблицы
    - описание таблиц
  2. Изменения
    - описание изменений
  3. Безопасность
    - настройки RLS и политик
*/

-- SQL код миграции
```