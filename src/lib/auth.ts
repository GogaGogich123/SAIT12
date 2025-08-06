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
      role: 'cadet' as const,
      cadetId: '1'
    },
    {
      email: 'sidorov@nkkk.ru',
      password: 'test123',
      name: 'Сидоров Дмитрий Александрович',
      role: 'cadet' as const,
      cadetId: '2'
    },
    {
      email: 'kozlov@nkkk.ru',
      password: 'test123',
      name: 'Козлов Михаил Сергеевич',
      role: 'cadet' as const,
      cadetId: '3'
    }
  ]
};

// Простая аутентификация с тестовыми аккаунтами
export const authenticateUser = async (credentials: LoginCredentials): Promise<AuthUser | null> => {
  try {
    console.log('Attempting to authenticate:', credentials.email);
    
    // Проверяем админа
    if (credentials.email === TEST_ACCOUNTS.admin.email && 
        credentials.password === TEST_ACCOUNTS.admin.password) {
      console.log('Admin authenticated successfully');
      return {
        id: 'admin-1',
        email: TEST_ACCOUNTS.admin.email,
        role: 'admin',
        name: TEST_ACCOUNTS.admin.name
      };
    }
    
    // Проверяем кадетов
    const cadet = TEST_ACCOUNTS.cadets.find(c => 
      c.email === credentials.email && c.password === credentials.password
    );
    
    if (cadet) {
      console.log('Cadet authenticated successfully:', cadet.name);
      return {
        id: cadet.cadetId,
        email: cadet.email,
        role: 'cadet',
        name: cadet.name
      };
    }
    
    console.log('Authentication failed: invalid credentials');
    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};

// Получение данных кадета по ID
export const getCadetByAuthId = async (authUserId: string) => {
  try {
    console.log('Getting cadet by auth ID:', authUserId);
    
    // Для тестовых аккаунтов возвращаем соответствующие данные
    const cadet = TEST_ACCOUNTS.cadets.find(c => c.cadetId === authUserId);
    if (cadet) {
      const { data, error } = await supabase
        .from('cadets')
        .select('*')
        .eq('id', authUserId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Supabase error:', error);
      }
      
      // Возвращаем данные из базы или моковые данные
      return data || {
        id: authUserId,
        name: cadet.name,
        platoon: '10-1',
        squad: 1,
        rank: parseInt(authUserId),
        total_score: 275 - (parseInt(authUserId) - 1) * 7,
        avatar_url: `https://images.pexels.com/photos/104347${authUserId}/pexels-photo-104347${authUserId}.jpeg?w=200`,
        join_date: '2023-09-01'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching cadet by auth ID:', error);
    return null;
  }
};