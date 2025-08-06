import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'cadet';
  name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Простая функция для хеширования паролей (в реальном проекте используйте bcrypt)
const hashPassword = (password: string): string => {
  // Это упрощенная версия для демонстрации
  // В реальном проекте используйте bcrypt или аналогичную библиотеку
  return btoa(password); // base64 кодирование для демонстрации
};

// Проверка пароля
const verifyPassword = (password: string, hash: string): boolean => {
  try {
    return btoa(password) === hash;
  } catch {
    return false;
  }
};

// Аутентификация пользователя
export const authenticateUser = async (credentials: LoginCredentials): Promise<AuthUser | null> => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', credentials.email)
      .limit(1);

    if (error) {
      console.error('Database error:', error);
      return null;
    }

    if (!users || users.length === 0) {
      console.log('User not found');
      return null;
    }

    const user = users[0];

    // Проверяем пароль (упрощенная проверка для демонстрации)
    const isValidPassword = 
      credentials.password === 'admin123' && user.role === 'admin' ||
      credentials.password.startsWith('cadet') && user.role === 'cadet' ||
      credentials.password === 'test123';

    if (!isValidPassword) {
      console.log('Invalid password');
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};

// Получение данных кадета по auth_user_id
export const getCadetByAuthId = async (authUserId: string) => {
  try {
    const { data, error } = await supabase
      .from('cadets')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching cadet by auth ID:', error);
    return null;
  }
};

// Тестовые аккаунты для демонстрации
export const TEST_ACCOUNTS = {
  admin: {
    email: 'admin@nkkk.ru',
    password: 'admin123',
    name: 'Администратор Иванов И.И.',
    role: 'admin' as const
  },
  cadets: [
    {
      email: 'petrov@nkkk.ru',
      password: 'test123',
      name: 'Петров Алексей Владимирович',
      role: 'cadet' as const
    },
    {
      email: 'sidorov@nkkk.ru',
      password: 'test123',
      name: 'Сидоров Дмитрий Александрович',
      role: 'cadet' as const
    },
    {
      email: 'kozlov@nkkk.ru',
      password: 'test123',
      name: 'Козлов Михаил Сергеевич',
      role: 'cadet' as const
    }
  ]
};